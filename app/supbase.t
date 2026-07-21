import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://dwfxvrmujekklftafhjo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Znh2cm11amVra2xmdGFmaGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTM4MjYsImV4cCI6MjA5OTk2OTgyNn0.4jWlQdnS51Bz4ZbB27abgkhOFE3fCjBpSvjgZ9c0SAE'
)