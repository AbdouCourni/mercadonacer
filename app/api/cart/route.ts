// File: app/api/cart/route.ts
// Path: /app/api/cart/route.ts
// Description: Cart API with proper session handling

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ============================================
// HELPER: Get Supabase client with session
// ============================================
function getSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options: any) {
          (await cookieStore).set({ name, value, ...options })
        },
        async remove(name: string, options: any) {
          (await cookieStore).set({ name, value: '', ...options })
        },
      },
    }
  )
}

// ============================================
// GET - Get user's cart
// ============================================
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        items: [], 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        variant_id,
        products (*),
        product_variants (*)
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error('GET /api/cart error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Add to cart
// ============================================
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity = 1, variantId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if item exists
    let query = supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (variantId) {
      query = query.eq('variant_id', variantId)
    }

    const { data: existing } = await query.single()

    let result

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating cart:', error)
        return NextResponse.json(
          { error: 'Failed to update cart' },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{
          user_id: user.id,
          product_id: productId,
          variant_id: variantId || null,
          quantity
        }])
        .select()
        .single()

      if (error) {
        console.error('Error inserting cart item:', error)
        return NextResponse.json(
          { error: 'Failed to add to cart' },
          { status: 500 }
        )
      }
      result = data
    }

    // Fetch updated cart
    const { data: updatedCart } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        variant_id,
        products (*),
        product_variants (*)
      `)
      .eq('user_id', user.id)

    return NextResponse.json({ 
      item: result, 
      cart: updatedCart || [] 
    })
  } catch (error) {
    console.error('POST /api/cart error:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH - Update quantity
// ============================================
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, quantity } = body

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      // Delete item
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting cart item:', error)
        return NextResponse.json(
          { error: 'Failed to remove item' },
          { status: 500 }
        )
      }
    } else {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating cart item:', error)
        return NextResponse.json(
          { error: 'Failed to update quantity' },
          { status: 500 }
        )
      }
    }

    // Fetch updated cart
    const { data: updatedCart } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        variant_id,
        products (*),
        product_variants (*)
      `)
      .eq('user_id', user.id)

    return NextResponse.json({ cart: updatedCart || [] })
  } catch (error) {
    console.error('PATCH /api/cart error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Remove from cart
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { itemId } = body

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting cart item:', error)
      return NextResponse.json(
        { error: 'Failed to remove item' },
        { status: 500 }
      )
    }

    // Fetch updated cart
    const { data: updatedCart } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        variant_id,
        products (*),
        product_variants (*)
      `)
      .eq('user_id', user.id)

    return NextResponse.json({ cart: updatedCart || [] })
  } catch (error) {
    console.error('DELETE /api/cart error:', error)
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}