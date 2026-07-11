// File: app/api/orders/route.ts
// Path: /app/api/orders/route.ts
// Description: Create order with proper user_id

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/services/auth.server'


export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // 🔥 IMPORTANT: Get user FIRST
const user = await getServerUser()

console.log('👤 User from auth:', user?.id)
    console.log('👤 User email:', user?.email)

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    if (!body.address || !body.city || !body.full_name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check stock for all items
    for (const item of body.items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('stock, name')
        .eq('id', item.product_id)
        .single()

      if (error || !product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product_name}` },
          { status: 404 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
          { status: 400 }
        )
      }
    }

    // 🔥 FIX: Create order with user_id properly set
const orderData = {
      user_id: user?.id || null,
      
      // 🔥 ALWAYS save the contact info from the form
      guest_email: body.email,  // Always save email from form
      guest_name: body.full_name,  // Always save name from form
      guest_phone: body.phone,  // Always save phone from form
      
      address_line1: body.address,
      address_line2: body.address_line2 || '',
      city: body.city,
      postal_code: body.postal_code || '',
      delivery_notes: body.delivery_notes || '',
      subtotal: body.subtotal || 0,
      delivery_fee: body.delivery_fee || 0,
      tax: body.tax || 0,
      discount: body.discount || 0,
      total: body.total || 0,
      payment_method: body.payment_method || 'cod',
      payment_status: 'pending',
      status: 'pending',
      customer_notes: body.delivery_notes || '',
      created_at: new Date().toISOString()
    }

    console.log('📝 Creating order with data:', {
      user_id: orderData.user_id || 'NULL',
      guest_email: orderData.guest_email,
      guest_name: orderData.guest_name,
      guest_phone: orderData.guest_phone
    })

    console.log('📝 Creating order with data:', {
      ...orderData,
      user_id: orderData.user_id || 'NULL'
    })

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (orderError) {
      console.error('❌ Order creation error:', orderError)
      return NextResponse.json(
        { error: orderError.message || 'Failed to create order' },
        { status: 500 }
      )
    }

    console.log('✅ Order created:', order.order_number)
    console.log('✅ Order user_id:', order.user_id)

    // Create order items
    const orderItems = body.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_slug: item.product_slug || item.product_name.toLowerCase().replace(/\s+/g, '-'),
      variant_name: item.variant_name || null,
      quantity: item.quantity,
      unit_price: item.price || 0,
      total_price: (item.price || 0) * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('❌ Order items error:', itemsError)
      // Rollback order if items fail
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // Update stock
    for (const item of body.items) {
      await supabase.rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity
      })
    }

    // 🔥 Clear cart (if user is logged in)
    if (user?.id) {
      console.log('🧹 Clearing cart for user:', user.id)
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (clearCartError) {
        console.error('Error clearing cart:', clearCartError)
        // Don't fail the order, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      order: order,
      order_number: order.order_number
    })
  } catch (error) {
    console.error('❌ Order API error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getServerUser()
    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get('orderNumber')

    // If orderNumber is provided, get single order
    if (orderNumber) {
      console.log('🔍 Fetching order by number:', orderNumber)
      
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
        .eq('order_number', orderNumber)
        .maybeSingle()

      if (error) {
        console.error('Order fetch error:', error)
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      // 🔥 Ensure items is always an array
      if (data && !data.items) {
        data.items = []
      }

      return NextResponse.json(data)
    }

    // Otherwise, get all orders for logged-in user
    if (!user) {
      return NextResponse.json({ orders: [] })
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          product_name,
          quantity,
          unit_price
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ orders: data || [] })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}