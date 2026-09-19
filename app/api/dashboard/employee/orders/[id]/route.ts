// File: app/api/dashboard/orders/[id]/assign/route.ts
// Path: /app/api/dashboard/orders/[id]/assign/route.ts
// Description: Assign driver to order

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

  export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('🔍 [Employee Order API] Fetching order:', id)

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 1. Fetch the order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          id,
          product_name,
          quantity,
          unit_price,
          total_price,
          variant_name
        )
      `)
      .eq('id', id)
      .single()

    if (orderError) {
      console.error('❌ [Employee Order API] Error:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('📦 [Employee Order API] Items found:', order.items?.length || 0)

    // 2. Fetch customer info from profiles or guest info
    let customer = null
    if (order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, address, city')
        .eq('id', order.user_id)
        .single()
      
      if (profile) {
        customer = profile
      }
    }

    // 3. Fetch driver info if assigned
    let driver = null
    if (order.delivery_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, phone, driver_zone')
        .eq('id', order.delivery_id)
        .single()
      
      if (profile) {
        driver = profile
      }
    }

    // 4. Fetch employee info (who prepared the order)
    let employee = null
    if (order.assigned_to) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', order.assigned_to)
        .single()
      
      if (profile) {
        employee = profile
      }
    }

    const response = {
      ...order,
      customer: customer || {
        full_name: order.guest_name || 'Client',
        phone: order.guest_phone || '',
        address: order.address_line1,
        city: order.city
      },
      driver: driver,
      employee: employee,
      items: order.items || []  // 🔥 Ensure items is always an array
    }

    console.log('✅ [Employee Order API] Order found:', {
      orderNumber: response.order_number,
      status: response.status,
      itemsCount: response.items?.length || 0
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ [Employee Order API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: orderId } = await context.params
    
    console.log('🔧 [Assign Driver API] Order ID:', orderId)
    
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()
    const { driverId } = body

    console.log('🚗 [Assign Driver API] Driver ID:', driverId)

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      )
    }

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ [Assign Driver API] Order not found:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if driver exists
    const { data: driver, error: driverError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', driverId)
      .maybeSingle()

    if (driverError || !driver) {
      console.error('❌ [Assign Driver API] Driver not found:', driverError)
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    console.log('🚗 [Assign Driver API] Driver found:', driver.full_name)

    // Update order with driver ID and status
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        delivery_id: driverId,
        status: 'in_transit',
        delivery_assigned_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('❌ [Assign Driver API] Update error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to assign driver' },
        { status: 500 }
      )
    }

    console.log('✅ [Assign Driver API] Driver assigned:', driver.full_name)
    return NextResponse.json({
      ...data,
      driver_name: driver.full_name
    })
  } catch (error) {
    console.error('❌ [Assign Driver API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign driver' },
      { status: 500 }
    )
  }
}