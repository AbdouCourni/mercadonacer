// File: app/api/dashboard/orders/[id]/route.ts
// Path: /app/api/dashboard/orders/[id]/route.ts
// Description: Get single order with employee info

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: orderId } = await context.params
    
    console.log('🔍 [Order Detail API] Order ID:', orderId)
    
    await requireManager()

    const supabase = await createClient()

    // Get order with items
    const { data, error } = await supabase
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
      .eq('id', orderId)
      .maybeSingle()

    if (error) {
      console.error('❌ [Order Detail API] Error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 🔥 Get assigned employee name if exists
    let assignedEmployeeName = null
    if (data.assigned_to) {
      const { data: employee } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', data.assigned_to)
        .maybeSingle()
      
      assignedEmployeeName = employee?.full_name || null
    }

    console.log('✅ [Order Detail API] Order found:', data.order_number)
    return NextResponse.json({
      ...data,
      assigned_employee_name: assignedEmployeeName
    })
  } catch (error) {
    console.error('❌ [Order Detail API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}