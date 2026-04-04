import { createClient } from '@supabase/supabase-js'

// Vite uses import.meta.env for variables prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Safety check for your console
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing! Make sure they are in your .env file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)