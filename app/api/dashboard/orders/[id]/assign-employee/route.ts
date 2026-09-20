// File: app/api/dashboard/orders/[id]/assign-employee/route.ts
// Path: /app/api/dashboard/orders/[id]/assign-employee/route.ts
// Description: Assign employee to prepare order

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

export async function POST(
  request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()
    const { employeeId } = body

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      console.error('❌ [Assign Employee] Order not found:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if employee exists and has employee role
    const { data: employee, error: employeeError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', employeeId)
      .maybeSingle()

    if (employeeError || !employee) {
      console.error('❌ [Assign Employee] Employee not found:', employeeError)
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Update order with employee
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        assigned_to: employeeId,
        assigned_at: new Date().toISOString(),
        status: 'assigned'  // Auto-update status to assigned
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ [Assign Employee] Update error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to assign employee' },
        { status: 500 }
      )
    }

    console.log(`✅ [Assign Employee] Employee assigned: ${employee.full_name}`)
    return NextResponse.json({
      success: true,
      message: `Employee ${employee.full_name} assigned successfully`,
      order: data,
      employee: employee
    })
  } catch (error) {
    console.error('❌ [Assign Employee] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign employee' },
      { status: 500 }
    )
  }
}