// File: lib/cloudinary.ts
// Path: /lib/cloudinary.ts
// Description: Cloudinary URL optimization helper

interface ImageOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'limit' | 'pad'
  gravity?: 'auto' | 'face' | 'center'
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  dpr?: 'auto' | number
}

/**
 * Optimizes a Cloudinary URL with transformation parameters
 * 
 * @example
 * getOptimizedImage('https://res.cloudinary.com/demo/image/upload/v123/product.jpg', { 
 *   width: 500, 
 *   height: 500 
 * })
 * // Returns: https://res.cloudinary.com/demo/image/upload/c_fill,w_500,h_500,g_auto,f_auto,q_auto,dpr_auto/v123/product.jpg
 */
export function getOptimizedImage(
  url: string | null | undefined,
  options: ImageOptions = {}
): string {
  // Fallback for missing URL
  if (!url) {
    return '/images/placeholder.jpg'
  }

  // Skip optimization for non-Cloudinary URLs
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url
  }

  const {
    width = 500,
    height = 500,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
    dpr = 'auto',
  } = options

  // Build transformation string
  const transformations = [
    `c_${crop}`,
    `w_${width}`,
    `h_${height}`,
    `g_${gravity}`,
    `f_${format}`,
    `q_${quality}`,
    `dpr_${dpr}`,
  ].join(',')

  // Replace /upload/ with /upload/{transformations}/
  return url.replace('/upload/', `/upload/${transformations}/`)
}

/**
 * Get image URL for different contexts
 */
export const imageVariants = {
  thumbnail: (url: string) => 
    getOptimizedImage(url, { width: 150, height: 150 }),
  
  card: (url: string) => 
    getOptimizedImage(url, { width: 500, height: 500 }),
  
  detail: (url: string) => 
    getOptimizedImage(url, { width: 800, height: 800 }),
  
  zoom: (url: string) => 
    getOptimizedImage(url, { width: 1200, height: 1200 }),
  
  cart: (url: string) => 
    getOptimizedImage(url, { width: 100, height: 100 }),
}

/**
 * Get first image from product images array with optimization
 */
export function getProductImage(
  images: string[] | null | undefined,
  variant: keyof typeof imageVariants = 'card'
): string {
  if (!images || images.length === 0) {
    return '/images/placeholder.jpg'
  }
  
  return imageVariants[variant](images[0])
}