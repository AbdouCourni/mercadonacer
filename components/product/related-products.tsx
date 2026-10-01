'use client'

import ProductCard from '@/components/product/product-card'

interface RelatedProductsProps {
  products: any[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          price={product.price}
          comparePrice={product.compare_price}
          image={product.images?.[0] || '/images/placeholder.jpg'}
          barcode={product.barcode}
          sku={product.sku}
          rating={product.rating || 0}
          reviewsCount={product.reviews_count || 0}
          stock={product.stock || 0}
          isInPromotion={product.is_in_promotion}
          promotionPrice={product.promotion_price}
          promotionStart={product.promotion_start}
          promotionEnd={product.promotion_end}
        />
      ))}
    </div>
  )
}