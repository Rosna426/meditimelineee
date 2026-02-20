/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://jrksurqtennacxmotgzq.supabase.co'
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impya3N1cnF0ZW5uYWN4bW90Z3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDA3NjksImV4cCI6MjA4NzE3Njc2OX0.Z-qRiDecrRlWTBFOuI9r7u6i4kt3GEv9SYZixUC-tGI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const projectId = 'jrksurqtennacxmotgzq'
export const publicAnonKey = supabaseAnonKey
