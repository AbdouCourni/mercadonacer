// File: types/product.types.ts
// Path: /types/product.types.ts
// Description: SINGLE source of truth for Product types

// ============================================
// CATEGORY
// ============================================
export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  parent_id?: string | null
  display_order?: number
  created_at?: string
  updated_at?: string
}

// ============================================
// PRODUCT VARIANT
// ============================================
export interface ProductVariant {
  id: string
  product_id: string
  name: string
  price: number | string
  stock: number
  sku?: string | null
  created_at?: string
}

// ============================================
// PRODUCT REVIEW
// ============================================
export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment?: string | null
  created_at: string
  // Relations
  profiles?: {
    full_name: string
    avatar_url?: string | null
  }
}

// ============================================
// PRODUCT (main interface)
// Matches the DB schema exactly.
// All numerics can be `number | string` because Supabase
// returns numeric columns as strings.
// ============================================
export interface Product {
  // Identity
  id: string
  name: string
  slug: string
  description: string | null

  // Pricing
  price: number | string
  achat_price: number | string | null
  compare_price: number | string | null

  // Stock
  stock: number
  unit: string | null
  weight: number | string | null

  // Categorization
  category_id: string | undefined
  brand: string | null

  // Identification
  barcode: string | undefined
  sku: string | undefined

  // Media
  images: string[]
  video_url: string | null

  // Status
  is_active: boolean
  is_featured: boolean

  // Ratings
  rating: number | string
  reviews_count: number

  // Promotion
  is_in_promotion: boolean
  promotion_price: number | string | null
  promotion_start: string | null
  promotion_end: string | null

  // Timestamps
  created_at: string
  updated_at: string | null

  // Relations (optional — populated by joins)
  category?: Category
  categories?: Category      // Supabase join name
  variants?: ProductVariant[]
  reviews?: Review[]
}

// ============================================
// PRODUCT FILTERS
// ============================================
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  barcode?: string
  sku?: string
  sort?: {
    by: string
    asc: boolean
  }
  page?: number
  limit?: number
  includeInactive?: boolean
  onlyPromotions?: boolean
}

// ============================================
// HELPERS — Numbers
// ============================================

/** Convert a value to a number safely */
export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

/** Format a price value to a fixed-decimal string */
export function formatPrice(value: number | string | null | undefined): string {
  return toNumber(value).toFixed(2)
}

// ============================================
// HELPERS — Promotion
// ============================================

export function isPromotionActive(product: Product): boolean {
  if (!product.is_in_promotion) return false
  if (!product.promotion_price) return false

  const now = new Date()

  // Check start date
  if (product.promotion_start) {
    const start = new Date(product.promotion_start)
    if (start > now) return false
  }

  // Check end date
  if (product.promotion_end) {
    const end = new Date(product.promotion_end)
    if (end < now) return false
  }

  return true
}

/** Get the effective (displayed/charged) price */
export function getEffectivePrice(product: Product): number {
  if (isPromotionActive(product) && product.promotion_price !== null) {
    return toNumber(product.promotion_price)
  }
  return toNumber(product.price)
}

/** Get the "original" price to show as struck-through */
export function getOriginalPrice(product: Product): number | null {
  if (isPromotionActive(product)) {
    return toNumber(product.price)
  }
  if (product.compare_price) {
    return toNumber(product.compare_price)
  }
  return null
}

/** Get discount percentage (0 if no discount) */
export function getPromotionDiscount(product: Product): number {
  const effective = getEffectivePrice(product)
  const original = toNumber(product.price)

  if (original <= 0 || effective >= original) return 0
  return Math.round(((original - effective) / original) * 100)
}

/** True if the product has any kind of discount */
export function hasDiscount(product: Product): boolean {
  return isPromotionActive(product) || 
         (!!product.compare_price && toNumber(product.compare_price) > toNumber(product.price))
}

// ============================================
// HELPERS — Stock
// ============================================

export function isInStock(product: Product): boolean {
  return toNumber(product.stock) > 0
}