// File: components/layout/hero-slider.tsx
// Path: /components/layout/hero-slider.tsx
// Description: Enhanced hero slider — mobile optimized

'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ShoppingBag, Truck, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const slides = [
  {
    id: 1,
    title: 'Des Produits Frais',
    subtitle: 'Directement du marché à votre porte',
    description: 'Découvrez notre sélection de fruits, légumes et viandes fraîches, livrés en 24h.',
    cta: 'Découvrir',
    link: '/products',
    image: 'https://i.imgur.com/wTh7ck5.png',
    icon: '🥬',
    alt: 'Produits frais - Fruits et légumes'
  },
  {
    id: 2,
    title: 'Plus de 5000 Produits',
    subtitle: 'Tout ce dont vous avez besoin au même endroit',
    description: 'De l\'épicerie à l\'électroménager, en passant par les jouets et les vêtements.',
    cta: 'Voir les offres',
    link: '/categories',
    image: 'https://i.imgur.com/6B4XoUI.png',
    icon: '🛒',
    alt: '5000 produits - Épicerie et plus'
  },
  {
    id: 3,
    title: 'Livraison Rapide',
    subtitle: 'Recevez vos courses en 24h',
    description: 'Livraison dans toute la région. Commandez en toute confiance.',
    cta: 'Commander maintenant',
    link: '/products',
    image: 'https://i.imgur.com/Cxk50AN.png',
    icon: '🚚',
    alt: 'Livraison rapide - 24h'
  }
]

const features = [
  { icon: <Truck size={16} />, text: 'Livraison 24h' },
  { icon: <Clock size={16} />, text: 'Service 7/7' },
  { icon: <Shield size={16} />, text: 'Paiement sécurisé' },
  { icon: <ShoppingBag size={16} />, text: '5000+ produits' },
]

export default function HeroSlider() {
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
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide
              ? 'opacity-100 scale-100 z-10'
              : 'opacity-0 scale-105 z-0'
          }`}
        >
          {/* Background Image */}
          <Image
            src={slide.image}
            alt={slide.alt || slide.title}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
            quality={85}
          />

          {/* ✅ Overlay — lighter on mobile, darker on desktop */}
          <div className="absolute inset-0 bg-black/40 md:bg-black/50 z-10" />

          {/* ✅ Gradient — subtler on mobile to avoid muddy look */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/70 md:via-black/40 md:to-transparent z-10" />

          {/* Content */}
          <div className="absolute inset-0 flex items-end md:items-center z-20 pb-16 md:pb-0">
            <div className="container-custom w-full">
              <div className="max-w-2xl text-white">
                {/* ✅ Icon — no animation on mobile to save CPU, smaller */}
                <div className="text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-4 inline-block bg-white/15 backdrop-blur-sm p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/20 md:animate-bounce">
                  {slide.icon}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 leading-tight drop-shadow-lg">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-medium mb-2 opacity-95 drop-shadow-lg">
                  {slide.subtitle}
                </p>

                {/* Description — hidden on very small screens */}
                <p className="hidden sm:block text-sm md:text-base opacity-90 mb-4 md:mb-6 max-w-lg drop-shadow-md">
                  {slide.description}
                </p>

                {/* ✅ CTA Buttons — one on mobile, two on desktop */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <Link href={slide.link}>
                    <Button
                      size="md"
                      className="bg-primary text-white hover:bg-primary/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl px-5 md:px-8 text-sm md:text-base"
                    >
                      {slide.cta}
                    </Button>
                  </Link>
                  <Link href="/categories" className="hidden md:inline-block">
                    <Button
                      size="md"
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white/20 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                    >
                      Toutes les catégories
                    </Button>
                  </Link>
                </div>

                {/* ✅ Features — horizontal scroll on mobile, hidden on small */}
                <div className="hidden md:flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/20">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-sm text-white/90 backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                      {feature.icon}
                      <span>{feature.text}</span>
                    </div>
                  ))}
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
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
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