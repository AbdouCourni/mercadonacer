// File: components/product/product-gallery.tsx
// Path: /components/product/product-gallery.tsx
// Description: Product gallery with fullscreen lightbox

'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn, X, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getOptimizedImage } from '@/lib/cloudinary'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  // Empty state
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

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

  const openLightbox = () => {
    setIsLightboxOpen(true)
    setZoom(1)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    setZoom(1)
  }

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isLightboxOpen) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') {
      prevImage()
      setZoom(1)
    }
    if (e.key === 'ArrowRight') {
      nextImage()
      setZoom(1)
    }
    if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(4, z + 0.5))
    if (e.key === '-') setZoom((z) => Math.max(1, z - 0.5))
  }, [isLightboxOpen])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Lock body scroll
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isLightboxOpen])

  // Swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) nextImage()
    if (isRightSwipe) prevImage()
  }

  return (
    <>
      <div className="space-y-4">
        {/* ============================================
            MAIN IMAGE (click → lightbox)
            ============================================ */}
        <div
          className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-border group cursor-zoom-in"
          onClick={openLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={
              getOptimizedImage(images[currentIndex], { width: 800, height: 800 }) ||
              '/images/placeholder.jpg'
            }
            alt={name}
            fill
            className="object-contain p-4 md:p-8 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />

          {/* Zoom hint — always visible on mobile, hover on desktop */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-text-secondary p-2 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <ZoomIn size={18} />
          </div>

          {/* Navigation arrows — always visible on mobile, hover on desktop */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110 z-10"
                aria-label="Image précédente"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110 z-10"
                aria-label="Image suivante"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* ============================================
            THUMBNAILS
            ============================================ */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all bg-white',
                  index === currentIndex
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/50'
                )}
                aria-label={`Voir l'image ${index + 1}`}
              >
                <Image
                  src={
                    getOptimizedImage(image, { width: 150, height: 150 }) ||
                    '/images/placeholder.jpg'
                  }
                  alt={`${name} - image ${index + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============================================
          FULLSCREEN LIGHTBOX
          ============================================ */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>

          {/* Zoom controls */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
              disabled={zoom <= 1}
              className="p-2 text-white rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Zoom arrière"
            >
              <Minus size={18} />
            </button>
            <span className="text-white text-sm font-medium min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
              disabled={zoom >= 4}
              className="p-2 text-white rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Zoom avant"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                  setZoom(1)
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                aria-label="Image précédente"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                  setZoom(1)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                aria-label="Image suivante"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Main image with zoom */}
          <div
            className="relative w-full h-full p-4 md:p-12 overflow-hidden flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full h-full transition-transform duration-200"
              style={{
                transform: `scale(${zoom})`,
                cursor: zoom > 1 ? 'grab' : 'default',
              }}
            >
              <Image
                src={
                  getOptimizedImage(images[currentIndex], { width: 1600, height: 1600 }) ||
                  '/images/placeholder.jpg'
                }
                alt={name}
                fill
                className="object-contain"
                sizes="100vw"
                quality={95}
              />
            </div>
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 right-6 text-white text-sm bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}