// app/api/webhooks/clerk/route.js
// ============================================================
// Clerk → Supabase user sync
// Server-side only. Uses service role key — never expose to client.
// This route must exist and be verified before app work begins.
//
// Clerk dashboard setup:
// 1. Go to Clerk Dashboard → Webhooks → Add Endpoint
// 2. URL: https://globalceilidh.com/api/webhooks/clerk
// 3. Subscribe to: user.created, user.updated, user.deleted
// 4. Copy the Signing Secret → CLERK_WEBHOOK_SECRET in .env
//
// Required env vars (server-side only, never in NEXT_PUBLIC_*):
//   CLERK_WEBHOOK_SECRET
//   SUPABASE_SERVICE_ROLE_KEY
//   NEXT_PUBLIC_SUPABASE_URL
// ============================================================

import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

// Service role client — full access, server only
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new Response('Server misconfiguration', { status: 500 })
  }

  // Verify webhook signature from Clerk
  const headerPayload = await headers()
  const svix_id        = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body    = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt

  try {
    evt = wh.verify(body, {
      'svix-id':        svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  const { type, data } = evt
  const supabase = getSupabaseAdmin()

  // ----------------------------------------------------------
  // user.created
  // Inserts a users row. Triggers auto-create spirals + subscription.
  // ----------------------------------------------------------
  if (type === 'user.created') {
    const primaryEmail = data.email_addresses?.find(
      (e) => e.id === data.primary_email_address_id
    )?.email_address ?? null

    const { error } = await supabase
      .from('users')
      .insert({
        clerk_id:      data.id,
        email:         primaryEmail,
        display_name:  [data.first_name, data.last_name].filter(Boolean).join(' ') || null,
        preferred_lang: 'en',
      })

    if (error) {
      // Conflict means user already exists — not a real error
      if (error.code === '23505') {
        console.log('User already exists, skipping insert:', data.id)
        return new Response('OK', { status: 200 })
      }
      console.error('Failed to insert user:', error)
      return new Response('Database error', { status: 500 })
    }

    console.log('User created:', data.id)
    return new Response('OK', { status: 200 })
  }

  // ----------------------------------------------------------
  // user.updated
  // Syncs email and display name. Does not touch clerk_id.
  // ----------------------------------------------------------
  if (type === 'user.updated') {
    const primaryEmail = data.email_addresses?.find(
      (e) => e.id === data.primary_email_address_id
    )?.email_address ?? null

    const { error } = await supabase
      .from('users')
      .update({
        email:        primaryEmail,
        display_name: [data.first_name, data.last_name].filter(Boolean).join(' ') || null,
        last_active:  new Date().toISOString(),
      })
      .eq('clerk_id', data.id)

    if (error) {
      console.error('Failed to update user:', error)
      return new Response('Database error', { status: 500 })
    }

    console.log('User updated:', data.id)
    return new Response('OK', { status: 200 })
  }

  // ----------------------------------------------------------
  // user.deleted
  // Soft approach: mark last_active but do not hard delete.
  // Cascade deletes are configured on the DB for hard delete
  // if you ever need it — run from admin only.
  // ----------------------------------------------------------
  if (type === 'user.deleted') {
    console.log('User deleted event received for:', data.id)
    // For now log only. Implement hard delete policy separately.
    return new Response('OK', { status: 200 })
  }

  // Unknown event type — log and return OK so Clerk doesn't retry
  console.log('Unhandled webhook event type:', type)
  return new Response('OK', { status: 200 })
}
