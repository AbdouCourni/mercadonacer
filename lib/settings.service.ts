// File: lib/settings.server.ts
// Path: /lib/settings.server.ts
// Description: Server-side settings fetch (for server components)

import { createClient } from '@/lib/supabase/server'
import { Settings } from '@/types/settings.types'

export async function getServerSettings(): Promise<Settings | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching settings (server):', error)
    return null
  }
  
  return data
}