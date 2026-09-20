// File: app/api/delivery/orders/[id]/status/route.ts
// Path: /app/api/delivery/orders/[id]/status/route.ts
// Description: Update order status by authorized users (admin, manager, employee, driver)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Define allowed roles and their permissions
const ROLE_PERMISSIONS = {
  // Admin roles can update any status
  admin: ['*'],
  superadmin: ['*'],
  manager: ['*'],
  
  // Employee can update from assigned -> preparing -> ready
  employee: ['assigned', 'preparing', 'ready'],
  
  // Driver can update from ready -> in_transit -> delivered
  driver: ['in_transit', 'delivered']
}

// Define valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  assigned: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles(name)
      `)
      .eq('user_id', user.id)

    if (rolesError) {
      console.error('❌ Error fetching user roles:', rolesError)
      return NextResponse.json(
        { error: 'Failed to verify permissions' },
        { status: 500 }
      )
    }

    // Extract role names
    const roleNames = userRoles?.map((ur: any) => ur.roles?.name).filter(Boolean) || []
    
    console.log('👤 User roles:', roleNames)

    if (roleNames.length === 0) {
      return NextResponse.json(
        { error: 'Access denied. No roles assigned.' },
        { status: 403 }
      )
    }

    // Check if user has any valid role
    const hasValidRole = roleNames.some(role => Object.keys(ROLE_PERMISSIONS).includes(role))
    
    if (!hasValidRole) {
      return NextResponse.json(
        { error: 'Access denied. Invalid role.' },
        { status: 403 }
      )
    }

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, delivery_id, assigned_to')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status: newStatus, notes } = body

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Check if status transition is valid
    const allowedTransitions = STATUS_TRANSITIONS[order.status] || []
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${order.status} to ${newStatus}` },
        { status: 400 }
      )
    }

    // Check permissions based on role
    let hasPermission = false
    
    // Check if user has admin role (can do anything)
    const isAdmin = roleNames.some(role => ['admin', 'superadmin', 'manager'].includes(role))
    
    if (isAdmin) {
      hasPermission = true
    } else {
      // Check role-specific permissions
      for (const role of roleNames) {
        const allowedStatuses = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
        if (allowedStatuses && allowedStatuses.includes(newStatus)) {
          hasPermission = true
          break
        }
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: `You don't have permission to set status to: ${newStatus}` },
        { status: 403 }
      )
    }

    // Additional checks for non-admin roles
    if (!isAdmin) {
      // Check if user is the assigned employee
      if (roleNames.includes('employee')) {
        if (order.assigned_to !== user.id) {
          return NextResponse.json(
            { error: 'You are not assigned to this order' },
            { status: 403 }
          )
        }
        // Employee can only update up to 'ready'
        if (newStatus === 'in_transit' || newStatus === 'delivered') {
          return NextResponse.json(
            { error: 'Employees cannot mark orders as in_transit or delivered' },
            { status: 403 }
          )
        }
      }

      // Check if user is the assigned driver
      if (roleNames.includes('driver')) {
        if (order.delivery_id !== user.id) {
          return NextResponse.json(
            { error: 'You are not assigned as driver for this order' },
            { status: 403 }
          )
        }
        // Driver can only update from 'ready' or 'in_transit'
        if (order.status !== 'ready' && order.status !== 'in_transit') {
          return NextResponse.json(
            { error: `Driver cannot update order from ${order.status}. Order must be ready or in transit.` },
            { status: 403 }
          )
        }
        // Driver can only set to 'in_transit' or 'delivered'
        if (newStatus !== 'in_transit' && newStatus !== 'delivered') {
          return NextResponse.json(
            { error: 'Drivers can only set status to in_transit or delivered' },
            { status: 403 }
          )
        }
      }
    }

    // Build update data
    const updateData: any = { status: newStatus }
    
    // Add timestamps based on status
    const now = new Date().toISOString()
    
    switch (newStatus) {
      case 'confirmed':
        updateData.confirmed_at = now
        break
      case 'assigned':
        updateData.assigned_at = now
        break
      case 'preparing':
        updateData.preparing_at = now
        break
      case 'ready':
        updateData.ready_at = now
        break
      case 'in_transit':
        updateData.in_transit_at = now
        break
      case 'delivered':
        updateData.delivered_at = now
        break
      case 'cancelled':
        updateData.cancelled_at = now
        break
    }

    if (notes) {
      updateData.delivery_notes = notes
    }

    // Update the order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating order status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    // Log the action
    console.log(`✅ Order ${order.id} status updated from ${order.status} to ${newStatus} by user ${user.id}`)

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${newStatus}`,
      updated_by: user.id,
      role: roleNames.join(', ')
    })

  } catch (error) {
    console.error('❌ Status update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}