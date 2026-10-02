// File: components/product/product-card.tsx
// Path: /components/product/product-card.tsx
// Description: Product card with promo, WhatsApp, and cart actions

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart,
  Heart,
  Star,
  Barcode,
  CheckCircle,
  Loader2,
  MessageCircle,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUser } from '@/services/auth.service'
import { addToGuestCart, dispatchCartUpdate } from '@/services/cart.client.service'
import { isVitrineMode, buildWhatsAppUrl, buildProductOrderMessage } from '@/lib/site-mode'
import { toNumber, isPromotionActive } from '@/types/product.types'

// ============================================
// TYPES
// ============================================

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number | string
  comparePrice?: number | string | null
  image: string
  barcode?: string
  sku?: string
  rating?: number | string
  reviewsCount?: number
  isNew?: boolean
  isSale?: boolean
  stock?: number

  // Promotion
  isInPromotion?: boolean
  promotionPrice?: number | string | null
  promotionStart?: string | null
  promotionEnd?: string | null
}

// ============================================
// COMPONENT
// ============================================

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
  stock = 0,
  isInPromotion = false,
  promotionPrice = null,
  promotionStart = null,
  promotionEnd = null,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // ============================================
  // NORMALIZE
  // ============================================
  const priceNum = toNumber(price)
  const comparePriceNum = comparePrice ? toNumber(comparePrice) : null
  const ratingNum = toNumber(rating)
  const promoPriceNum = promotionPrice ? toNumber(promotionPrice) : null
  const stockNum = stock || 0

  // ============================================
  // PROMO STATE
  // ============================================
  const promoActive = isPromotionActive({
    is_in_promotion: isInPromotion,
    promotion_price: promoPriceNum,
    promotion_start: promotionStart,
    promotion_end: promotionEnd,
  } as any)

  const effectivePrice = promoActive && promoPriceNum !== null ? promoPriceNum : priceNum

  const strikeThroughPrice = promoActive
    ? priceNum
    : comparePriceNum

  const promoDiscount = promoActive && priceNum > 0 && effectivePrice < priceNum
    ? Math.round(((priceNum - effectivePrice) / priceNum) * 100)
    : 0

  const legacyDiscount =
    !promoActive && comparePriceNum && comparePriceNum > priceNum
      ? Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)
      : 0

  const isInStock = stockNum > 0

  // ============================================
  // HANDLERS
  // ============================================
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
            variantId: null,
          }),
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

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Send effective price (promo applies)
const message = buildProductOrderMessage(name, effectivePrice, null, 1, slug)
    const url = buildWhatsAppUrl(message)
    window.open(url, '_blank')
  }

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
          body: JSON.stringify({ productId: id }),
        })

        if (!response.ok) {
          setIsWishlisted(false)
          throw new Error('Failed to add to wishlist')
        }
      } else {
        const response = await fetch(`/api/wishlist?productId=${id}`, {
          method: 'DELETE',
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

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 relative">
      {/* ============================================
          IMAGE + OVERLAYS
          ============================================ */}
      <Link
        href={`/products/${slug}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <Image
          src={image || '/images/placeholder.jpg'}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
        />

        {/* ============================================
            BADGES (top-right, stacked)
            ============================================ */}
        <div className="absolute top-3 right-12 flex flex-col gap-2 z-10">
          {isNew && (
            <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full shadow">
              Nouveau
            </span>
          )}

          {promoActive && promoDiscount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow flex items-center gap-1">
              <Tag size={12} />
              -{promoDiscount}%
            </span>
          )}

          {!promoActive && isSale && legacyDiscount > 0 && (
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow">
              -{legacyDiscount}%
            </span>
          )}
        </div>

        {/* PROMO ribbon under cart button */}
        {promoActive && (
          <div className="absolute top-14 left-3 z-20 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md">
            PROMO
          </div>
        )}

        {/* ============================================
            ACTION BUTTON (top-left)
            ============================================ */}
        {isInStock && (
          <>
            {isVitrineMode() ? (
              <button
                onClick={handleWhatsAppOrder}
                className="absolute top-3 left-3 z-10 p-2 bg-green-600 rounded-full shadow-md hover:bg-green-700 transition-all duration-300 active:scale-95"
                title="Commander via WhatsApp"
                aria-label="Commander via WhatsApp"
              >
                <MessageCircle size={18} className="text-white" />
              </button>
            ) : (
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
                  <ShoppingCart size={18} className="text-primary" />
                )}
              </button>
            )}
          </>
        )}

        {/* ============================================
            WISHLIST (top-right) — hidden in vitrine
            ============================================ */}
        {!isVitrineMode() && (
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors z-10 active:scale-95"
            title="Ajouter aux favoris"
            aria-label="Ajouter aux favoris"
          >
            <Heart
              size={18}
              className={cn(
                'transition-colors',
                isWishlisted
                  ? 'fill-red-500 text-red-500'
                  : 'text-text-secondary hover:text-primary'
              )}
            />
          </button>
        )}
      </Link>

      {/* ============================================
          CONTENT
          ============================================ */}
      <div className="p-4">
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
            {name}
          </h3>
        </Link>

        {/* Barcode / SKU */}
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
                  i < Math.floor(ratingNum)
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

        {/* ============================================
            PRICE — promo-aware
            ============================================ */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-primary">
            {effectivePrice.toFixed(2)} DH
          </span>
          {strikeThroughPrice && strikeThroughPrice > effectivePrice && (
            <span className="text-sm text-text-secondary line-through">
              {strikeThroughPrice.toFixed(2)} DH
            </span>
          )}
        </div>

        {/* Stock status */}
        {!isInStock && (
          <span className="text-sm text-red-500 font-medium">
            Rupture de stock
          </span>
        )}

        {/* Success toast */}
        {showSuccess && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 z-20">
            <CheckCircle size={12} />
            Ajouté !
          </div>
        )}
      </div>
    </div>
  )
}