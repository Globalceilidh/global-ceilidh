import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service-role client for server-side writes that bypass RLS.
// SUPABASE_SERVICE_ROLE_KEY is NOT prefixed NEXT_PUBLIC — it never
// ships to the browser bundle. Only importable in API routes / server
// components. Used for the /radio metrics writer.
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false, autoRefreshToken: false } }
);