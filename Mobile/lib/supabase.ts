// ===========================================================
// FILE: mobile/lib/supabase.ts
// Supabase client with Web support
// ===========================================================
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { storage } from './storage-polyfill';

const supabaseUrl = 'https://bvnmsiritbqypnnxadnl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bm1zaXJpdGJxeXBubnhhZG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjA5OTUsImV4cCI6MjA3OTg5Njk5NX0.XDxX5x8p8C59dOlAogKaMm3lYa2FW47nIf4O09onLvU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});












