import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zreesdiazhdbscnqswdf.supabase.co' // ganti dengan project kamu
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZWVzZGlhemhkYnNjbnFzd2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzI3NDMsImV4cCI6MjA2ODY0ODc0M30.w5wK-QZrOgrjoxc3JaJfqg698OcxB3DlL1Zy_Ujdh-Q' // ganti dengan kunci anon kamu

export const supabase = createClient(supabaseUrl, supabaseKey)
