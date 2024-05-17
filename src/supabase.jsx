
import { createClient } from '@supabase/supabase-js'
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZGhyZXh0cmhhdGl6Z2tja2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU5NzE2MjQsImV4cCI6MjAzMTU0NzYyNH0.1Ihh4140latvO-SexAZptQsmIJrQuJbz4tqZqRRqxXg'
const supabaseUrl = 'https://lsdhrextrhatizgkckie.supabase.co'
const supabaseKey = SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase
