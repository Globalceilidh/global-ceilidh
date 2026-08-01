// lib/r2.js
// Minimal Cloudflare R2 (S3-compatible) uploader — a single signed PutObject,
// no AWS SDK. R2 speaks the S3 API, so we sign the request with SigV4 using
// Node's built-in crypto and PUT the bytes. Public reads come back off the
// bucket's public dev URL (R2_PUBLIC_BASE).
//
// Server-only: reads the R2 credentials from the environment. Never import
// into a client component.

import { createHash, createHmac } from 'crypto';

const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const ENDPOINT = process.env.R2_ENDPOINT;        // https://<account>.r2.cloudflarestorage.com
const BUCKET = process.env.R2_BUCKET;            // gc-media
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE;  // https://pub-….r2.dev
const REGION = 'auto';
const SERVICE = 's3';

// True only when every piece of R2 config is present. Callers fall back to
// Supabase Storage when this is false, so a deploy missing the env doesn't
// break uploads.
export function r2Configured() {
  return !!(ACCESS_KEY && SECRET_KEY && ENDPOINT && BUCKET && PUBLIC_BASE);
}

const sha256hex = (data) => createHash('sha256').update(data).digest('hex');
const hmac = (key, data) => createHmac('sha256', key).update(data).digest();

// Upload a buffer under `key` (e.g. "posts/<user>/<uuid>.jpg"). Returns the
// public URL. Throws on a non-2xx response.
export async function putObject(key, body, contentType) {
  if (!r2Configured()) throw new Error('R2 not configured');

  const url = new URL(`${ENDPOINT}/${BUCKET}/${key}`);
  const host = url.host;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256hex(body);

  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const canonicalRequest = [
    'PUT', url.pathname, '', canonicalHeaders, signedHeaders, payloadHash,
  ].join('\n');

  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, scope, sha256hex(canonicalRequest),
  ].join('\n');

  const kDate = hmac(`AWS4${SECRET_KEY}`, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      Authorization: authorization,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`R2 put failed ${res.status}: ${text.slice(0, 300)}`);
  }

  return `${PUBLIC_BASE}/${key}`;
}
