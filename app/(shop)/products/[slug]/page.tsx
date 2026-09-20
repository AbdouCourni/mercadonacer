// File: app/(shop)/products/[slug]/page.tsx
// Path: /app/(shop)/products/[slug]/page.tsx
// Description: Product detail page with balanced layout

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug, getProducts } from '@/services/products.service'
import ProductGallery from '@/components/product/product-gallery'
import ProductInfo from '@/components/product/product-info'
import RelatedProducts from '@/components/product/related-products'
import ProductReviews from '@/components/product/product-reviews'
import { ChevronRight, Home } from 'lucide-react'
export const dynamic = 'force-dynamic'



interface ProductPageProps {
  params: {
    slug: string
  }
}

// Generate static paths for all products (ISR)
// export async function generateStaticParams() {
//   const { products } = await getProducts({ limit: 100 })
//   return products.map((product) => ({
//     slug: product.slug,
//   }))
// }

export default async function ProductPage({ params }: ProductPageProps) {
  // Wait for params to be available
  const { slug } = await params
  
  // Get product data
  const product = await getProductBySlug(slug)
  
  if (!product) {
    notFound()
  }

  // Get related products (same category)
  const { products: relatedProducts } = await getProducts({
    category: product.category_id,
    limit: 4,
  })

  // Filter out current product from related
  const filteredRelated = relatedProducts.filter(p => p.id !== product.id)

  return (
    <div className="container-custom py-6 md:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home size={14} />
          Accueil
        </Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-primary transition-colors">
          Produits
        </Link>
        <ChevronRight size={14} />
        <Link 
          href={`/categories/${product.category?.slug}`} 
          className="hover:text-primary transition-colors"
        >
          {product.category?.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-text-primary font-medium truncate max-w-[150px] md:max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Product Section - Balanced 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-10">
        {/* Left: Gallery - Reduced max height */}
        <div className="space-y-4">
          <ProductGallery 
            images={product.images || ['/images/placeholder.jpg']} 
            name={product.name}
          />
          
          {/* Product meta - Compact */}
          <div className="flex flex-wrap gap-3 text-xs text-text-secondary border-t border-border pt-4">
            {product.sku && (
              <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                <span className="font-medium">SKU:</span>
                <span className="font-mono">{product.sku}</span>
              </div>
            )}
            {product.barcode && (
              <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                <span className="font-medium">Code:</span>
                <span className="font-mono">{product.barcode}</span>
              </div>
            )}
            {product.brand && (
              <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                <span className="font-medium">Marque:</span>
                <span>{product.brand}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Info - More compact */}
        <div>
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Product Description - Clean and readable */}
      {product.description && (
        <div className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-3">
            Description du produit
          </h2>
          <div className="bg-muted/30 p-6 rounded-xl border border-border">
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        </div>
      )}

      {/* Related Products */}
      {filteredRelated.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
            Produits similaires
          </h2>
          <RelatedProducts products={filteredRelated} />
        </div>
      )}

      {/* Reviews Section */}
      <div>
        <ProductReviews 
          productId={product.id} 
          rating={product.rating || 0}
          reviewsCount={product.reviews_count || 0}
        />
      </div>
    </div>
  )
}