// File: services/products.service.ts
// Path: /services/products.service.ts
// Description: Products service for MercadoNacer — with active-only default

import { createClient } from '@/lib/supabase/server'
import { Product, ProductFilters } from '@/types/product.types'

// Extend the filters type (you can also update types/product.types.ts)
interface ExtendedFilters extends ProductFilters {
  includeInactive?: boolean
}

export async function getProducts(filters?: ExtendedFilters) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (*),
        variants:product_variants (*)
      `)

    // ✅ Only active products by default
    if (!filters?.includeInactive) {
      query = query.eq('is_active', true)
    }

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
  console.error('Supabase query error:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  })
  console.error('Full error:', JSON.stringify(error, null, 2))
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

// ✅ Add includeInactive option for admin usage
export async function getProductBySlug(slug: string, includeInactive = false) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (*),
        variants:product_variants (*)
      `)
      .eq('slug', slug)

    // ✅ Only active products by default
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.single()

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

// ✅ Add includeInactive option (e.g., for admin barcode lookup)
export async function getProductByBarcode(barcode: string, includeInactive = false) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (*),
        variants:product_variants (*)
      `)
      .eq('barcode', barcode)

    // ✅ Only active products by default
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.single()

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

// ✅ searchProducts already filters is_active — add opt-in for admin
export async function searchProducts(query: string, includeInactive = false) {
  try {
    const supabase = await createClient()

    let dbQuery = supabase
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

    if (!includeInactive) {
      dbQuery = dbQuery.eq('is_active', true)
    }

    const { data, error } = await dbQuery.limit(20)

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

// ✅ No changes needed — already filters is_active
export async function getFeaturedProducts(limit: number = 6) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
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

// ✅ No changes needed — already filters is_active
export async function getProductsByCategory(categorySlug: string, limit: number = 20) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
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