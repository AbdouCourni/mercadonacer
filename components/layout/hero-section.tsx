// File: components/layout/hero-section.tsx
// Path: /components/layout/hero-section.tsx
// Description: Hero with continuous floating product marquee and delivery sidebar.

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Truck, ArrowRight } from 'lucide-react'

export interface HeroProduct {
  id: string
  name: string
  slug: string
  image_url: string | null
}

interface HeroSectionProps {
  products?: HeroProduct[]
}

// Fallback products if no products are selected for the hero
const FALLBACK_PRODUCTS: HeroProduct[] = [
  { id: '1', name: 'Produit 1', slug: '#', image_url: null },
  { id: '2', name: 'Produit 2', slug: '#', image_url: null },
  { id: '3', name: 'Produit 3', slug: '#', image_url: null },
  { id: '4', name: 'Produit 4', slug: '#', image_url: null },
]

export default function HeroSection({ products: propProducts }: HeroSectionProps) {
  const baseProducts = propProducts && propProducts.length > 0 ? propProducts : FALLBACK_PRODUCTS
  
  // Duplicate the array 3 times to ensure the marquee is long enough to loop seamlessly
  const marqueeProducts = [...baseProducts, ...baseProducts, ...baseProducts]

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid gap-4 lg:grid-cols-[1fr_300px]"
    >
      {/* ==================== LEFT HERO (MARQUEE) ==================== */}
      <div className="relative flex min-h-[260px] flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#e8f5e0] via-[#eef8e6] to-[#fdf6e3] md:min-h-[320px]">
        
        {/* Edge gradient fades so products slide in/out smoothly */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#e8f5e0] to-transparent md:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#fdf6e3] to-transparent md:w-20" />

        {/* The Moving Marquee Container */}
        <div className="flex w-max animate-marquee gap-5 px-6 hover:[animation-play-state:paused] md:gap-6 md:px-8">
          {marqueeProducts.map((product, idx) => (
            <Link
              key={`${product.id}-${idx}`}
              href={product.image_url ? `/products/${product.slug}` : '#'}
className="group relative flex h-40 w-40 shrink-0 items-center justify-center transition-all duration-300 hover:-translate-y-2 md:h-52 md:w-52"            >
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 160px, 208px"
      className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <span className="text-gray-400">Image</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* ==================== RIGHT CARD: LIVRAISON RAPIDE ==================== */}
      <div className="relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl bg-[#1f5d3a] p-6 text-white shadow-lg md:min-h-[320px]">
        {/* Top row: title left, big truck icon right */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold leading-tight md:text-xl">
              Livraison rapide
            </h3>
            <p className="mt-1 text-sm text-white/80">À Nador et environs</p>
          </div>
          <Truck size={44} strokeWidth={1.25} className="shrink-0 text-white/90" />
        </div>

        {/* Middle row: location + dashed route illustration */}
        <div className="relative z-10 mt-5 flex items-center justify-between">
          <Link
            href="/delivery"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:text-sm"
          >
            Voir nos zones
            <ArrowRight size={14} />
          </Link>

          <div className="relative flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <MapPin size={22} className="text-white" />
            </div>
            {/* dashed line connecting to van below */}
            <svg
              className="absolute -bottom-8 right-2 h-10 w-16 text-white/40"
              viewBox="0 0 60 40"
              fill="none"
              aria-hidden
            >
              <path
                d="M55 2 C40 12, 25 20, 5 38"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
          </div>
        </div>

        {/* Van image — large, bottom, flush right */}
        <div className="relative z-0 mt-auto h-32 w-full md:h-40">
          <Image
            src="https://res.cloudinary.com/dfsmkq5mw/image/upload/v1792938833/livraisoniamge-removebg-preview_wnqhol.png"
            alt="Camion de livraison NacerMarket"
            fill
            sizes="360px"
            className="object-contain object-right-bottom scale-110"
            unoptimized
          />
        </div>
      </div>
    </motion.section>
  )
}