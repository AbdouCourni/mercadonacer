// File: app/api/dashboard/users/route.ts
// Path: /app/api/dashboard/users/route.ts
// Description: Get all users for admin dashboard - SIMPLIFIED

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔍 Users API called')
    
    const supabase = await createClient()
    
    // 🔥 Get all profiles (this is simpler and more reliable)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('❌ Profiles error:', profilesError)
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${profiles?.length || 0} profiles`)

    // Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        roles (
          name
        )
      `)

    if (rolesError) {
      console.error('❌ Roles error:', rolesError)
    }

    // Create role map
    const roleMap = new Map()
    if (userRoles) {
      userRoles.forEach((ur: any) => {
        if (ur.roles) {
          roleMap.set(ur.user_id, ur.roles.name)
        }
      })
    }

    // Format users
    const users = profiles.map((profile: any) => ({
      id: profile.id,
      email: profile.email || '',
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      city: profile.city || '',
      address: profile.address || '',
      role: roleMap.get(profile.id) || 'client',
      is_active: profile.is_active !== undefined ? profile.is_active : true,
      points: profile.points || 0,
      created_at: profile.created_at
    }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error('❌ Users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}