// File: app/api/dashboard/employee/orders/[id]/status/route.ts
// Path: /app/api/dashboard/employee/orders/[id]/status/route.ts
// Description: Employee updates order status (assigned → preparing → ready)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('👤 User ID:', user.id)

    // Get employee role ID dynamically
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'employee')
      .single()

    if (roleError || !roleData) {
      console.error('❌ Employee role not found:', roleError)
      return NextResponse.json(
        { error: 'Employee role not found in system' },
        { status: 500 }
      )
    }

    const employeeRoleId = roleData.id
    console.log('✅ Employee role ID:', employeeRoleId)

    // Verify user has employee role
  const { data: userRoles } = await supabase
  .from('user_roles')
  .select(`
    role_id,
    roles(name)
  `)
  .eq('user_id', user.id)

const roleNames = userRoles?.map((r: any) => r.roles?.name) || []

console.log('👤 Roles:', roleNames)

if (!roleNames.includes('employee')) {
  return NextResponse.json(
     { error: `Access denied. User is not an employee. Roles: ${roleNames?.join(', ')}` },
    { status: 403 }
  )
}

    console.log('✅ User has employee role')

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, assigned_to')
      .eq('id', params.id)
      .single()

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('📦 Order:', { id: order.id, status: order.status, assigned_to: order.assigned_to })

    // Verify employee is assigned to this order
    if (order.assigned_to !== user.id) {
      console.error('❌ User not assigned to this order. Assigned to:', order.assigned_to)
      return NextResponse.json(
        { error: 'You are not assigned to this order' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status: newStatus } = body

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Status transition:', order.status, '→', newStatus)

    // Define valid status transitions for employee
    const validTransitions: Record<string, string[]> = {
      assigned: ['preparing'],
      preparing: ['ready']
    }

    const allowedTransitions = validTransitions[order.status] || []
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${order.status} to ${newStatus}` },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = { status: newStatus }
    const now = new Date().toISOString()
    
    if (newStatus === 'preparing') {
      updateData.preparing_at = now
    } else if (newStatus === 'ready') {
      updateData.ready_at = now
    }

    // Update the order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Employee status update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    console.log(`✅ Order ${order.id} updated from ${order.status} to ${newStatus}`)

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${newStatus}`
    })

  } catch (error) {
    console.error('❌ Employee status update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}