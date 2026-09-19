// File: app/api/dashboard/orders/[id]/unassign-employee/route.ts
// Path: /app/api/dashboard/orders/[id]/unassign-employee/route.ts
// Description: Unassign employee from order

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: orderId } = await context.params
    
    console.log('🔧 [Unassign Employee API] Order ID:', orderId)
    
    await requireManager()

    const supabase = await createClient()

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ [Unassign Employee] Order not found:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Unassign employee from order
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        assigned_to: null,
        assigned_at: null,
        status: 'confirmed'  // Revert status
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('❌ [Unassign Employee] Update error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to unassign employee' },
        { status: 500 }
      )
    }

    console.log(`✅ [Unassign Employee] Employee unassigned from order ${order.order_number}`)
    return NextResponse.json({
      success: true,
      message: 'Employee unassigned successfully',
      order: data
    })
  } catch (error) {
    console.error('❌ [Unassign Employee] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unassign employee' },
      { status: 500 }
    )
  }
}