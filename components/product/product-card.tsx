// File: components/product/product-card.tsx
// Path: /components/product/product-card.tsx
// Description: Product card with Add to Cart & Wishlist actions

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart, Star, Barcode, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUser } from '@/services/auth.service'
import { addToGuestCart, dispatchCartUpdate } from '@/services/cart.client.service'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  image: string
  barcode?: string
  sku?: string
  rating?: number
  reviewsCount?: number
  isNew?: boolean
  isSale?: boolean
  stock?: number
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  barcode,
  sku,
  rating = 0,
  reviewsCount = 0,
  isNew = false,
  isSale = false,
  stock = 0
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0
  const isInStock = stock > 0

  // Handle Add to Cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isInStock) return

    setIsAddingToCart(true)

    try {
      const user = await getUser()

      if (user) {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: id,
            quantity: 1,
            variantId: null
          })
        })

        if (response.ok) {
          setShowSuccess(true)
          dispatchCartUpdate()
          setTimeout(() => setShowSuccess(false), 2000)
        }
      } else {
        addToGuestCart(id, 1)
        setShowSuccess(true)
        dispatchCartUpdate()
        setTimeout(() => setShowSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Handle Wishlist toggle
  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const user = await getUser()

      if (!user) {
        window.location.href = '/login?redirect=/products'
        return
      }

      setIsWishlisted(!isWishlisted)

      if (!isWishlisted) {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id })
        })

        if (!response.ok) {
          setIsWishlisted(false)
          throw new Error('Failed to add to wishlist')
        }
      } else {
        const response = await fetch(`/api/wishlist?productId=${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          setIsWishlisted(true)
          throw new Error('Failed to remove from wishlist')
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error)
    }
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 card-hover border border-border/50 relative">
      {/* Image */}
      <Link href={`/products/${slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        <Image
          src={image || '/images/placeholder.jpg'}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges — top-right so they don't overlap the cart button */}
        <div className="absolute top-3 right-12 flex flex-col gap-2 z-10">
          {isNew && (
            <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full shadow">
              Nouveau
            </span>
          )}
          {isSale && discount > 0 && (
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow">
              -{discount}%
            </span>
          )}
        </div>

        {/* Add to Cart — always visible, top-left */}
        {isInStock && (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="absolute top-3 left-3 z-10 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:bg-primary transition-all duration-300 active:scale-95 disabled:opacity-50 group-hover:shadow-lg"
            title="Ajouter au panier"
            aria-label="Ajouter au panier"
          >
            {isAddingToCart ? (
              <Loader2 size={18} className="animate-spin text-primary" />
            ) : showSuccess ? (
              <CheckCircle size={18} className="text-green-600" />
            ) : (
              <ShoppingCart size={18} className="text-primary hover:text-white" />
            )}
          </button>
        )}

        {/* Wishlist — top-right */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors z-10 active:scale-95"
          title="Ajouter aux favoris"
          aria-label="Ajouter aux favoris"
        >
          <Heart
            size={18}
            className={cn(
              "transition-colors",
              isWishlisted ? "fill-red-500 text-red-500" : "text-text-secondary hover:text-primary"
            )}
          />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
            {name}
          </h3>
        </Link>

        {/* Barcode/SKU */}
        {(barcode || sku) && (
          <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary">
            <Barcode size={12} />
            {barcode && <span>Code: {barcode}</span>}
            {sku && <span className="ml-2">SKU: {sku}</span>}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${
                  i < Math.floor(rating)
                    ? 'fill-accent text-accent'
                    : 'text-border fill-border'
                }`}
              />
            ))}
          </div>
          {reviewsCount > 0 && (
            <span className="text-xs text-text-secondary">({reviewsCount})</span>
          )}
        </div>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            {price.toFixed(2)} DH
          </span>
          {comparePrice && (
            <span className="text-sm text-text-secondary line-through">
              {comparePrice.toFixed(2)} DH
            </span>
          )}
        </div>

        {/* Stock status */}
        {!isInStock && (
          <span className="text-sm text-red-500 font-medium">Rupture de stock</span>
        )}

        {/* Success indicator */}
        {showSuccess && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 animate-fade-up z-20">
            <CheckCircle size={12} />
            Ajouté !
          </div>
        )}
      </div>
    </div>
  )
}