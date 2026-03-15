import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sbznfkykgvnpoorvpkis.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiem5ma3lrZ3ZucG9vcnZwa2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODcwNzQsImV4cCI6MjA4OTE2MzA3NH0.0n7lOcoayFIWoenud9sNhYDQFKlngck2iIGuYyv1SPM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
