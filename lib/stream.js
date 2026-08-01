// lib/stream.js
// Cloudflare Stream — direct creator uploads. Our server mints a one-time
// upload URL with the Stream API token; the browser PUTs the video bytes
// straight to Cloudflare (they never touch Vercel). We keep only the
// returned video UID on the post.
//
// Server-only: reads the Stream token from the environment.

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN;

// Cap how long a single clip can be — a light abuse/cost guard on stored
// minutes. Cloudflare requires maxDurationSeconds on direct uploads.
const MAX_DURATION_SECONDS = 600; // 10 minutes

export function streamConfigured() {
  return !!(ACCOUNT_ID && STREAM_TOKEN);
}

// Ask Cloudflare for a one-time upload URL. Returns { uploadURL, uid }.
export async function createDirectUpload() {
  if (!streamConfigured()) throw new Error('Stream not configured');

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/direct_upload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STREAM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxDurationSeconds: MAX_DURATION_SECONDS,
        requireSignedURLs: false,
      }),
    },
  );

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const msg = json?.errors?.[0]?.message || `status ${res.status}`;
    throw new Error(`Stream direct_upload failed: ${msg}`);
  }
  return { uploadURL: json.result.uploadURL, uid: json.result.uid };
}

// A Stream video UID is url-safe base16-ish (32 hex chars in practice). Keep
// the validation loose but strict enough that a post can't carry junk.
export function isValidUid(uid) {
  return typeof uid === 'string' && /^[a-f0-9]{20,40}$/i.test(uid);
}
