// File: app/api/dashboard/driver/orders/[id]/route.ts
// Path: /app/api/dashboard/driver/orders/[id]/route.ts
// Description: Get single order for driver

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise
) {
  try {
    const { id: orderId } = await params
    
    console.log('🔍 [Driver Order Detail API] Order ID:', orderId)
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get order and verify it's assigned to this driver
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
      .eq('delivery_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('❌ [Driver Order Detail API] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Order not found or not assigned to you' },
        { status: 404 }
      )
    }

    console.log('✅ [Driver Order Detail API] Order found:', data.order_number)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [Driver Order Detail API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}