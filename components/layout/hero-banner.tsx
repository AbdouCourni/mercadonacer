// File: components/layout/hero-banner.tsx
// Path: /components/layout/hero-banner.tsx

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface HeroBannerProps {
  title: string
  subtitle: string
  description: string
  cta: string
  link: string
  image: string
  badge?: string
  backgroundColor?: string
}

export default function HeroBanner({
  title,
  subtitle,
  description,
  cta,
  link,
  image,
  badge,
  backgroundColor = 'bg-[#F3F0E6]', // Default warm beige/green tone
}: HeroBannerProps) {
  return (
    <section className={`relative overflow-hidden rounded-2xl md:rounded-3xl ${backgroundColor}`}>
      <div className="container-custom relative z-10 flex flex-col md:flex-row items-center justify-between py-10 md:py-16 lg:py-20 gap-8">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 space-y-5 text-center md:text-left"
        >
          {badge && (
            <span className="inline-block bg-primary/10 text-primary font-bold text-xs md:text-sm px-4 py-1.5 rounded-full uppercase tracking-wider">
              {badge}
            </span>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
            {title} <br className="hidden md:block" />
            <span className="text-primary italic font-serif">{subtitle}</span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 max-w-md mx-auto md:mx-0">
            {description}
          </p>

          <div className="pt-2">
            <Link href={link}>
              <Button 
                size="lg" 
                className="bg-primary text-white hover:bg-primary/90 h-12 md:h-14 px-8 rounded-full font-bold text-base shadow-lg shadow-primary/20"
              >
                {cta}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Image Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full md:w-1/2 relative h-[300px] md:h-[400px] lg:h-[500px]"
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain md:object-cover rounded-2xl mix-blend-multiply" 
            priority
          />
          {/* Decorative circle behind image */}
          <div className="absolute inset-0 bg-primary/5 rounded-full scale-110 -z-10 blur-3xl" />
        </motion.div>

      </div>
    </section>
  )
}