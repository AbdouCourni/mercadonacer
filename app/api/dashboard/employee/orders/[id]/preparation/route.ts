// // File: app/api/dashboard/employee/orders/[id]/preparation/route.ts
// // Path: /app/api/dashboard/employee/orders/[id]/preparation/route.ts
// // Description: API route for managing order preparation items

// import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@/lib/supabase/server'
// import { cookies } from 'next/headers'

// // ============================================
// // TYPES
// // ============================================

// interface PreparationPayload {
//   order_item_id: string
//   prepared_quantity?: number
//   is_out_of_stock?: boolean
//   is_partially_available?: boolean
//   notes?: string | null
//   status?: 'pending' | 'preparing' | 'ready' | 'missing'
// }

// // ============================================
// // POST - Create or Update Preparation
// // ============================================

// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//     console.log('🔍 [Employee Order API] POST preparation for order:', await params)
//   try {
//   const { id: orderId } = await params // Await the params
//     const supabase = await createClient()
    
//     // Get current user
//     const { data: { user }, error: userError } = await supabase.auth.getUser()
    
//     if (userError || !user) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     // Check if user has employee role
//  // ✅ Add this instead
// const { data: userRole, error: roleError } = await supabase
//   .from('user_roles')
//   .select(`
//     role_id,
//     roles!inner (
//       name
//     )
//   `)
//   .eq('user_id', user.id)
//   .single()

// if (roleError || !userRole) {
//   console.error('Role error:', roleError)
//   return NextResponse.json(
//     { error: 'User role not found' },
//     { status: 404 }
//   )
// }

// // roles can come back as an array due to the join; normalize to a string
// const userRoleName = Array.isArray(userRole.roles)
//   ? userRole.roles[0]?.name
//   : (userRole.roles as any)?.name
// console.log('👤 User role:', userRoleName)

// // Allow only employee, admin, manager, superadmin
// const allowedRoles = ['employee', 'admin', 'manager', 'superadmin']
// if (!allowedRoles.includes(userRoleName)) {
//   return NextResponse.json(
//     { error: `Forbidden - Employee access required (current role: ${userRoleName})` },
//     { status: 403 }
//   )
// }

//     // Check if order exists and is assigned to this employee
//     const { data: order, error: orderError } = await supabase
//       .from('orders')
//       .select('id, status, assigned_to')
//       .eq('id', orderId)
//       .single()

//     if (orderError || !order) {
//       return NextResponse.json(
//         { error: 'Order not found' },
//         { status: 404 }
//       )
//     }

//     // If employee role, verify order is assigned to them
//     if (userRoleName === 'employee' && order.assigned_to !== user.id) {
//       return NextResponse.json(
//         { error: 'This order is not assigned to you' },
//         { status: 403 }
//       )
//     }

//     // Only allow preparation on assigned or preparing orders
//     if (!['assigned', 'preparing'].includes(order.status)) {
//       return NextResponse.json(
//         { error: 'Order is not in preparation state' },
//         { status: 400 }
//       )
//     }

//     // Parse request body
//     const body: PreparationPayload = await request.json()
//     const { 
//       order_item_id, 
//       prepared_quantity, 
//       is_out_of_stock, 
//       is_partially_available, 
//       notes,
//       status 
//     } = body

//     if (!order_item_id) {
//       return NextResponse.json(
//         { error: 'order_item_id is required' },
//         { status: 400 }
//       )
//     }

//     // Verify order_item belongs to this order
//     const { data: orderItem, error: itemError } = await supabase
//       .from('order_items')
//       .select('id, product_id, quantity')
//       .eq('id', order_item_id)
//       .eq('order_id', orderId)
//       .single()

//     if (itemError || !orderItem) {
//       return NextResponse.json(
//         { error: 'Order item not found in this order' },
//         { status: 404 }
//       )
//     }

//     // Check if preparation record exists
//     const { data: existingPrep, error: prepError } = await supabase
//       .from('order_preparation')
//       .select('*')
//       .eq('order_id', orderId)
//       .eq('order_item_id', order_item_id)
//       .maybeSingle()

