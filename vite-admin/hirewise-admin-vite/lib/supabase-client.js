// lib/supabase-client.js
// src/lib/supabase-client.js

import { createClient } from '@supabase/supabase-js'

// ⚠️ Hardcoded values (OK for dev, not for public prod)
const supabaseUrl = 'https://dgefgxcxyyflxklptyln.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZWZneGN4eXlmbHhrbHB0eWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDg4MjgsImV4cCI6MjA3MzU4NDgyOH0.IbnN_ow5AFxWbIzS9jq2JArPUlFlt46qUru_4Mmm_Pk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'hiring-portal'
    }
  },
  db: {
    schema: 'public'
  }
})

