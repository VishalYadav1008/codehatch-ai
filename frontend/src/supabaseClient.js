import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dpkhytntovdupyppkgdc.supabase.co'
const supabaseKey = 'your-supabase-anon-key' // Supabase dashboard → Settings → API

export const supabase = createClient(supabaseUrl, supabaseKey)