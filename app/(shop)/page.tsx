// File: app/(shop)/page.tsx
// Path: /app/(shop)/page.tsx
// Description: Homepage with real products from Supabase

import HeroSlider from '@/components/layout/hero-slider'
import CategoryCard from '@/components/category/category-card'
import ProductCard from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getProducts } from '@/services/products.service'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'


export default async function HomePage() {
  const supabase = await createClient()

  const [{ products }, categoriesResult] = await Promise.all([
    getProducts({ 
      limit: 8,
      sort: { by: 'created_at', asc: false }
    }),
    supabase
      .from('categories')
      .select(`
        *,
        products:products (count)
      `)
      .order('name')
      .limit(8)
  ])

  const categories = categoriesResult.data || []

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="container-custom pt-4">
        <HeroSlider />
      </section>

      {/* Categories Section */}
      <section className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            Nos <span className="text-gradient">Catégories</span>
          </h2>
          <Link href="/categories">
            <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors">
              Voir tout
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
         {categories.map((category: any) => {
  const productCount = category.products?.[0]?.count || 0
  return (
    <CategoryCard
      key={category.id}
      id={category.id}
      name={category.name}
      slug={category.slug}
      image={category.image_url}
      productCount={productCount}
    />
  )
})}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            Nouveaux <span className="text-gradient">Produits</span>
          </h2>
          <Link href="/products">
            <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors">
              Voir tout
            </Button>
          </Link>
        </div>

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
              rating={product.rating}
              reviewsCount={product.reviews_count}
              stock={product.stock}
            />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container-custom">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent-2 p-8 md:p-12 text-white">
          <div className="relative z-10 max-w-2xl">
           
            <Link href="/products">
              <Button 
                size="lg"
                className="bg-white text-foreground hover:bg-white/90 transform hover:scale-105 transition-all duration-300"
              >
                Commander maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}