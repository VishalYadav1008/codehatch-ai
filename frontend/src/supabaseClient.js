import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dpkhytntovdupyppkgdc.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

export const supabase = createClient(supabaseUrl, supabaseKey)