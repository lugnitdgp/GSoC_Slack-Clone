
import { createClient } from '@supabase/supabase-js'
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYnp5ZHd5YW9zamFzbHVsdHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMzUzMDMsImV4cCI6MjAzMTgxMTMwM30.7E9_y1Jw-HuahCCVLP_WT3u-0AUHLjCV7_xNNyoTWsk'
const supabaseUrl = 'https://kibzydwyaosjaslultsq.supabase.co'
const supabaseKey = SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase
