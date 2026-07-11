// File: app/api/dashboard/users/route.ts
// Path: /app/api/dashboard/users/route.ts
// Description: Get all users for admin dashboard

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/services/rbac.service'

export async function GET() {
  try {
    // 🔒 Only admin/superadmin can access
    await requireAdmin()

    const supabase = await createClient()

    // Get all users from auth
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error('Users fetch error:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError)
    }

    // Get all user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        roles:role_id (
          name
        )
      `)

    if (rolesError) {
      console.error('Roles fetch error:', rolesError)
    }

    // Create a map of user_id -> role
    const roleMap = new Map()
    if (userRoles) {
      userRoles.forEach((ur: any) => {
        roleMap.set(ur.user_id, ur.roles?.name || 'client')
      })
    }

    // Create a map of user_id -> profile
    const profileMap = new Map()
    if (profiles) {
      profiles.forEach((p: any) => {
        profileMap.set(p.id, p)
      })
    }

    // Combine data
    const formattedUsers = users.users.map((user: any) => {
      const profile = profileMap.get(user.id) || {}
      return {
        id: user.id,
        email: user.email || '',
        full_name: profile.full_name || user.user_metadata?.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        address: profile.address || '',
        role: roleMap.get(user.id) || 'client',
        is_active: profile.is_active !== undefined ? profile.is_active : true,
        points: profile.points || 0,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }
    })

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}