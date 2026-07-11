// File: app/api/dashboard/products/route.ts
// Path: /app/api/dashboard/products/route.ts
// Description: Dashboard products API (list and single by query)

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
      console.log('🔍 [Dashboard API] Fetching product with ID:', id)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Supabase error:', error)
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      console.log('✅ Product found:', data?.name || 'Unknown')
      return NextResponse.json(data)
    }

    // If slug is provided, fetch by slug
    if (slug) {
      console.log('🔍 [Dashboard API] Fetching product with slug:', slug)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('❌ Supabase error:', error)
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      console.log('✅ Product found:', data?.name || 'Unknown')
      return NextResponse.json(data)
    }

    // Otherwise, return list with filters
    console.log('🔍 [Dashboard API] Fetching products list with filters')
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
    console.error('❌ Dashboard products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
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
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}