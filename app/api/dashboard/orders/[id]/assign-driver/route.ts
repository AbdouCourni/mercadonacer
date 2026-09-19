// File: app/api/dashboard/orders/[id]/assign-driver/route.ts
// Path: /app/api/dashboard/orders/[id]/assign-driver/route.ts
// Description: Assign driver to deliver order

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

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

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      )
    }

    // Check if order exists and is ready
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ [Assign Driver] Order not found:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order is ready to be assigned to driver
    if (order.status !== 'ready' && order.status !== 'assigned') {
      return NextResponse.json(
        { error: `Order must be ready or assigned to assign a driver. Current status: ${order.status}` },
        { status: 400 }
      )
    }

    // Check if driver exists and has driver role
    const { data: driver, error: driverError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, driver_zone')
      .eq('id', driverId)
      .maybeSingle()

    if (driverError || !driver) {
      console.error('❌ [Assign Driver] Driver not found:', driverError)
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    // Update order with driver
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        delivery_id: driverId,
        status: 'in_transit',  // Auto-update to in_transit
        in_transit_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('❌ [Assign Driver] Update error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to assign driver' },
        { status: 500 }
      )
    }

    console.log(`✅ [Assign Driver] Driver assigned: ${driver.full_name}`)
    return NextResponse.json({
      success: true,
      message: `Driver ${driver.full_name} assigned successfully`,
      order: data,
      driver: driver
    })
  } catch (error) {
    console.error('❌ [Assign Driver] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign driver' },
      { status: 500 }
    )
  }
}