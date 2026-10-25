// File: components/layout/hero-section.tsx
// Path: /components/layout/hero-section.tsx
// Description: Split hero — dynamic slides left + "Livraison rapide" card right
//              Gradient covers LEFT HALF of image on >=sm, full-width on mobile.

'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Truck,
    ArrowRight,
    ShoppingBasket,
} from 'lucide-react'

export interface HeroSlide {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    cta: string | null
    link: string | null
    image_url: string | null
    icon: string | null
    alt_text: string | null
}

interface HeroSectionProps {
    slides?: HeroSlide[]
}

const FALLBACK_SLIDE: HeroSlide = {
    id: 'fallback-hero',
    title: 'Vos courses au meilleur prix',
    subtitle: 'Fraîcheur · Qualité · Bon prix',
    description:
        'Découvrez notre large sélection de produits pour toute la famille.',
    cta: 'Faire mes courses',
    link: '/categories',
    image_url: null,
    icon: null,
    alt_text: 'Courses au meilleur prix',
}

export default function HeroSection({ slides: propSlides }: HeroSectionProps) {
    const slides =
        propSlides && propSlides.length > 0 ? propSlides : [FALLBACK_SLIDE]

    const [current, setCurrent] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    const goTo = useCallback(
        (i: number) => {
            if (slides.length <= 1) return
            setCurrent((prev) => (i < 0 ? slides.length - 1 : i >= slides.length ? 0 : i))
        },
        [slides.length],
    )
    const next = useCallback(() => goTo(current + 1), [current, goTo])
    const prev = useCallback(() => goTo(current - 1), [current, goTo])

    useEffect(() => {
        if (isPaused || slides.length <= 1) return
        const t = setInterval(next, 6000)
        return () => clearInterval(t)
    }, [next, isPaused, slides.length])

    const active = slides[current]

    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
className="grid gap-4 lg:grid-cols-[1fr_300px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* ==================== LEFT HERO ==================== */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e8f5e0] via-[#eef8e6] to-[#fdf6e3]">        {/* Background image */}
                {active.image_url && (
                    <Image
                        src={active.image_url}
                        alt={active.alt_text || active.title}
                        fill
                        priority
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        className="object-cover object-right"
                    />
                )}

                {/* ===== HALF-COVER GRADIENT OVERLAY =====
            • Mobile  : full-width tint so text stays readable over the image
            • >= sm   : solid white for first ~50%, fades to transparent by midpoint,
                        so the RIGHT HALF of the image shows through cleanly
        */}
                {active.image_url && (
                    <>
                        {/* mobile — full cover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#e8f5e0]/95 via-[#eef8e6]/85 to-[#eef8e6]/40 sm:hidden" />
                        {/* sm+ — covers exactly the left half */}
                        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#e8f5e0] via-[#eef8e6]/95 via-50% to-transparent sm:block" />          </>
                )}

                {/* Content — constrained to the left half on sm+ so it never sits on the image */}
<div className="relative z-10 flex min-h-[220px] flex-col justify-center px-6 py-6 sm:min-h-[260px] sm:max-w-[55%] sm:px-10 md:min-h-[280px] md:py-8">                    {/* Eyebrow */}
                    {active.subtitle && (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-700/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                            {active.subtitle}
                        </span>
                    )}

                    {/* Title */}
                    <h1 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight text-emerald-950 sm:text-3xl md:text-5xl">
                        {active.title}
                    </h1>

                    {/* Description */}
                    {active.description && (
                        <p className="mt-3 max-w-md text-sm leading-6 text-gray-700 sm:text-base">
                            {active.description}
                        </p>
                    )}

                    {/* CTA */}
                    {active.link && (
                        <Link
                            href={active.link}
                            className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-emerald-950 shadow-md transition hover:bg-amber-300 active:scale-[0.98] sm:text-base"
                        >
                            <ShoppingBasket size={18} />
                            {active.cta || 'Faire mes courses'}
                            <ArrowRight size={16} />
                        </Link>
                    )}
                </div>

                {/* Slider controls — only if >1 slide */}
                {slides.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            aria-label="Slide précédente"
                            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-emerald-900 shadow-md backdrop-blur-sm transition hover:bg-white md:left-4 md:p-2"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={next}
                            aria-label="Slide suivante"
                            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-emerald-900 shadow-md backdrop-blur-sm transition hover:bg-white md:right-4 md:p-2"
                        >
                            <ChevronRight size={18} />
                        </button>

                        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/70 px-2 py-1 backdrop-blur-sm">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    aria-label={`Slide ${i + 1}`}
                                    className={
                                        i === current
                                            ? 'h-2 w-6 rounded-full bg-emerald-700 transition-all'
                                            : 'h-2 w-2 rounded-full bg-emerald-700/40 transition-all hover:bg-emerald-700/60'
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

           {/* ==================== RIGHT CARD: LIVRAISON RAPIDE ==================== */}
<div className="relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl bg-[#1f5d3a] p-6 text-white shadow-lg">
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
    {/* "Voir nos zones" outlined button */}
    <Link
      href="/delivery"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:text-sm"
    >
      Voir nos zones
      <ArrowRight size={14} />
    </Link>

    {/* Map pin + dashed route illustration */}
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
<div className="relative z-0 mt-1 h-40 w-full">
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