// File: app/api/dashboard/employee/route.ts
// Path: /app/api/dashboard/employee/route.ts
// Description: Get all employees - FIXED

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔍 Employee API called')
    
    const supabase = await createClient()
    
    // Step 1: Get employee role ID from roles table
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'employee')
      .maybeSingle()

    if (roleError) {
      console.error('❌ Role error:', roleError)
      return NextResponse.json(
        { error: 'Failed to fetch employee role' },
        { status: 500 }
      )
    }

    if (!roleData) {
      console.log('⚠️ Employee role not found')
      return NextResponse.json({ employees: [] })
    }

    const employeeRoleId = roleData.id
    console.log('✅ Employee role ID:', employeeRoleId)

    // Step 2: Get all user_ids with employee role from user_roles
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_id', employeeRoleId)

    if (userRolesError) {
      console.error('❌ User roles error:', userRolesError)
      return NextResponse.json(
        { error: 'Failed to fetch user roles' },
        { status: 500 }
      )
    }

    console.log('📦 User roles found:', userRoles?.length || 0)

    if (!userRoles || userRoles.length === 0) {
      console.log('⚠️ No users with employee role found')
      return NextResponse.json({ employees: [] })
    }

    // Get user IDs
    const userIds = userRoles.map((ur: any) => ur.user_id)
    console.log('📦 Employee user IDs:', userIds)

    // Step 3: Get profiles for these user IDs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)
      .order('full_name', { ascending: true })

    if (profilesError) {
      console.error('❌ Profiles error:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    console.log(`📦 Found ${profiles?.length || 0} profiles for employees`)

    // Step 4: Format the response
    const employees = profiles.map((profile: any) => ({
      id: profile.id,
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      is_active: profile.is_active ?? true,
      address: profile.address || null,
      city: profile.city || null,
      driver_zone: profile.driver_zone || null,
      preferred_language: profile.preferred_language || 'fr',
      created_at: profile.created_at
    }))

    console.log(`✅ Found ${employees.length} employees:`, employees.map(e => e.full_name))
    return NextResponse.json({ employees })
  } catch (error) {
    console.error('❌ Employee API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}