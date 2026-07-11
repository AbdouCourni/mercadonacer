// File: app/api/dashboard/users/[id]/toggle/route.ts
// Path: /app/api/dashboard/users/[id]/toggle/route.ts
// Description: Toggle user active status - USING SERVICE ROLE

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: userId } = await context.params
    
    console.log('🔧 Toggle user called for:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { is_active } = body

    console.log('🔧 Setting is_active to:', is_active)

    // 🔥 Use service role client (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,  // ← Service role key
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Update or insert profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        is_active: is_active,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Upsert error:', error)
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    console.log('✅ User status updated:', data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('❌ Toggle user error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle user' },
      { status: 500 }
    )
  }
}