//     let result

//     if (existingPrep) {
//       // Update existing preparation
//       const updateData: any = {
//         updated_at: new Date().toISOString()
//       }

//       if (prepared_quantity !== undefined) {
//         updateData.prepared_quantity = prepared_quantity
//       }
//       if (is_out_of_stock !== undefined) {
//         updateData.is_out_of_stock = is_out_of_stock
//       }
//       if (is_partially_available !== undefined) {
//         updateData.is_partially_available = is_partially_available
//       }
//       if (notes !== undefined) {
//         updateData.notes = notes
//       }
//       if (status) {
//         updateData.status = status
//       }

//       const { data: updated, error: updateError } = await supabase
//         .from('order_preparation')
//         .update(updateData)
//         .eq('id', existingPrep.id)
//         .select()
//         .single()

//       if (updateError) {
//         console.error('Error updating preparation:', updateError)
//         return NextResponse.json(
//           { error: 'Failed to update preparation' },
//           { status: 500 }
//         )
//       }

//       result = updated
//     } else {
//       // Create new preparation
//       const insertData = {
//         order_id: orderId,
//         order_item_id: order_item_id,
//         product_id: orderItem.product_id,
//         requested_quantity: orderItem.quantity,
//         prepared_quantity: prepared_quantity ?? 0,
//         is_out_of_stock: is_out_of_stock ?? false,
//         is_partially_available: is_partially_available ?? false,
//         notes: notes ?? null,
//         status: status ?? 'pending',
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       }

//       const { data: inserted, error: insertError } = await supabase
//         .from('order_preparation')
//         .insert(insertData)
//         .select()
//         .single()

//       if (insertError) {
//         console.error('Error inserting preparation:', insertError)
//         return NextResponse.json(
//           { error: 'Failed to create preparation' },
//           { status: 500 }
//         )
//       }

//       result = inserted
//     }

//     // If there are missing items, update the order's has_missing_items flag
//     const { data: allPreparations, error: allPrepError } = await supabase
//       .from('order_preparation')
//       .select('is_out_of_stock, is_partially_available')
//       .eq('order_id', orderId)

//     if (!allPrepError && allPreparations) {
//       const hasMissing = allPreparations.some(
//         p => p.is_out_of_stock || p.is_partially_available
//       )

//       await supabase
//         .from('orders')
//         .update({
//           has_missing_items: hasMissing,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', orderId)
//     }

//     return NextResponse.json({
//       success: true,
//       data: result
//     })

//   } catch (error) {
//     console.error('Error in preparation API:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

// // ============================================
// // GET - Fetch Preparations for an Order
// // ============================================

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//   const { id: orderId } = await params // Await the params
//     const supabase = await createClient()
    
//     // Get current user
//     const { data: { user }, error: userError } = await supabase.auth.getUser()
    
//     if (userError || !user) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     // Check if user has employee role
//    const { data: userRole, error: roleError } = await supabase
//   .from('user_roles')
//   .select(`
//     role_id,
//     roles!inner (
//       name
//     )
//   `)
//   .eq('user_id', user.id)
//   .single()

// if (roleError || !userRole) {
//   console.error('Role error:', roleError)
//   return NextResponse.json(
//     { error: 'User role not found' },
//     { status: 404 }
//   )
// }

// // roles can come back as an array due to the join; normalize to a string
// const userRoleName = Array.isArray(userRole.roles)
//   ? userRole.roles[0]?.name
//   : (userRole.roles as any)?.name
// console.log('👤 User role:', userRoleName)

// // Allow only employee, admin, manager, superadmin
// const allowedRoles = ['employee', 'admin', 'manager', 'superadmin']
// if (!allowedRoles.includes(userRoleName)) {
//   return NextResponse.json(
//     { error: `Forbidden - Employee access required (current role: ${userRoleName})` },
//     { status: 403 }
//   )
// }

//     // Check if order exists
//     const { data: order, error: orderError } = await supabase
//       .from('orders')
//       .select('id, status, assigned_to')
//       .eq('id', orderId)
//       .single()

