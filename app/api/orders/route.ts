// File: app/api/orders/route.ts
// Path: /app/api/orders/route.ts
// Description: Create order with proper user_id

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/services/auth.server'
import { isVitrineMode } from '@/lib/site-mode'



export async function POST(request: NextRequest) {
  try {

      if (isVitrineMode()) {
      return NextResponse.json(
        { error: 'Les commandes en ligne sont temporairement désactivées.' },
        { status: 403 }
      )
    }
    const supabase = await createClient()
    const body = await request.json()
    
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

    // ✅ Server-side validation: check stock AND compute effective prices from DB
    const itemsWithPrices: any[] = []

    for (const item of body.items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('stock, name, price, is_in_promotion, promotion_price, promotion_start, promotion_end')
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
          { error: `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}` },
          { status: 400 }
        )
      }

      // ✅ Server-side effective price
      const now = new Date()
      let effectivePrice = parseFloat(product.price)

      if (product.is_in_promotion && product.promotion_price) {
        const startOk = !product.promotion_start || new Date(product.promotion_start) <= now
        const endOk = !product.promotion_end || new Date(product.promotion_end) >= now

        if (startOk && endOk) {
          effectivePrice = parseFloat(product.promotion_price)
        }
      }

      itemsWithPrices.push({
        product_id: item.product_id,
        product_name: product.name,
        product_slug: item.product_slug || product.name.toLowerCase().replace(/\s+/g, '-'),
        variant_name: item.variant_name || null,
        quantity: item.quantity,
        unit_price: effectivePrice,       // ✅ server-computed
        total_price: effectivePrice * item.quantity,
      })
    }

    // ✅ Recalculate subtotal server-side from verified items
    const serverSubtotal = itemsWithPrices.reduce(
      (sum, item) => sum + item.total_price,
      0
    )

    // Create order
    const orderData = {
      user_id: user?.id || null,
      guest_email: body.email,
      guest_name: body.full_name,
      guest_phone: body.phone,
      address_line1: body.address,
      address_line2: body.address_line2 || '',
      city: body.city,
      postal_code: body.postal_code || '',
      delivery_notes: body.delivery_notes || '',
      subtotal: serverSubtotal,
      delivery_fee: body.delivery_fee || 0,
      tax: body.tax || 0,
      discount: body.discount || 0,
      total: serverSubtotal + (body.delivery_fee || 0) + (body.tax || 0) - (body.discount || 0),
      payment_method: body.payment_method || 'cod',
      payment_status: 'pending',
      status: 'pending',
      customer_notes: body.delivery_notes || '',
      created_at: new Date().toISOString(),
        delivery_code: body.delivery_code, 
    delivery_code_generated_at: new Date().toISOString()
    }

    console.log('📝 Creating order with data:', JSON.stringify(orderData, null, 2))

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

    // Create order items — using server-verified prices
    const orderItems = itemsWithPrices.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_slug: item.product_slug,
      variant_name: item.variant_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    console.log('📝 Creating order items:', JSON.stringify(orderItems, null, 2))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('❌ Order items error:', itemsError)
      console.error('❌ Items error details:', JSON.stringify(itemsError, null, 2))
      
      // Rollback order if items fail
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      )
    }

    // Update stock - check if function exists
    try {
      for (const item of itemsWithPrices) {
        console.log(`📝 Updating stock for product ${item.product_id}: -${item.quantity}`)
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity
        })
        
        if (stockError) {
          console.error('❌ Stock update error:', stockError)
          // Don't fail the order, just log the error
        }
      }
    } catch (stockError) {
      console.error('❌ Stock function error:', stockError)
      // Continue - order is already created
    }

    // Clear cart (if user is logged in)
    if (user?.id) {
      console.log('🧹 Clearing cart for user:', user.id)
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (clearCartError) {
        console.error('Error clearing cart:', clearCartError)
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
      { error: error instanceof Error ? error.message : 'Failed to create order' },
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