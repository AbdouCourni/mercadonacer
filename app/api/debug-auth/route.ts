// File: app/api/debug-auth/route.ts
// Path: /app/api/debug-auth/route.ts
// Description: Debug auth to see what getUser() returns

import { NextResponse } from 'next/server'
import { getUser } from '@/services/auth.service'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Method 1: Using getUser() from auth.service
    const userFromService = await getUser()
    
    // Method 2: Direct Supabase call
    const supabase = await createClient()
    const { data: { user: userFromSupabase } } = await supabase.auth.getUser()
    
    // Method 3: Check session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Method 4: Get role directly
    let roleData = null
    if (userFromSupabase) {
      const { data } = await supabase
        .from('user_roles')
        .select('roles!inner(name)')
        .eq('user_id', userFromSupabase.id)
        .maybeSingle()
      roleData = data
    }

    return NextResponse.json({
      userFromService: userFromService?.email || null,
      userFromSupabase: userFromSupabase?.email || null,
      hasSession: !!session,
      sessionUser: session?.user?.email || null,
      roleData: roleData,
      // Show what the role data structure looks like
      roleExtraction: roleData ? {
        raw: roleData,
        roles: (roleData as any)?.roles,
        name: (roleData as any)?.roles?.name,
        isArray: Array.isArray((roleData as any)?.roles)
      } : null
    })
  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}