//     if (orderError || !order) {
//       return NextResponse.json(
//         { error: 'Order not found' },
//         { status: 404 }
//       )
//     }

//     // If employee role, verify order is assigned to them
//     if (profile.role === 'employee' && order.assigned_to !== user.id) {
//       return NextResponse.json(
//         { error: 'This order is not assigned to you' },
//         { status: 403 }
//       )
//     }

//     // Fetch all preparations for this order
//     const { data: preparations, error: prepError } = await supabase
//       .from('order_preparation')
//       .select('*')
//       .eq('order_id', orderId)
//       .order('created_at', { ascending: true })

//     if (prepError) {
//       console.error('Error fetching preparations:', prepError)
//       return NextResponse.json(
//         { error: 'Failed to fetch preparations' },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json({
//       success: true,
//       data: preparations || []
//     })

//   } catch (error) {
//     console.error('Error in preparation GET API:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

// // ============================================
// // DELETE - Remove Preparation
// // ============================================

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//   const { id: orderId } = await params // Await the params
//     const supabase = await createClient()
    
//     // Get current user
//     const { data: { user }, error: userError } = await supabase.auth.getUser()
    
//     if (userError || !user) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     // Check if user has employee role
//    const { data: userRole, error: roleError } = await supabase
//   .from('user_roles')
//   .select(`
//     role_id,
//     roles!inner (
//       name
//     )
//   `)
//   .eq('user_id', user.id)
//   .single()

// if (roleError || !userRole) {
//   console.error('Role error:', roleError)
//   return NextResponse.json(
//     { error: 'User role not found' },
//     { status: 404 }
//   )
// }

// // roles can come back as an array due to the join; normalize to a string
// const userRoleName = Array.isArray(userRole.roles)
//   ? userRole.roles[0]?.name
//   : (userRole.roles as any)?.name
// console.log('👤 User role:', userRoleName)

// // Allow only employee, admin, manager, superadmin
// const allowedRoles = ['employee', 'admin', 'manager', 'superadmin']
// if (!allowedRoles.includes(userRoleName)) {
//   return NextResponse.json(
//     { error: `Forbidden - Employee access required (current role: ${userRoleName})` },
//     { status: 403 }
//   )
// }

//     // Check if order exists
//     const { data: order, error: orderError } = await supabase
//       .from('orders')
//       .select('id, status, assigned_to')
//       .eq('id', orderId)
//       .single()

//     if (orderError || !order) {
//       return NextResponse.json(
//         { error: 'Order not found' },
//         { status: 404 }
//       )
//     }

//     // If employee role, verify order is assigned to them
//     if (profile.role === 'employee' && order.assigned_to !== user.id) {
//       return NextResponse.json(
//         { error: 'This order is not assigned to you' },
//         { status: 403 }
//       )
//     }

//     // Get the order_item_id from query params
//     const url = new URL(request.url)
//     const orderItemId = url.searchParams.get('order_item_id')

//     if (!orderItemId) {
//       return NextResponse.json(
//         { error: 'order_item_id query parameter is required' },
//         { status: 400 }
//       )
//     }

//     // Delete the preparation
//     const { error: deleteError } = await supabase
//       .from('order_preparation')
//       .delete()
//       .eq('order_id', orderId)
//       .eq('order_item_id', orderItemId)

//     if (deleteError) {
//       console.error('Error deleting preparation:', deleteError)
//       return NextResponse.json(
//         { error: 'Failed to delete preparation' },
//         { status: 500 }
//       )
//     }

//     // Update order's has_missing_items flag
//     const { data: remainingPreparations, error: remainingError } = await supabase
//       .from('order_preparation')
//       .select('is_out_of_stock, is_partially_available')
//       .eq('order_id', orderId)

//     if (!remainingError && remainingPreparations) {
//       const hasMissing = remainingPreparations.some(
//         p => p.is_out_of_stock || p.is_partially_available
//       )

//       await supabase
//         .from('orders')
//         .update({
//           has_missing_items: hasMissing,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', orderId)
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Preparation deleted successfully'
//     })

//   } catch (error) {
//     console.error('Error in preparation DELETE API:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }