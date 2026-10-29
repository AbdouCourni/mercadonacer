// File: components/layout/hero-section.tsx
// Path: /components/layout/hero-section.tsx
// Description: Hero with a paged carousel (2 items desktop, 1 mobile) and delivery sidebar.

'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Truck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

export interface HeroProduct {
  id: string
  name: string
  slug: string
  image_url: string | null
}

interface HeroSectionProps {
  products?: HeroProduct[]
}

const FALLBACK_PRODUCTS: HeroProduct[] = [
  { id: '1', name: 'Produit 1', slug: '#', image_url: null },
  { id: '2', name: 'Produit 2', slug: '#', image_url: null },
  { id: '3', name: 'Produit 3', slug: '#', image_url: null },
  { id: '4', name: 'Produit 4', slug: '#', image_url: null },
]

export default function HeroSection({ products: propProducts }: HeroSectionProps) {
  const baseProducts = propProducts && propProducts.length > 0 ? propProducts : FALLBACK_PRODUCTS
  
  // 1. Chunk the products into groups of 2
  const chunkSize = 2
  const slides = []
  for (let i = 0; i < baseProducts.length; i += chunkSize) {
    slides.push(baseProducts.slice(i, i + chunkSize))
  }

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Auto-play logic
   // Auto-play logic
  useEffect(() => {
    if (isPaused || slides.length <= 1) return
    const timer = setInterval(nextSlide, 2000) // 2 seconds
    return () => clearInterval(timer)
  }, [nextSlide, isPaused, slides.length])

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid gap-4 lg:grid-cols-[1fr_300px]"
    >
      {/* ==================== LEFT HERO (CAROUSEL) ==================== */}
      <div 
        className="relative flex min-h-[260px] flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#e8f5e0] via-[#eef8e6] to-[#fdf6e3] md:min-h-[340px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        
        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-emerald-800 shadow-md backdrop-blur-sm transition hover:bg-white active:scale-95"
              aria-label="Précédent"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-emerald-800 shadow-md backdrop-blur-sm transition hover:bg-white active:scale-95"
              aria-label="Suivant"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Slides Container */}
        <div className="relative w-full h-full flex items-center justify-center px-10 md:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut",...(isPaused && { duration: 0 }) }}
              className="flex w-full items-center justify-center gap-4 md:gap-8"
            >
              {slides[currentSlide]?.map((product, idx) => (
                <Link
                  key={product.id}
                  href={product.image_url ? `/products/${product.slug}` : '#'}
                  // 👇 Mobile: Show only the first product (idx 0). Desktop: Show both.
                  className={`group relative flex shrink-0 items-center justify-center transition-all duration-300 hover:-translate-y-2 
                    ${idx === 0 ? 'flex h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64' : 'hidden md:flex md:h-64 md:w-64'}
                  `}
                >
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 192px, 256px"
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-gray-400">Image</span>
                  )}
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Indicator */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-6 bg-emerald-700' : 'w-2 bg-emerald-700/30 hover:bg-emerald-700/60'
                }`}
                aria-label={`Aller à la diapositive ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ==================== RIGHT CARD: LIVRAISON RAPIDE ==================== */}
      <div className="relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl bg-[#1f5d3a] p-6 text-white shadow-lg md:min-h-[340px]">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold leading-tight md:text-xl">
              Livraison rapide
            </h3>
            <p className="mt-1 text-sm text-white/80">À Nador et environs</p>
          </div>
          <Truck size={44} strokeWidth={1.25} className="shrink-0 text-white/90" />
        </div>

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
            <svg className="absolute -bottom-8 right-2 h-10 w-16 text-white/40" viewBox="0 0 60 40" fill="none" aria-hidden>
              <path d="M55 2 C40 12, 25 20, 5 38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>

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