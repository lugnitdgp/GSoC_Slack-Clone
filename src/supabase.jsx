
import { createClient } from '@supabase/supabase-js'
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnY2h1cnZkY2h6bW5mdGJrb25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYwNjM4OTUsImV4cCI6MjAzMTYzOTg5NX0.UMdIu4tNDvB-X3B0TwUSqeTm8651bq3PODBPDyWuN5E'
const supabaseUrl = 'https://ygchurvdchzmnftbkonc.supabase.co'
const supabaseKey = SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase
