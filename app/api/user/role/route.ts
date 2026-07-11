// File: app/api/user/role/route.ts
// Path: /app/api/user/role/route.ts
// Description: Get current user role - FIXED

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔍 Role API called')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ User error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!user) {
      console.log('❌ No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 User found:', user.email)
    console.log('👤 User ID:', user.id)

    // 🔥 FIX: Get user's role using a simpler query
    const { data: userRoleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('📊 User role data:', userRoleData)
    console.log('📊 Role error:', roleError)

    let role = 'user'
    
    if (userRoleData && userRoleData.role_id) {
      // Get the role name from roles table
      const { data: roleData, error: roleNameError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', userRoleData.role_id)
        .maybeSingle()

      console.log('📊 Role name data:', roleData)
      console.log('📊 Role name error:', roleNameError)

      if (roleData && roleData.name) {
        role = roleData.name
      }
    }

    console.log('✅ Returning role:', role)
    return NextResponse.json({ role })
  } catch (error) {
    console.error('❌ Role API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    )
  }
}