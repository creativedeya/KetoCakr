// ===========================================================
// FILE: admin/lib/supabase.ts
// ===========================================================
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Client-side (for client components)
export function createClientComponentClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server-side (for API routes and server actions)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}