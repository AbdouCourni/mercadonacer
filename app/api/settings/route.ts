// File: app/api/settings/route.ts
// Path: /app/api/settings/route.ts
// Description: Settings API for public + admin access

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================
// GET - Fetch settings (public)
// ============================================

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// PUT - Update settings (admin only)
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check admin role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles!inner (name)
      `)
      .eq('user_id', user.id)
      .single()
    
    if (roleError || !userRole) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 404 }
      )
    }
    
    const userRoleName = Array.isArray(userRole.roles)
      ? userRole.roles[0]?.name
      : (userRole.roles as any)?.name
    
    if (!['superadmin', 'admin'].includes(userRoleName)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
    
    // Get settings row
    const { data: existing, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .maybeSingle()
    
    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      )
    }
    
    // Parse updates
    const updates = await request.json()
    
    // Update settings
    const { data, error } = await supabase
      .from('settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, settings: data })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}