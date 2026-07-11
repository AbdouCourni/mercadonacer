// File: app/api/dashboard/products/route.ts
// Path: /app/api/dashboard/products/route.ts
// Description: Dashboard products API - FIXED

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

export async function GET(request: NextRequest) {
  try {
    await requireManager()

    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const stock = searchParams.get('stock') || ''
    const status = searchParams.get('status') || ''

    let query = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug
        )
      `, { count: 'exact' })

    // Apply filters
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

    query = query.order('created_at', { ascending: false })

    const from = page * limit
    const to = from + limit - 1
    query = query.range(from, to)

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
    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json(
        { error: 'Access denied. Admin or manager privileges required.' },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST - Create product
// POST - Create product
export async function POST(request: NextRequest) {
  try {
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()

    console.log('Received product data:', body)

    // Validate required fields
    if (!body.name || !body.price || body.stock === undefined) {
      return NextResponse.json(
        { error: 'Name, price, and stock are required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
    }

    // Prepare product data
    const product = {
      name: body.name.trim(),
      slug: body.slug,
      description: body.description?.trim() || '',
      price: parseFloat(body.price),
      compare_price: body.compare_price ? parseFloat(body.compare_price) : null,
      stock: parseInt(body.stock),
      category_id: body.category_id || null,
      brand: body.brand?.trim() || null,
      barcode: body.barcode?.trim() || null,
      sku: body.sku?.trim() || null,
      unit: body.unit?.trim() || null,
      weight: body.weight ? parseFloat(body.weight) : null,
      images: body.images || [],
      is_active: body.is_active !== undefined ? body.is_active : true,
      is_featured: body.is_featured !== undefined ? body.is_featured : false,
    }

    console.log('Inserting product:', product)

    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 }
      )
    }

    console.log('Product created:', data)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Dashboard products POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    )
  }
}