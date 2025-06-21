import { createClient } from '@supabase/supabase-js'

const db = createClient(process.env.SUPABASE_PROJECT_URL!, process.env.SUPABASE_ANON_KEY!)

export default db