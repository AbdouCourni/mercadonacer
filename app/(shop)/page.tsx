// File: app/(shop)/page.tsx
// Path: /app/(shop)/page.tsx
// Description: Homepage with hero, promos, categories, and new products

import HeroSlider from '@/components/layout/hero-slider'
import CategoryCard from '@/components/category/category-card'
import ProductCard from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getProducts } from '@/services/products.service'
import { createClient } from '@/lib/supabase/server'
import { isVitrineMode, VITRINE_WHATSAPP } from '@/lib/site-mode'
import { Tag, MessageCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch in parallel:
  // 1. New products (latest 8)
  // 2. Promo products (up to 8)
  // 3. Top categories (by display_order, with count)
  const [newProductsResult, promoProductsResult, categoriesResult,heroSlidesResult] = await Promise.all([
    // New products
    getProducts({
      limit: 8,
      sort: { by: 'created_at', asc: false },
    }),

    // Promo products
    supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .eq('is_in_promotion', true)
      .not('promotion_price', 'is', null)
      .or(`promotion_end.is.null,promotion_end.gte.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(8),

    // Categories (important first)
 supabase
  .from('categories')
  .select(`
    *,
    products:products (count)
  `)
  .eq('display_in_home', true)
  .order('display_order', { ascending: true, nullsFirst: false })
  .order('name', { ascending: true }),

  supabase
    .from('hero_slides')
    .select('id, title, subtitle, description, cta, link, image_url, icon, alt_text')
    .eq('is_active', true)
    .order('display_order', { ascending: true }),
  ])

  const newProducts = newProductsResult.products || []
  const promoProducts = promoProductsResult.data || []
  const categories = categoriesResult.data || []
  const heroSlides = heroSlidesResult.data || []

  const vitrine = isVitrineMode()

  return (
    <div className="space-y-10 md:space-y-14 pb-12">
      {/* ============================================
          HERO
          ============================================ */}
      <section className="container-custom pt-8">
  <HeroSlider slides={heroSlides} />
      </section>

      {/* ============================================
          PROMOTIONS (only if any)
          ============================================ */}
      {promoProducts.length > 0 && (
        <section className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Tag size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                  Promotions
                </h2>
                <p className="text-sm text-text-secondary">
                  Offres limitées · Ne manquez pas
                </p>
              </div>
            </div>
            <Link href="/promotions">
              <Button
                variant="outline"
                className="hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
              >
                Voir tout
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {promoProducts.map((product: any) => (
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
                isInPromotion={product.is_in_promotion}
                promotionPrice={product.promotion_price}
                promotionStart={product.promotion_start}
                promotionEnd={product.promotion_end}
              />
            ))}
          </div>
        </section>
      )}

      {/* ============================================
          CATEGORIES
          ============================================ */}
      <section className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
              Nos <span className="text-gradient">Catégories</span>
            </h2>
            <p className="text-sm text-text-secondary">
              Explorez notre large gamme de produits
            </p>
          </div>
          <Link href="/categories">
            <Button
              variant="outline"
              className="hover:bg-primary hover:text-white transition-colors"
            >
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

      {/* ============================================
          NEW PRODUCTS
          ============================================ */}
      <section className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
              Nouveaux <span className="text-gradient">Produits</span>
            </h2>
            <p className="text-sm text-text-secondary">
              Les dernières arrivées dans notre boutique
            </p>
          </div>
          <Link href="/products">
            <Button
              variant="outline"
              className="hover:bg-primary hover:text-white transition-colors"
            >
              Voir tout
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {newProducts.map((product: any) => (
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
              isInPromotion={product.is_in_promotion}
              promotionPrice={product.promotion_price}
              promotionStart={product.promotion_start}
              promotionEnd={product.promotion_end}
            />
          ))}
        </div>
      </section>

      {/* ============================================
          CTA BANNER (mode-aware)
          ============================================ */}
      <section className="container-custom">
        {vitrine ? (
          // Vitrine: WhatsApp CTA
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-green-500 p-8 md:p-12 text-white">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-3">
                <MessageCircle size={14} />
                Commande par WhatsApp
              </div>
              <h3 className="text-2xl md:text-4xl font-bold mb-3">
                Commandez facilement via WhatsApp
              </h3>
              <p className="text-white/90 mb-6 max-w-lg">
                Notre boutique en ligne arrive bientôt. En attendant, 
                contactez-nous directement sur WhatsApp pour passer votre commande.
              </p>
              <a
href={`https://wa.me/${VITRINE_WHATSAPP.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-white text-green-700 hover:bg-white/90 transform hover:scale-105 transition-all duration-300"
                >
                  <MessageCircle size={18} className="mr-2" />
                  Commander maintenant
                </Button>
              </a>
            </div>
          </div>
        ) : (
          // Commerce: normal promo banner
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent-2 p-8 md:p-12 text-white">
            <div className="relative z-10 max-w-2xl">
              <h3 className="text-2xl md:text-4xl font-bold mb-3">
                Découvrez nos nouveautés
              </h3>
              <p className="text-white/90 mb-6 max-w-lg">
                Des produits frais et de qualité, livrés directement chez vous.
              </p>
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
        )}
      </section>
    </div>
  )
}