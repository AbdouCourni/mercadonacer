// File: app/api/dashboard/drivers/[id]/route.ts
// Path: /app/api/dashboard/drivers/[id]/route.ts
// Description: Single driver management API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

// GET - Get single driver
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireManager()

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('delivery_drivers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Driver fetch error:', error)
    return NextResponse.json(
      { error: 'Driver not found' },
      { status: 404 }
    )
  }
}

// PATCH - Update driver
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('delivery_drivers')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Driver update error:', error)
    return NextResponse.json(
      { error: 'Failed to update driver' },
      { status: 500 }
    )
  }
}

// DELETE - Delete driver
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireManager()

    const supabase = await createClient()
    const { error } = await supabase
      .from('delivery_drivers')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Driver delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete driver' },
      { status: 500 }
    )
  }
}