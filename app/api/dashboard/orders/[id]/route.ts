// File: app/api/dashboard/orders/[id]/route.ts
// Path: /app/api/dashboard/orders/[id]/route.ts
// Description: Get order by ID for dashboard

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔥 RAW PARAM:', params.id)

    // 🔥 IMPORTANT: Require admin/manager role
    await requireManager()

    const supabase = await createClient()
    
    // Clean the ID
    const cleanId = decodeURIComponent(params.id).trim()
    console.log('🧹 Cleaned ID:', cleanId)

    // First, check if it's a UUID (dashboard uses UUID)
    // or if it's an order number (ORD-2026-XXXX)
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)

    // Check if it's an order number (starts with ORD-)
    if (cleanId.startsWith('ORD-')) {
      query = query.eq('order_number', cleanId)
    } else {
      // Otherwise treat as UUID
      query = query.eq('id', cleanId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    if (!data) {
      console.error('❌ Not found for:', cleanId)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('✅ Order found:', data.order_number)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error fetching order:', error)
    return NextResponse.json(
      { error: 'Error fetching order' },
      { status: 500 }
    )
  }
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔥 PATCH PARAM:', params.id)

    await requireManager()

    const supabase = await createClient()
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const cleanId = decodeURIComponent(params.id).trim()

    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', cleanId)
      .select()
      .single()

    if (error) {
      console.error('❌ Update error:', error)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log('✅ Order updated:', data.order_number, '→', status)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}