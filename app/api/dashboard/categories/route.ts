// File: app/api/dashboard/categories/route.ts
// Path: /app/api/dashboard/categories/route.ts
// Description: Categories API - FULL CRUD

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

// ============================================
// GET - List all categories
// ============================================
export async function GET() {
  try {
    await requireManager()

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json({ categories: data || [] })
  } catch (error) {
    console.error('Categories GET Error:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create a new category
// ============================================
export async function POST(request: NextRequest) {
  try {
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()

    console.log('📝 Creating category:', body)

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = body.slug || body.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    // Check if category already exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }

    // Insert category
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: body.name.trim(),
        slug: slug,
        description: body.description?.trim() || '',
        image_url: body.image_url || null,
        parent_id: body.parent_id || null
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Insert error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create category' },
        { status: 500 }
      )
    }

    console.log('✅ Category created:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Categories POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH - Update a category
// ============================================
export async function PATCH(request: NextRequest) {
  try {
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()

    console.log('📝 Updating category:', body)

    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    if (!body.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = body.slug || body.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    // Check if category exists and slug is unique
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', body.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }

    // Update category
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
      .eq('id', body.id)
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

// ============================================
// DELETE - Delete a category
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    await requireManager()

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ Deleting category:', id)

    const supabase = await createClient()

    // Check if category has products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id)
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
      .eq('id', id)

    if (error) {
      console.error('❌ Delete error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete category' },
        { status: 500 }
      )
    }

    console.log('✅ Category deleted')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Categories DELETE Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}