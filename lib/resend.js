// lib/resend.js
// Reads the Resend API key out of the environment, defensively.
//
// Why this exists: on 2026-08-17 the key was re-set through a PowerShell pipe,
// which prefixed the stored value with a BOM (U+FEFF). "Bearer <BOM>re_..." is
// not a legal HTTP header value, so building the Authorization header threw a
// TypeError *before* any request was made - the send never reached Resend at
// all. Both /api/contact and /api/subscribe fell into their generic 500 catch,
// so the contact form silently swallowed real visitors' messages for a day.
//
// A pasted secret picking up a BOM, a trailing newline or stray whitespace is a
// paste accident, not a different key. Strip it rather than let the whole
// messaging path die on it. trim() is enough on its own here: ECMAScript counts
// U+FEFF (ZWNBSP) as whitespace, so it takes the BOM off with the rest.
export function resendKey() {
  const raw = process.env.RESEND_API_KEY;
  return raw ? raw.trim() : '';
}
