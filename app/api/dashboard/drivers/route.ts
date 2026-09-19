// File: app/api/dashboard/drivers/route.ts
// Path: /app/api/dashboard/drivers/route.ts
// Description: Get all drivers with role = 'driver'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔍 [Drivers API] Called')
    
    const supabase = await createClient()
    
    // 1. First get the driver role ID from roles table
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'driver')
      .single()

    if (roleError) {
      console.error('❌ [Drivers API] Role error:', roleError)
      return NextResponse.json(
        { error: 'Driver role not found' },
        { status: 500 }
      )
    }

    const driverRoleId = roleData.id
    console.log('✅ [Drivers API] Driver role ID:', driverRoleId)

    // 2. Get all user_roles with driver role
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_id', driverRoleId)

    if (rolesError) {
      console.error('❌ [Drivers API] Error fetching roles:', rolesError)
      return NextResponse.json(
        { error: 'Failed to fetch drivers' },
        { status: 500 }
      )
    }

    console.log('📦 [Drivers API] User roles found:', userRoles?.length || 0)

    if (!userRoles || userRoles.length === 0) {
      console.log('⚠️ [Drivers API] No drivers found')
      return NextResponse.json({ drivers: [] })
    }

    // Get user IDs
    const userIds = userRoles.map((ur: any) => ur.user_id)

    // 3. Get profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, is_active, driver_zone')
      .in('id', userIds)

    if (profilesError) {
      console.error('❌ [Drivers API] Profiles error:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch driver profiles' },
        { status: 500 }
      )
    }

    console.log('📦 [Drivers API] Profiles found:', profiles?.length || 0)

    const drivers = profiles.map((profile: any) => ({
      id: profile.id,
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      is_available: profile.is_active ?? true,
      driver_zone: profile.driver_zone || null,
      is_active: profile.is_active ?? true
    }))

    console.log(`✅ [Drivers API] Returning ${drivers.length} drivers:`, drivers.map(d => d.full_name))
    return NextResponse.json({ drivers })
  } catch (error) {
    console.error('❌ [Drivers API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    )
  }
}