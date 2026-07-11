// File: app/api/admin/assign-role/route.ts
// Path: /app/api/admin/assign-role/route.ts
// Description: Assign role to user (Admin only)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/services/rbac.service'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { userId, roleName } = body

    if (!userId || !roleName) {
      return NextResponse.json(
        { error: 'User ID and role name are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get role id
    const { data: role, error: roleError } = await (await supabase)
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single()

    if (roleError) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    // Delete existing role assignments
    await (await supabase)
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    // Assign new role
    const { error } = await (await supabase)
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: role.id
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error assigning role:', error)
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    )
  }
}