import { createClient } from '@supabase/supabase-js'

export const supabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '', // Use service role key for backend
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
