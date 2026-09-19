// File: app/api/dashboard/driver/orders/[id]/status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    console.log('🚚 [Driver Status] Order ID:', id)

    const supabase = await createClient()

    // ✅ Get logged driver
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('👤 Driver ID:', user.id)

    // ✅ 1. Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, delivery_id')
      .eq('id', id)
      .single()

    console.log('📦 Order fetched:', order)

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // ✅ 2. Check if this driver is assigned
    if (order.delivery_id !== user.id) {
      return NextResponse.json(
        { error: 'This order is not assigned to you' },
        { status: 403 }
      )
    }

    // ✅ 3. Get new status
    const body = await request.json()
    const { status: newStatus } = body

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Driver transition:', order.status, '→', newStatus)

    // ✅ 4. Allowed transitions
    const validTransitions: Record<string, string[]> = {
      in_transit: ['delivered']
    }

    if (!validTransitions[order.status]?.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid transition ${order.status} → ${newStatus}` },
        { status: 400 }
      )
    }

    // ✅ 5. Update order
    const updateData: any = { status: newStatus }

    if (newStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Driver update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log('✅ Order delivered:', updatedOrder.id)

    return NextResponse.json({
      success: true,
      message: 'Order marked as delivered',
      order: updatedOrder
    })

  } catch (error) {
    console.error('❌ Driver status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}