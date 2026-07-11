// File: app/api/dashboard/orders/[id]/assign/route.ts
// Path: /app/api/dashboard/orders/[id]/assign/route.ts
// Description: Assign delivery driver to order

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Get driver info
    const { data: driver } = await supabase
      .from('delivery_drivers')
      .select('full_name, phone')
      .eq('id', driverId)
      .single()

    // Update order with driver ID and status
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        delivery_id: driverId,
        status: 'assigned',
        delivery_assigned_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Update driver availability
    await supabase
      .from('delivery_drivers')
      .update({ is_available: false })
      .eq('id', driverId)

    return NextResponse.json({
      ...data,
      driver: driver
    })
  } catch (error) {
    console.error('Assign driver error:', error)
    return NextResponse.json(
      { error: 'Failed to assign driver' },
      { status: 500 }
    )
  }
}