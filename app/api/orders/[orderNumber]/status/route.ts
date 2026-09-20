// File: app/api/orders/[orderNumber]/status/route.ts
// Path: /app/api/orders/[orderNumber]/status/route.ts
// Description: Update order status by order number

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/services/auth.server'
import { ORDER_STATUS, statusTransitions } from '@/lib/constants/order-status'
import { getCurrentUserRole } from '@/services/rbac.service'

export async function PATCH(
  request: NextRequest,
    { params }: { params: Promise<{ orderNumber: string }> }  // ✅ Promise

) {
  try {
    const { orderNumber } = await params
    const supabase = await createClient()
    const body = await request.json()
    const { status } = body
    

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Get current user
    const user = await getServerUser()
    const userId = user?.id
    const userRole = await getCurrentUserRole()

    // Get current order by order number
    const cleanOrderNumber = decodeURIComponent(orderNumber).trim()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, assigned_to')
      .eq('order_number', cleanOrderNumber)
      .single()

    if (orderError || !order) {
      console.error('❌ Order not found:', cleanOrderNumber)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('📦 Current order:', { status: order.status, assigned_to: order.assigned_to })

    // Check if status transition is allowed
    const allowedTransitions = statusTransitions[order.status as keyof typeof statusTransitions]
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { 
          error: `Cannot transition from ${order.status} to ${status}`,
          allowed: allowedTransitions
        },
        { status: 400 }
      )
    }

    // Role-based validation
    const validRoles: Record<string, string[]> = {
      pending: ['superadmin', 'admin', 'manager'],
      assigned: ['superadmin', 'admin', 'manager'],
      preparing: ['employee'],
      ready: ['employee'],
      confirmed: ['client'],
      delivering: ['superadmin', 'admin', 'manager'],
      delivered: ['driver'],
      cancelled: ['superadmin', 'admin', 'manager']
    }

    const allowedRoles = validRoles[status] || []
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: `Only ${allowedRoles.join(', ')} can change status to ${status}` },
        { status: 403 }
      )
    }

    // For preparing and ready, only the assigned employee can update
    if ((status === 'preparing' || status === 'ready') && order.assigned_to) {
      if (userId !== order.assigned_to) {
        return NextResponse.json(
          { error: 'Only the assigned employee can update this order' },
          { status: 403 }
        )
      }
    }

    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('order_number', cleanOrderNumber)
      .select()
      .single()

    if (error) {
      console.error('❌ Order update error:', error)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log('✅ Order status updated:', { orderNumber: cleanOrderNumber, status })
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}