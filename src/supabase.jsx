
import { createClient } from '@supabase/supabase-js'
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcXN6ZWNpbXF5Ymt1anZ6amllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU2MjA3OTksImV4cCI6MjAzMTE5Njc5OX0.c_VwB3VpKcLf-_tsV-1IX95qRzopak5rPstkvIpCPKs'
const supabaseUrl = 'https://yiqszecimqybkujvzjie.supabase.co'
const supabaseKey = SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase
