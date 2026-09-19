// File: app/api/orders/[id]/preparation/route.ts
// Path: /app/api/orders/[id]/preparation/route.ts
// Description: Unified API route for order preparation items with role-based access

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================
// TYPES
// ============================================

interface PreparationPayload {
  order_item_id: string
  prepared_quantity?: number
  is_out_of_stock?: boolean
  is_partially_available?: boolean
  notes?: string | null
  status?: 'pending' | 'preparing' | 'ready' | 'missing'
}

// ============================================
// ROLE PERMISSIONS
// ============================================

const ROLE_PERMISSIONS = {
  // Can view and manage all preparations
  superadmin: { canView: true, canManage: true, canViewAll: true },
  admin: { canView: true, canManage: true, canViewAll: true },
  manager: { canView: true, canManage: true, canViewAll: true },
  // Can view and manage preparations for assigned orders only
  employee: { canView: true, canManage: true, canViewAll: false },
  // Can view preparations for their own orders only
  driver: { canView: true, canManage: false, canViewAll: false },
  // Can view preparations for their own orders only
  client: { canView: true, canManage: false, canViewAll: false },
}

// ============================================
// HELPER: Get User Role
// ============================================

async function getUserRole(userId: string, supabase: any) {
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select(`
      role_id,
      roles!inner (
        name
      )
    `)
    .eq('user_id', userId)
    .single()

  if (roleError || !userRole) {
    console.error('Role error:', roleError)
    return null
  }

  // roles can come back as an array due to the join; normalize to a string
  const userRoleName = Array.isArray(userRole.roles)
    ? userRole.roles[0]?.name
    : (userRole.roles as any)?.name

  return userRoleName
}

// ============================================
// HELPER: Check Order Access
// ============================================

async function checkOrderAccess(
  orderId: string,
  userId: string,
  userRole: string,
  supabase: any
) {
  // Fetch order with relations
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      assigned_to,
      delivery_id,
      user_id
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { error: 'Order not found', status: 404, order: null }
  }

  // Superadmin, admin, manager can access all orders
  if (['superadmin', 'admin', 'manager'].includes(userRole)) {
    return { error: null, status: 200, order }
  }

  // Employee can only access orders assigned to them
  if (userRole === 'employee') {
    if (order.assigned_to !== userId) {
      return { 
        error: 'This order is not assigned to you', 
        status: 403, 
        order: null 
      }
    }
    return { error: null, status: 200, order }
  }

  // Driver can only access orders assigned to them for delivery
  if (userRole === 'driver') {
    if (order.delivery_id !== userId) {
      return { 
        error: 'This order is not assigned to you for delivery', 
        status: 403, 
        order: null 
      }
    }
    return { error: null, status: 200, order }
  }

  // Client can only access their own orders
  if (userRole === 'client') {
    if (order.user_id !== userId) {
      return { 
        error: 'You do not have access to this order', 
        status: 403, 
        order: null 
      }
    }
    return { error: null, status: 200, order }
  }

  return { error: 'Unauthorized', status: 403, order: null }
}

