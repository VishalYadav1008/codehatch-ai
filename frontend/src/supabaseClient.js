import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dpkhytntovdupyppkgdc.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY // Supabase dashboard → Settings → API

export const supabase = createClient(supabaseUrl, supabaseKey)