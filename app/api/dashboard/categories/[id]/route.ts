// File: app/api/dashboard/categories/[id]/route.ts
// Path: /app/api/dashboard/categories/[id]/route.ts
// Description: Single category API - FIXED DELETE

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise
) {
  try {
    const { id } = await params  // ✅ Await
    await requireManager()

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Category GET Error:', error)
    return NextResponse.json(
      { error: 'Category not found' },
      { status: 404 }
    )
  }
}

// PATCH - Update a category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()

    console.log('📝 Updating category:', { id, ...body })

    if (!body.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const slug = body.slug || body.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('categories')
      .update({
        name: body.name.trim(),
        slug: slug,
        description: body.description?.trim() || '',
        image_url: body.image_url || null,
        parent_id: body.parent_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Update error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update category' },
        { status: 500 }
      )
    }

    console.log('✅ Category updated:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Categories PATCH Error:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // 🔥 Log the ID to see what's coming
    console.log('🗑️ Delete category called with params:', { id })
    
    const categoryId = id
    
    if (!categoryId || categoryId === 'undefined') {
      console.error('❌ Invalid category ID:', categoryId)
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      )
    }

    await requireManager()

    const supabase = await createClient()

    // Check if category has products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1)

    if (productsError) {
      console.error('❌ Products check error:', productsError)
    }

    if (products && products.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products' },
        { status: 400 }
      )
    }

    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) {
      console.error('❌ Delete error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete category' },
        { status: 500 }
      )
    }

    console.log('✅ Category deleted:', categoryId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Categories DELETE Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}