// ============================================
// POST - Create or Update Preparation
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role
    const userRole = await getUserRole(user.id, supabase)
    if (!userRole) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]
    if (!permissions || !permissions.canManage) {
      return NextResponse.json(
        { error: `Forbidden - You do not have permission to manage preparations (role: ${userRole})` },
        { status: 403 }
      )
    }

    // Check order access
    const { error: accessError, status: accessStatus, order } = await checkOrderAccess(
      orderId,
      user.id,
      userRole,
      supabase
    )

    if (accessError || !order) {
      return NextResponse.json(
        { error: accessError || 'Order not found' },
        { status: accessStatus || 404 }
      )
    }

    // Only allow preparation on assigned, preparing, or ready orders
    // (can still manage missing items on ready orders)
    if (!['assigned', 'preparing', 'ready'].includes(order.status)) {
      return NextResponse.json(
        { error: `Order is not in preparation state (current: ${order.status})` },
        { status: 400 }
      )
    }

    // Parse request body
    const body: PreparationPayload = await request.json()
    const { 
      order_item_id, 
      prepared_quantity, 
      is_out_of_stock, 
      is_partially_available, 
      notes,
      status 
    } = body

    if (!order_item_id) {
      return NextResponse.json(
        { error: 'order_item_id is required' },
        { status: 400 }
      )
    }

    // Verify order_item belongs to this order
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .select('id, product_id, quantity')
      .eq('id', order_item_id)
      .eq('order_id', orderId)
      .single()

    if (itemError || !orderItem) {
      return NextResponse.json(
        { error: 'Order item not found in this order' },
        { status: 404 }
      )
    }

    // Check if preparation record exists
    const { data: existingPrep, error: prepError } = await supabase
      .from('order_preparation')
      .select('*')
      .eq('order_id', orderId)
      .eq('order_item_id', order_item_id)
      .maybeSingle()

    let result

    if (existingPrep) {
      // Update existing preparation
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (prepared_quantity !== undefined) {
        updateData.prepared_quantity = prepared_quantity
      }
      if (is_out_of_stock !== undefined) {
        updateData.is_out_of_stock = is_out_of_stock
      }
      if (is_partially_available !== undefined) {
        updateData.is_partially_available = is_partially_available
      }
      if (notes !== undefined) {
        updateData.notes = notes
      }
      if (status) {
        updateData.status = status
      }

      const { data: updated, error: updateError } = await supabase
        .from('order_preparation')
        .update(updateData)
        .eq('id', existingPrep.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating preparation:', updateError)
        return NextResponse.json(
          { error: 'Failed to update preparation' },
          { status: 500 }
        )
      }

      result = updated
    } else {
      // Create new preparation
      const insertData = {
        order_id: orderId,
        order_item_id: order_item_id,
        product_id: orderItem.product_id,
        requested_quantity: orderItem.quantity,
        prepared_quantity: prepared_quantity ?? 0,
        is_out_of_stock: is_out_of_stock ?? false,
        is_partially_available: is_partially_available ?? false,
        notes: notes ?? null,
        status: status ?? 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: inserted, error: insertError } = await supabase
        .from('order_preparation')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting preparation:', insertError)
        return NextResponse.json(
          { error: 'Failed to create preparation' },
          { status: 500 }
        )
      }

      result = inserted
    }

    // Update order's has_missing_items flag
    const { data: allPreparations, error: allPrepError } = await supabase
      .from('order_preparation')
      .select('is_out_of_stock, is_partially_available')
      .eq('order_id', orderId)

    if (!allPrepError && allPreparations) {
      const hasMissing = allPreparations.some(
        p => p.is_out_of_stock || p.is_partially_available
      )

      await supabase
        .from('orders')
        .update({
          has_missing_items: hasMissing,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error in preparation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// GET - Fetch Preparations for an Order
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role
    const userRole = await getUserRole(user.id, supabase)
    if (!userRole) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]
    if (!permissions || !permissions.canView) {
      return NextResponse.json(
        { error: `Forbidden - You do not have permission to view preparations (role: ${userRole})` },
        { status: 403 }
      )
    }

    // Check order access
    const { error: accessError, status: accessStatus, order } = await checkOrderAccess(
      orderId,
      user.id,
      userRole,
      supabase
    )

    if (accessError || !order) {
      return NextResponse.json(
        { error: accessError || 'Order not found' },
        { status: accessStatus || 404 }
      )
    }

    // Fetch all preparations for this order
    const { data: preparations, error: prepError } = await supabase
      .from('order_preparation')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (prepError) {
      console.error('Error fetching preparations:', prepError)
      return NextResponse.json(
        { error: 'Failed to fetch preparations' },
        { status: 500 }
      )
    }

    // Return only what the user is allowed to see
    let responseData = preparations || []

    // For clients and drivers, we might want to filter sensitive data
    if (['client', 'driver'].includes(userRole)) {
      // Return only essential information
      responseData = responseData.map((prep: any) => ({
        id: prep.id,
        order_item_id: prep.order_item_id,
        product_id: prep.product_id,
        requested_quantity: prep.requested_quantity,
        prepared_quantity: prep.prepared_quantity,
        is_out_of_stock: prep.is_out_of_stock,
        is_partially_available: prep.is_partially_available,
        status: prep.status,
        // Don't return notes for clients/drivers (optional)
        // notes: prep.notes,
      }))
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error in preparation GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Remove Preparation
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role
    const userRole = await getUserRole(user.id, supabase)
    if (!userRole) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]
    if (!permissions || !permissions.canManage) {
      return NextResponse.json(
        { error: `Forbidden - You do not have permission to manage preparations (role: ${userRole})` },
        { status: 403 }
      )
    }

    // Check order access
    const { error: accessError, status: accessStatus, order } = await checkOrderAccess(
      orderId,
      user.id,
      userRole,
      supabase
    )

    if (accessError || !order) {
      return NextResponse.json(
        { error: accessError || 'Order not found' },
        { status: accessStatus || 404 }
      )
    }

    // Get the order_item_id from query params
    const url = new URL(request.url)
    const orderItemId = url.searchParams.get('order_item_id')

    if (!orderItemId) {
      return NextResponse.json(
        { error: 'order_item_id query parameter is required' },
        { status: 400 }
      )
    }

    // Delete the preparation
    const { error: deleteError } = await supabase
      .from('order_preparation')
      .delete()
      .eq('order_id', orderId)
      .eq('order_item_id', orderItemId)

    if (deleteError) {
      console.error('Error deleting preparation:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete preparation' },
        { status: 500 }
      )
    }

    // Update order's has_missing_items flag
    const { data: remainingPreparations, error: remainingError } = await supabase
      .from('order_preparation')
      .select('is_out_of_stock, is_partially_available')
      .eq('order_id', orderId)

    if (!remainingError && remainingPreparations) {
      const hasMissing = remainingPreparations.some(
        p => p.is_out_of_stock || p.is_partially_available
      )

      await supabase
        .from('orders')
        .update({
          has_missing_items: hasMissing,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
    }

    return NextResponse.json({
      success: true,
      message: 'Preparation deleted successfully'
    })

  } catch (error) {
    console.error('Error in preparation DELETE API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}