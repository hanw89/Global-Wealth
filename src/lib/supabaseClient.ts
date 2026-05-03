import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * 
 * Accesses environment variables based on the current build tool.
 * - Vite uses: import.meta.env.VITE_...
 * - Next.js uses: process.env.NEXT_PUBLIC_...
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Credentials Missing: Please check your .env.local file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
