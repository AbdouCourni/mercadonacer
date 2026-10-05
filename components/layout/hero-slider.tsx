// File: components/layout/hero-slider.tsx
// Path: /components/layout/hero-slider.tsx
// Description: Enhanced hero slider — mobile optimized

'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ShoppingBag, Truck, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface HeroSlide {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  cta: string | null
  link: string | null
  image_url: string
  icon: string | null
  alt_text: string | null
}

interface HeroSliderProps {
  slides?: HeroSlide[]
}

// Fallback slides if DB is empty
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'fallback-1',
    title: 'Bienvenue chez Mercado Nacer',
    subtitle: 'Votre supermarché en ligne',
    description: 'Découvrez nos produits frais et de qualité.',
    cta: 'Découvrir',
    link: '/products',
    image_url: 'https://i.imgur.com/wTh7ck5.png',
    icon: '🛍️',
    alt_text: 'Bienvenue chez Mercado Nacer',
  },
]

export default function HeroSlider({ slides: propSlides }: HeroSliderProps) {
  const slides = propSlides && propSlides.length > 0 ? propSlides : FALLBACK_SLIDES

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide((prev) => {
      if (index < 0) return slides.length - 1
      if (index >= slides.length) return 0
      return index
    })
  }, [])

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1)
  }, [currentSlide, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1)
  }, [currentSlide, goToSlide])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide, isPaused])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prevSlide, nextSlide])

  return (
    <div
      className="relative w-full h-[380px] sm:h-[420px] md:h-[480px] lg:h-[500px] overflow-hidden rounded-xl md:rounded-2xl shadow-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
            ? 'opacity-100 scale-100 z-10'
            : 'opacity-0 scale-105 z-0'
            }`}
        >
         {/* Background Image */}
<Image
  src={slide.image_url}
  alt={slide.alt_text || slide.title}
  fill
  priority={index === 0}
  className="object-cover"
  sizes="100vw"
  quality={85}
/>

{/* ✅ Lighter overlay — only bottom half for text */}
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

{/* Content */}
<div className="absolute inset-0 flex items-end md:items-center z-20 pb-16 md:pb-0">
  <div className="container-custom w-full">
    <div className="max-w-2xl text-white">
      {/* Icon */}
      <div className="text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-4 inline-block bg-white/15 backdrop-blur-sm p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/20">
        {slide.icon}
      </div>

      {/* Title */}
      <h1 
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 leading-tight"
        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
      >
        {slide.title}
      </h1>

      {/* Subtitle */}
      {slide.subtitle && (
        <p 
          className="text-sm sm:text-base md:text-xl lg:text-2xl font-medium mb-2 opacity-95"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
        >
          {slide.subtitle}
        </p>
      )}

      {/* Description */}
      {slide.description && (
        <p 
          className="hidden sm:block text-sm md:text-base opacity-90 mb-4 md:mb-6 max-w-lg"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
        >
          {slide.description}
        </p>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {slide.link && slide.cta && (
          <Link href={slide.link}>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl px-5 md:px-8 text-sm md:text-base font-semibold"
            >
              {slide.cta}
            </Button>
          </Link>
        )}
        <Link href="/categories" className="hidden md:inline-block">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white/20 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
          >
            Toutes les catégories
          </Button>
        </Link>
      </div>
    </div>
  </div>
</div>
        </div>
      ))}

      {/* Navigation Arrows — smaller on mobile */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur-md text-white p-1.5 md:p-3 rounded-full hover:bg-white/40 transition-all duration-300 hover:scale-110 shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} className="md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur-md text-white p-1.5 md:p-3 rounded-full hover:bg-white/40 transition-all duration-300 hover:scale-110 shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight size={18} className="md:w-6 md:h-6" />
      </button>

      {/* ✅ Dots Indicator — z-40 (above content) and positioned clearly at bottom */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex gap-1.5 md:gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${index === currentSlide
              ? 'w-6 md:w-8 h-2 md:h-2.5 bg-white shadow-lg'
              : 'w-2 h-2 md:h-2.5 bg-white/50 hover:bg-white/70'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter — hidden on mobile to reduce clutter */}
      <div className="hidden md:block absolute bottom-4 right-4 z-40 bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
        {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </div>
  )
}