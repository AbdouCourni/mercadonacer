// File: app/api/dashboard/employee/orders/[id]/status/route.ts
// Path: /app/api/dashboard/employee/orders/[id]/status/route.ts
// Description: Employee updates order status (assigned → preparing → ready) with ultimate total and delivery code

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    console.log('📦 Order ID from params:', id)

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 Employee:', user.id)

    // Fetch order
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, assigned_to, total, subtotal, delivery_fee, tax')
      .eq('id', id)
      .single()

    console.log('📦 Order fetched:', order)

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check assignment
    if (order.assigned_to !== user.id) {
      return NextResponse.json(
        { error: 'Not your order' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      status, 
      preparation_notes, 
      has_missing_items, 
      missing_items_note,
      ultimate_total,
      delivery_code
    } = body

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      assigned: ['preparing'],
      preparing: ['ready']
    }

    if (!validTransitions[order.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid transition ${order.status} → ${status}` },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = { status }
    const now = new Date().toISOString()

    // Set timestamps based on status
    if (status === 'preparing') {
      updateData.preparing_at = now
    }
    
    if (status === 'ready') {
      updateData.ready_at = now
      
      // ✅ SAVE ULTIMATE TOTAL AND DELIVERY CODE WHEN MARKING AS READY
      if (ultimate_total !== undefined && ultimate_total !== null) {
        updateData.ultimate_total = ultimate_total
        updateData.ultimate_total_calculated_at = now
      }
      
      if (delivery_code) {
        updateData.delivery_code = delivery_code
      }
    }

    // Save preparation notes if provided
    if (preparation_notes) {
      updateData.preparation_notes = preparation_notes
    }

    // Save missing items info
    if (has_missing_items !== undefined) {
      updateData.has_missing_items = has_missing_items
    }
    
    if (missing_items_note !== undefined) {
      updateData.missing_items_note = missing_items_note
    }

    // Update the order
    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Update error:', updateError)
      return NextResponse.json(
        { error: 'Update failed' },
        { status: 500 }
      )
    }

    console.log('✅ Order updated:', updated)

    return NextResponse.json({
      success: true,
      order: updated
    })

  } catch (error) {
    console.error('❌ PATCH ERROR:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}