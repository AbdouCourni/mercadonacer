// File: types/product.types.ts
// Path: /types/product.types.ts
// Description: Product types with barcode support for MercadoNacer

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_price?: number
  stock: number
  category_id: string
  brand?: string
  barcode?: string          // ✅ Added barcode field
  sku?: string              // ✅ Added SKU field
  weight?: number
  unit?: string
  images: string[]
  video_url?: string
  is_active: boolean
  is_featured: boolean
  rating: number
  reviews_count: number
  created_at: string
  updated_at: string
  category?: Category
  variants?: ProductVariant[]
  reviews?: Review[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  parent?: Category
  children?: Category[]
  products?: Product[]
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  barcode?: string          // ✅ Added barcode for variants
  sku?: string              // ✅ Added SKU for variants
  price: number
  stock: number
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  user?: {
    full_name: string
  }
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  barcode?: string          // ✅ Added barcode filter
  sku?: string              // ✅ Added SKU filter
  page?: number
  limit?: number
  sort?: {
    by: string
    asc: boolean
  }
}