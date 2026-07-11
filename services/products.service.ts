// File: services/products.service.ts
// Path: /services/products.service.ts
// Description: Products service for MercadoNacer

import { createClient } from '@/lib/supabase/server'
import { Product, ProductFilters } from '@/types/product.types'

export async function getProducts(filters?: ProductFilters) {
  try {
    // createClient() returns a client directly, not a Promise
    const supabase = createClient()
    
    console.log('Supabase client created:', !!supabase)
    console.log('Supabase from method exists:', typeof (await supabase).from === 'function')
    
    let query = (await supabase)
      .from('products')
      .select(`
        *,
        categories:category_id (*),
        variants:product_variants (*)
      `)

    // Category filter
    if (filters?.category) {
      query = query.eq('category_id', filters.category)
    }

    // Price range
    if (filters?.minPrice !== undefined && filters?.minPrice !== null) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters?.maxPrice !== undefined && filters?.maxPrice !== null) {
      query = query.lte('price', filters.maxPrice)
    }

    // Barcode filter
    if (filters?.barcode) {
      query = query.eq('barcode', filters.barcode)
    }

    // SKU filter
    if (filters?.sku) {
      query = query.eq('sku', filters.sku)
    }

    // Search by name, description, barcode, or SKU
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,` +
        `description.ilike.%${filters.search}%,` +
        `barcode.ilike.%${filters.search}%,` +
        `sku.ilike.%${filters.search}%`
      )
    }

    // Sorting
    if (filters?.sort) {
      query = query.order(filters.sort.by, { ascending: filters.sort.asc })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Pagination
    const page = filters?.page || 0
    const limit = filters?.limit || 20
    const from = page * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase query error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return { products: [], count: 0 }
    }

    return { 
      products: (data || []) as Product[], 
      count: count || 0 
    }
  } catch (error) {
    console.error('Error in getProducts:', error)
    return { products: [], count: 0 }
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const supabase = createClient()

    const { data, error } = await (await supabase)
      .from('products')
      .select(`
        *,
        categories:category_id (*),
        variants:product_variants (*)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching product by slug:', error)
      return null
    }

    return data as Product | null
  } catch (error) {
    console.error('Error in getProductBySlug:', error)
    return null
  }
}

export async function getProductByBarcode(barcode: string) {
  try {
    const supabase = createClient()

    const { data, error } = await (await supabase)
      .from('products')
      .select(`
        *,
        categories:category_id (*),
        variants:product_variants (*)
      `)
      .eq('barcode', barcode)
      .single()

    if (error) {
      console.error('Error fetching product by barcode:', error)
      return null
    }

    return data as Product | null
  } catch (error) {
    console.error('Error in getProductByBarcode:', error)
    return null
  }
}

export async function searchProducts(query: string) {
  try {
    const supabase = createClient()

    const { data, error } = await (await supabase)
      .from('products')
      .select(`
        *,
        categories:category_id (*)
      `)
      .or(
        `name.ilike.%${query}%,` +
        `description.ilike.%${query}%,` +
        `barcode.ilike.%${query}%,` +
        `sku.ilike.%${query}%`
      )
      .eq('is_active', true)
      .limit(20)

    if (error) {
      console.error('Error searching products:', error)
      return []
    }

    return (data || []) as Product[]
  } catch (error) {
    console.error('Error in searchProducts:', error)
    return []
  }
}

export async function getFeaturedProducts(limit: number = 6) {
  try {
    const supabase = createClient()

    const { data, error } = await (await supabase)
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(limit)

    if (error) {
      console.error('Error fetching featured products:', error)
      return []
    }

    return (data || []) as Product[]
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error)
    return []
  }
}

export async function getProductsByCategory(categorySlug: string, limit: number = 20) {
  try {
    const supabase = createClient()

    const { data, error } = await (await supabase)
      .from('products')
      .select(`
        *,
        categories:category_id (*)
      `)
      .eq('categories.slug', categorySlug)
      .eq('is_active', true)
      .limit(limit)

    if (error) {
      console.error('Error fetching products by category:', error)
      return []
    }

    return (data || []) as Product[]
  } catch (error) {
    console.error('Error in getProductsByCategory:', error)
    return []
  }
}