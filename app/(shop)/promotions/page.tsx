// File: app/(shop)/promotions/page.tsx
// Path: /app/(shop)/promotions/page.tsx
// Description: Promotions page showing products on sale

import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/product/product-card'
import { Tag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Promotions | Mercado Nacer',
  description: 'Découvrez nos meilleures offres et promotions',
}

export default async function PromotionsPage() {
  const supabase = await createClient()

  const now = new Date().toISOString()

  const { data: products, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .eq('is_in_promotion', true)
    .not('promotion_price', 'is', null)
    .or(`promotion_end.is.null,promotion_end.gte.${now}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Promotions fetch error:', error)
  }

  const promoProducts = products || []

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Tag size={24} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
              Promotions
            </h1>
            <p className="text-text-secondary">
              {count || 0} produit{(count || 0) > 1 ? 's' : ''} en promotion
            </p>
          </div>
        </div>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Profitez de nos offres exceptionnelles sur une sélection de produits. 
          Quantités limitées !
        </p>
      </div>

      {/* Products grid */}
      {promoProducts.length === 0 ? (
        <div className="text-center py-20 bg-muted rounded-2xl">
          <Tag size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Aucune promotion en cours
          </h3>
          <p className="text-text-secondary mb-6">
            Revenez bientôt pour découvrir nos prochaines offres !
          </p>
          <Link href="/products">
            <Button className="bg-primary text-white hover:bg-primary/90">
              Voir tous les produits
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {promoProducts.map((product) => (
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
      )}
    </div>
  )
}