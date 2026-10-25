// File: app/(shop)/page.tsx
// Path: /app/(shop)/page.tsx
// Description: Mercado Nacer — redesigned homepage (screenshot-matched)

import Link from 'next/link'
import {
  Leaf,
  Package,
  ShieldCheck,
  Headphones,
  Truck,
  ArrowRight,
  Grid2X2,
  Tag,
  Star,
  MessageCircle,
  Sparkles,
} from 'lucide-react'

import HeroSection from '@/components/layout/hero-section'
import CategoryGrid from '@/components/category/category-grid'
import ProductCard from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { getProducts } from '@/services/products.service'
import { createClient } from '@/lib/supabase/server'
import { isVitrineMode, VITRINE_WHATSAPP } from '@/lib/site-mode'
import Image from 'next/image'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any
    }
  }
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [
    newProductsResult,
    promoProductsResult,
    categoriesResult,
    heroSlidesResult,
  ] = await Promise.all([
    getProducts({
      limit: 12,
      sort: { by: 'created_at', asc: false },
    }),

    supabase
      .from('products')
      .select(
        `
        *,
        categories:category_id (
          id,
          name,
          slug
        )
      `,
      )
      .eq('is_active', true)
      .eq('is_in_promotion', true)
      .not('promotion_price', 'is', null)
      .or(`promotion_end.is.null,promotion_end.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(8),

    supabase
      .from('categories')
      .select(
        `
        *,
        products:products (count)
      `,
      )
      .eq('display_in_home', true)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true }),

    supabase
      .from('hero_slides')
      .select(
        `
        id,
        title,
        subtitle,
        description,
        cta,
        link,
        image_url,
        icon,
        alt_text
      `,
      )
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  ])

  const newProducts = newProductsResult.products || []
  const promoProducts = promoProductsResult.data || []
  const categories = categoriesResult.data || []
  const heroSlides = heroSlidesResult.data || []
  const vitrine = isVitrineMode()

  const productCard = (product: any) => (
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
  )

  return (
<main className="space-y-4 pb-12 md:space-y-6">
      {/* ==================== HERO ==================== */}
      <section className="container-custom pt-4 md:pt-6">
        <HeroSection slides={heroSlides} />
      </section>

      {/* ==================== TRUST BAR ==================== */}
      <section className="container-custom">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:grid-cols-3 md:grid-cols-5 md:gap-4 md:p-5">
          {[
            {
              icon: Leaf,
              title: 'Produits frais',
              subtitle: 'Fruits & légumes',
            },
            {
              icon: Package,
              title: 'Large choix',
              subtitle: '+5000 produits',
            },
            {
              icon: Tag,
              title: 'Prix compétitifs',
              subtitle: 'Toute l’année',
            },
            {
              icon: ShieldCheck,
              title: 'Paiement sécurisé',
              subtitle: 'En ligne ou à la livraison',
            },
            {
              icon: Headphones,
              title: 'Service client',
              subtitle: 'Toujours à votre écoute',
            },
          ].map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex items-center gap-3 py-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-950 sm:text-sm">{title}</p>
                <p className="mt-0.5 truncate text-[11px] leading-4 text-gray-600 sm:text-xs">
                  {subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== PROMOTIONS ==================== */}
      {promoProducts.length > 0 && (
        <section className="container-custom">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {/* Ticket icon in brand red */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FD1C22] text-white shadow-sm">
                <Tag size={18} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#FD1C22] md:text-2xl">
                  Promotions
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Des offres exceptionnelles à ne pas manquer
                </p>
              </div>
            </div>
            <Link
              href="/promotions"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 sm:text-sm"
            >
              Voir toutes les promotions <ArrowRight size={14} />
            </Link>
          </div>

          {/* 4 products + vertical banner = 5 cols on lg */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {promoProducts.slice(0, 4).map(productCard)}

            {/* Vertical promo banner — "Les essentiels du quotidien" */}
           {/* Vertical promo banner — "Les essentiels du quotidien" */}
<div className="relative col-span-2 overflow-hidden rounded-2xl sm:col-span-1 lg:col-span-1">
  {/* Full-bleed background image */}
  <Image
    src="https://res.cloudinary.com/dfsmkq5mw/image/upload/v1792947196/promosidepanel_gubsuy.png"
    alt="Les essentiels du quotidien"
    fill
    sizes="(max-width: 640px) 100vw, 20vw"
    className="object-cover"
  />

  {/* Readability overlay — light top, slightly darker bottom */}
  <div className="absolute inset-0 bg-gradient-to-b from-amber-50/85 via-lime-50/40 to-transparent" />

  {/* Content on top */}
  <div className="relative z-10 flex h-full min-h-[320px] flex-col p-6">
    <h3 className="text-lg font-extrabold leading-tight text-emerald-950 md:text-xl">
      Les essentiels du quotidien
    </h3>
    <p className="mt-2 text-xs leading-5 text-emerald-900/80 sm:text-sm">
      Qualité, fraîcheur, au meilleur prix.
    </p>
    <div className="flex-1" />
    <Link
      href="/products"
      className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-900 sm:text-sm"
    >
      Découvrir <ArrowRight size={14} />
    </Link>
  </div>
</div>
          </div>
        </section>
      )}

      {/* ==================== CATEGORIES ==================== */}
      <section className="container-custom">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-700">
              <Grid2X2 size={19} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Explorez notre magasin
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">
              Acheter par catégorie
            </h2>
          </div>
          <Link
            href="/categories"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 sm:text-sm"
          >
            Voir toutes les catégories <ArrowRight size={15} />
          </Link>
        </div>

        <CategoryGrid categories={categories} showAllCard />
      </section>

      {/* ==================== NEW PRODUCTS (6-col) ==================== */}
      <section className="container-custom">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">
                Nouveaux produits
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Découvrez nos dernières arrivées
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 sm:text-sm"
          >
            Voir tous les nouveaux produits <ArrowRight size={15} />
          </Link>
        </div>

        {newProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {newProducts.map(productCard)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Aucun nouveau produit pour le moment.
          </div>
        )}
      </section>

      {/* ==================== BOTTOM CTA ==================== */}
      <section className="container-custom">
        {vitrine ? (
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 to-green-700 px-6 py-8 text-white md:px-10 md:py-10">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <MessageCircle size={14} />
                  Commande par WhatsApp
                </span>
                <h2 className="mt-4 text-2xl font-extrabold md:text-3xl">
                  Besoin de faire vos courses ?
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  Contactez-nous sur WhatsApp pour découvrir nos produits et passer votre commande.
                </p>
              </div>
              <a
                href={`https://wa.me/${VITRINE_WHATSAPP.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
              >
                <MessageCircle size={18} className="mr-2" />
                Commander sur WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-green-50 to-amber-50 px-6 py-8 md:px-10 md:py-10">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <Star size={17} className="fill-amber-400 text-amber-500" />
                  Votre marché, près de chez vous
                </div>
                <h2 className="mt-3 text-2xl font-extrabold text-emerald-950 md:text-3xl">
                  Simplifiez vos courses avec NacerMarket
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Découvrez notre sélection de produits pour la maison et profitez d’une
                  expérience d’achat simple et pratique.
                </p>
              </div>
              <Link href="/products" className="shrink-0">
                <Button className="rounded-full bg-emerald-800 px-6 py-3 font-bold text-white hover:bg-emerald-900">
                  Commencer mes achats
                  <ArrowRight size={17} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}