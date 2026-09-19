// File: app/api/dashboard/orders/[id]/unassign-driver/route.ts
// Path: /app/api/dashboard/orders/[id]/unassign-driver/route.ts
// Description: Unassign driver from order

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: orderId } = await context.params
    
    console.log('🔧 [Unassign Driver API] Order ID:', orderId)
    
    await requireManager()

    const supabase = await createClient()

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ [Unassign Driver] Order not found:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Unassign driver from order
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        delivery_id: null,
        status: 'ready'  // Revert to ready
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('❌ [Unassign Driver] Update error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to unassign driver' },
        { status: 500 }
      )
    }

    console.log(`✅ [Unassign Driver] Driver unassigned from order ${order.order_number}`)
    return NextResponse.json({
      success: true,
      message: 'Driver unassigned successfully',
      order: data
    })
  } catch (error) {
    console.error('❌ [Unassign Driver] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unassign driver' },
      { status: 500 }
    )
  }
}