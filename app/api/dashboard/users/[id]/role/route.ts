// File: app/api/dashboard/users/[id]/role/route.ts
// Path: /app/api/dashboard/users/[id]/role/route.ts
// Description: Update user role - FIXED PARAMS

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('🔧 API called with userId:', id)

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { role } = body

    console.log('🔧 Updating role for user:', id, 'to:', role)

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1. Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single()

    if (roleError || !roleData) {
      console.error('❌ Role not found:', role)
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    console.log('📊 Role ID:', roleData.id)

    // 2. Check if user already has a role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id, role_id')
      .eq('user_id', id)
      .maybeSingle()

    let result

    if (existingRole) {
      // ✅ UPDATE existing role
      console.log('🔄 Updating existing role for user:', id)
      const { data, error } = await supabase
        .from('user_roles')
        .update({ role_id: roleData.id })
        .eq('user_id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update error:', error)
        return NextResponse.json(
          { error: 'Failed to update role' },
          { status: 500 }
        )
      }
      result = data
    } else {
      // ✅ INSERT new role (if no role exists)
      console.log('📝 Creating new role for user:', id)
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: id,
          role_id: roleData.id
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Insert error:', error)
        return NextResponse.json(
          { error: 'Failed to assign role' },
          { status: 500 }
        )
      }
      result = data
    }

    console.log('✅ Role updated successfully:', result)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('❌ Role update error:', error)
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}