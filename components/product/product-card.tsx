// File: components/product/product-card.tsx
// Path: /components/product/product-card.tsx
// Description: Product card — screenshot-matched layout, full-width CTA, promo-aware

'use client'

import {
  getGuestWishlist,
  toggleGuestWishlist,
  onGuestWishlistChange,
  isInGuestWishlist,
} from '@/lib/wishlist-client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart,
  Heart,
  Star,
  CheckCircle,
  Loader2,
  MessageCircle,
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

  // Wishlist sync for vitrine mode
  useEffect(() => {
    if (!isVitrineMode()) return
    setIsWishlisted(isInGuestWishlist(id))
    const unsubscribe = onGuestWishlistChange(() => {
      setIsWishlisted(isInGuestWishlist(id))
    })
    return unsubscribe
  }, [id])

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
  const strikeThroughPrice = promoActive ? priceNum : comparePriceNum

  const promoDiscount =
    promoActive && priceNum > 0 && effectivePrice < priceNum
      ? Math.round(((priceNum - effectivePrice) / priceNum) * 100)
      : 0

  const legacyDiscount =
    !promoActive && comparePriceNum && comparePriceNum > priceNum
      ? Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)
      : 0

  const discountPercent = promoActive ? promoDiscount : legacyDiscount
  const isInStock = stockNum > 0
  const vitrine = isVitrineMode()

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
          body: JSON.stringify({ productId: id, quantity: 1, variantId: null }),
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
    const message = buildProductOrderMessage(name, effectivePrice, null, 1, slug)
    const url = buildWhatsAppUrl(message)
    window.open(url, '_blank')
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isVitrineMode()) {
      const added = toggleGuestWishlist({
        productId: id,
        name,
        slug,
        price: effectivePrice,
        image: image || '/images/placeholder.jpg',
      })
      setIsWishlisted(added)
      return
    }

    try {
      const user = await getUser()
      if (!user) {
        window.location.href = `/login?redirect=/products/${slug}`
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
        const response = await fetch(`/api/wishlist?productId=${id}`, { method: 'DELETE' })
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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">

      {/* ============ IMAGE + BADGES ============ */}
      <Link
        href={`/products/${slug}`}
        className="relative block aspect-square overflow-hidden bg-white"
      >
        <Image
          src={image || '/images/placeholder.jpg'}
          alt={name}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          className="object-contain bg-white transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount badge — TOP LEFT */}
        {discountPercent > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            -{discountPercent}%
          </span>
        )}

        {isNew && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            Nouveau
          </span>
        )}

        {/* Wishlist — TOP RIGHT */}
        <button
          onClick={handleWishlist}
          className="absolute right-2 top-2 z-10 rounded-full bg-white/95 p-1.5 shadow-sm backdrop-blur-sm transition active:scale-95 hover:bg-white"
          title="Ajouter aux favoris"
          aria-label="Ajouter aux favoris"
        >
          <Heart
            size={16}
            className={cn(
              'transition-colors',
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-emerald-700',
            )}
          />
        </button>
      </Link>

      {/* ============ CONTENT ============ */}
      <div className="flex flex-1 flex-col p-3">
        <Link href={`/products/${slug}`}>
<h3 className="line-clamp-2 min-h-[38px] text-[13px] font-bold leading-snug text-gray-900 transition-colors hover:text-emerald-700">            {name}
          </h3>
        </Link>

        {/* Rating inline: stars + number + (count) */}
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-500">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-gray-700">
            {ratingNum > 0 ? ratingNum.toFixed(1) : '—'}
          </span>
          {reviewsCount > 0 && <span>({reviewsCount})</span>}
        </div>

        {/* Price row */}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-extrabold text-emerald-700">
            {effectivePrice.toFixed(2)} DH
          </span>
          {strikeThroughPrice && strikeThroughPrice > effectivePrice && (
            <span className="text-xs text-gray-400 line-through">
              {strikeThroughPrice.toFixed(2)} DH
            </span>
          )}
        </div>

        {/* Spacer to push CTA to bottom */}
        <div className="flex-1" />

        {/* ============ FULL-WIDTH CTA ============ */}
        {!isInStock ? (
          <button
            disabled
            className="mt-3 w-full cursor-not-allowed rounded-lg bg-gray-200 py-2 text-xs font-semibold text-gray-500"
          >
            Rupture de stock
          </button>
        ) : vitrine ? (
          <button
            onClick={handleWhatsAppOrder}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
          >
            <MessageCircle size={14} />
            WhatsApp
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-60"
          >
            {isAddingToCart ? (
              <Loader2 size={14} className="animate-spin" />
            ) : showSuccess ? (
              <CheckCircle size={14} />
            ) : (
              <ShoppingCart size={14} />
            )}
            {showSuccess ? 'Ajouté !' : 'Ajouter au panier'}
          </button>
        )}
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white shadow">
          <CheckCircle size={12} />
          Ajouté !
        </div>
      )}
    </div>
  )
}