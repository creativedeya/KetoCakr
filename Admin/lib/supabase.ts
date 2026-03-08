// admin/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client components
export function createClientComponentClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// For server components
export function createServerComponentClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}