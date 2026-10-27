// File: app/api/dashboard/products/route.ts
// Path: /app/api/dashboard/products/route.ts
// Description: Dashboard products API (list, create, update)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get products (list or single by id)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  const slug = searchParams.get('slug')
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 0
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const stock = searchParams.get('stock') || ''
  const status = searchParams.get('status') || ''

  try {
    const supabase = await createClient()
    
    // If ID is provided, fetch single product
    if (id) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json(data)
    }

    // If slug is provided, fetch by slug
    if (slug) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json(data)
    }

    // Otherwise, return list with filters
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('category_id', category)
    }

    if (stock === 'low') {
      query = query.lt('stock', 10).gt('stock', 0)
    } else if (stock === 'out') {
      query = query.eq('stock', 0)
    } else if (stock === 'in') {
      query = query.gt('stock', 0)
    }

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    const from = page * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      products: data || [],
      count: count || 0,
      page,
      limit
    })
  } catch (error) {
    console.error('Dashboard products API error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST - Create product
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
    }

    const product = {
      ...body,
      price: parseFloat(body.price),
      compare_price: body.compare_price ? parseFloat(body.compare_price) : null,
      stock: parseInt(body.stock),
      weight: body.weight ? parseFloat(body.weight) : null,
      images: body.images || [],
      // 👇 NEW FIELDS FOR HERO
      show_in_hero: body.show_in_hero ?? false,
      hero_order: body.hero_order ? parseInt(body.hero_order) : 99,
    }

    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Dashboard products POST error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

// PATCH - Update product (This handles the edit page requests)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Prepare updates, handling the Hero fields safely
    const updates = {
      ...body,
      // 👇 ENSURE HERO FIELDS ARE SAVED
      show_in_hero: body.show_in_hero ?? false,
      hero_order: body.hero_order ? parseInt(body.hero_order) : 99,
    }
    
    // Prevent errors if price/stock are missing in the partial update
    if (body.price !== undefined) updates.price = parseFloat(body.price)
    if (body.stock !== undefined) updates.stock = parseInt(body.stock)
    if (body.compare_price !== undefined) updates.compare_price = body.compare_price ? parseFloat(body.compare_price) : null
    if (body.weight !== undefined) updates.weight = body.weight ? parseFloat(body.weight) : null

    // Remove ID from payload to avoid Supabase primary key errors
    delete updates.id

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Dashboard products PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}