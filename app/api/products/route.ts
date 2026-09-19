// File: app/api/products/route.ts
// Path: /app/api/products/route.ts
// Description: Public API for products - GET, POST, PATCH, DELETE

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireManager } from '@/services/rbac.service'


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

// Helper function to extract publicId from Cloudinary URL
function extractPublicId(url: string): string | null {
  try {
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.jpg
    // Get the filename without extension
    const filename = url.split('/').pop() // "public_id.jpg"
    if (!filename) return null
    return filename.split('.')[0] // "public_id"
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  const slug = searchParams.get('slug')
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 0

  try {
    console.log('🔍 Products API called with:', { id, slug, limit, page })
    
    const supabase = await createClient()
    
    // 🔥 If ID is provided, fetch single product
    if (id) {
      console.log('🔍 Fetching product with ID:', id)
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        console.log('❌ Invalid UUID format:', id)
        return NextResponse.json(
          { error: 'Invalid product ID format' },
          { status: 400 }
        )
      }
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Product fetch error:', error)
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
      console.log('🔍 Fetching product with slug:', slug)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .single()

      if (error) {
        console.log('❌ Product not found with slug:', slug)
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      console.log('✅ Product found:', data?.name || 'Unknown')
      return NextResponse.json(data)
    }

    // Otherwise, return list of products with categories
    console.log('🔍 Fetching products list')
    const from = page * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Products list error:', error)
      throw error
    }

    return NextResponse.json({
      products: data || [],
      count: count || 0,
      page,
      limit
    })
  } catch (error) {
    console.error('❌ Public products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
// GET - Get products (list or single by id)
// export async function GET(request: NextRequest) {
//   try {
//     await requireManager()

//     const supabase = await createClient()
//     const searchParams = request.nextUrl.searchParams
//     const page = parseInt(searchParams.get('page') || '0')
//     const limit = parseInt(searchParams.get('limit') || '20')
//     const search = searchParams.get('search') || ''
//     const category = searchParams.get('category') || ''
//     const stock = searchParams.get('stock') || ''
//     const status = searchParams.get('status') || ''

//     let query = supabase
//       .from('products')
//       .select(`
//         *,
//         categories:category_id (
//           id,
//           name,
//           slug
//         )
//       `, { count: 'exact' })

//     // Apply filters
//     if (search) {
//       query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`)
//     }

//     if (category) {
//       query = query.eq('category_id', category)
//     }

//     if (stock === 'low') {
//       query = query.lt('stock', 10).gt('stock', 0)
//     } else if (stock === 'out') {
//       query = query.eq('stock', 0)
//     } else if (stock === 'in') {
//       query = query.gt('stock', 0)
//     }

//     if (status === 'active') {
//       query = query.eq('is_active', true)
//     } else if (status === 'inactive') {
//       query = query.eq('is_active', false)
//     }

//     query = query.order('created_at', { ascending: false })

//     const from = page * limit
//     const to = from + limit - 1
//     query = query.range(from, to)

//     const { data, error, count } = await query

//     if (error) throw error

//     return NextResponse.json({
//       products: data || [],
//       count: count || 0,
//       page,
//       limit
//     })
//   } catch (error) {
//     console.error('Dashboard products API error:', error)
//     return NextResponse.json(
//       { error: 'Failed to fetch products' },
//       { status: 500 }
//     )
//   }
// }

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
        achat_price: body.achat_price ? parseFloat(body.achat_price) : null, // ← NEW
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
    console.error('Products POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

// PATCH - Update product by ID
export async function PATCH(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('🔧 [Public API] Updating product with ID:', id)

    // Handle images - if images are objects with isPrimary, sort them
    let images = body.images || []
    if (images.length > 0 && typeof images[0] === 'object') {
      const sorted = [...images].sort((a, b) => {
        if (a.isPrimary) return -1
        if (b.isPrimary) return 1
        return 0
      })
      images = sorted.map((img: any) => img.url)
    }

    const product = {
      name: body.name,
      slug: body.slug,
      description: body.description || '',
      price: body.price ? parseFloat(body.price) : undefined,
      compare_price: body.compare_price ? parseFloat(body.compare_price) : null,
      stock: body.stock ? parseInt(body.stock) : undefined,
      category_id: body.category_id || null,
      brand: body.brand || null,
      barcode: body.barcode || null,
      sku: body.sku || null,
      unit: body.unit || null,
      weight: body.weight ? parseFloat(body.weight) : null,
      images: images,
      is_active: body.is_active,
      is_featured: body.is_featured,
    }

    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update product' },
        { status: 500 }
      )
    }

    console.log('✅ Product updated:', data?.name || 'Unknown')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ PATCH product error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product by ID (with Cloudinary cleanup)
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Product ID is required', received_id: id },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()
    
    // 1. Get product images
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, images')
      .eq('id', id)
      .single()

    if (fetchError) {
      // Continue with deletion even if we can't get images
    }

    // 2. Delete images from Cloudinary
    if (product?.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        const publicId = extractPublicId(imageUrl)
        
        if (publicId) {
          try {
            const result = await cloudinary.uploader.destroy(publicId)
            
            if (result.result === 'ok') {
              // Deleted successfully
            } else if (result.result === 'not found') {
              // Image not found on Cloudinary
            }
          } catch (error) {
            // Log Cloudinary error in response
            return NextResponse.json(
              { 
                error: 'Cloudinary deletion failed',
                product_id: id,
                image_url: imageUrl,
                public_id: publicId,
                cloudinary_error: error instanceof Error ? error.message : String(error)
              },
              { status: 500 }
            )
          }
        }
      }
    }

    // 3. Delete product from database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { 
          error: 'Failed to delete product from database',
          product_id: id,
          db_error: error.message,
          db_code: error.code,
          db_details: error.details,
          db_hint: error.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      deleted_product_id: id 
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to delete product',
        product_id: id,
        exception: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}