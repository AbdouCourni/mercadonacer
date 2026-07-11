// File: components/product/product-gallery.tsx
// Path: /components/product/product-gallery.tsx
// Description: Product image gallery with carousel

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  // If no images or only one, show single image
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
          <div className="text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm">Aucune image</p>
          </div>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const selectImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-[4/3] max-h-[420px] bg-muted rounded-2xl overflow-hidden group cursor-zoom-in"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <Image
          src={images[currentIndex] || '/images/placeholder.jpg'}
          alt={name}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            isZoomed ? "scale-150 cursor-zoom-out" : "scale-100"
          )}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        
        {/* Zoom indicator */}
        <button 
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-text-secondary p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            setIsZoomed(!isZoomed)
          }}
        >
          <ZoomIn size={18} />
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-border"
              )}
            >
              <Image
                src={image || '/images/placeholder.jpg'}
                alt={`${name} - image ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}