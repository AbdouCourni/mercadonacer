// File: components/product/related-products.tsx
// Path: /components/product/related-products.tsx
// Description: Related products carousel

'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RelatedProductsProps {
  products: any[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 300
    const newScroll = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
    scrollRef.current.scrollTo({ left: newScroll, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {products.length > 3 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-muted transition-colors -ml-4"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-muted transition-colors -mr-4"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Products grid */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex-none w-48 md:w-56 bg-white rounded-xl border border-border hover:shadow-lg transition-all duration-300 group overflow-hidden"
          >
            <div className="relative aspect-square bg-muted overflow-hidden">
              <Image
                src={product.images?.[0] || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 192px, 224px"
              />
              {product.compare_price && (
                <span className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary font-bold">
                  {product.price.toFixed(2)} DH
                </span>
                {product.compare_price && (
                  <span className="text-xs text-text-secondary line-through">
                    {product.compare_price.toFixed(2)} DH
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}