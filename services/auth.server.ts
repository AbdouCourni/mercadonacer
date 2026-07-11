// File: services/auth.server.ts
// Path: /services/auth.server.ts
// Description: Server-side auth helpers

import { createClient } from '@/lib/supabase/server'

export async function getServerUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentUserRole() {
  const user = await getServerUser()
  if (!user) return 'user'

  const supabase = await createClient()
  
  const { data: userRoleData } = await supabase
    .from('user_roles')
    .select(`
      roles!inner (
        name
      )
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!userRoleData) return 'user'
  
  const role = (userRoleData as any).roles?.name || 'user'
  return role
}