// File: components/product/product-info.tsx
// Path: /components/product/product-info.tsx
// Description: Product information with promo, WhatsApp, and cart

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Truck,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageCircle,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getUser } from '@/services/auth.service'
import { addToGuestCart, dispatchCartUpdate } from '@/services/cart.client.service'
import { buildProductOrderMessage, buildWhatsAppUrl, isVitrineMode } from '@/lib/site-mode'
import { toNumber, isPromotionActive } from '@/types/product.types'

interface ProductInfoProps {
  product: any
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [wishlistId, setWishlistId] = useState<string | null>(null)

  const hasVariants = product.variants && product.variants.length > 0
  const variants = product.variants || []

  // ============================================
  // PROMO CALCULATION
  // ============================================
  const promoActive = isPromotionActive({
    is_in_promotion: product.is_in_promotion,
    promotion_price: product.promotion_price,
    promotion_start: product.promotion_start,
    promotion_end: product.promotion_end,
  } as any)

  const basePrice = toNumber(product.price)
  const effectivePrice = promoActive && product.promotion_price
    ? toNumber(product.promotion_price)
    : basePrice

  const comparePriceNum = product.compare_price
    ? toNumber(product.compare_price)
    : null

  const promoDiscount = promoActive && basePrice > 0 && effectivePrice < basePrice
    ? Math.round(((basePrice - effectivePrice) / basePrice) * 100)
    : 0

  // ============================================
  // WISHLIST CHECK
  // ============================================
  useEffect(() => {
    const checkAuthAndWishlist = async () => {
      const user = await getUser()
      setIsLoggedIn(!!user)

      if (user) {
        try {
          const response = await fetch(`/api/wishlist/check?productId=${product.id}`)
          if (response.ok) {
            const data = await response.json()
            setIsWishlisted(data.inWishlist)
            setWishlistId(data.wishlistId || null)
          }
        } catch (error) {
          console.error('Error checking wishlist:', error)
        }
      }
    }

    checkAuthAndWishlist()
  }, [product.id])

  // ============================================
  // VARIANT
  // ============================================
  const selectedVariantData = selectedVariant
    ? variants.find((v: any) => v.id === selectedVariant)
    : null

  // If a variant is selected, its price overrides
  const displayPrice = selectedVariantData
    ? toNumber(selectedVariantData.price)
    : effectivePrice

  const displayComparePrice = selectedVariantData
    ? (selectedVariantData.compare_price ? toNumber(selectedVariantData.compare_price) : null)
    : (promoActive ? basePrice : comparePriceNum)

  const displayStock = selectedVariantData
    ? selectedVariantData.stock
    : product.stock

  const isInStock = displayStock > 0

  // ============================================
  // ADD TO CART
  // ============================================
  const handleAddToCart = async () => {
    if (!isInStock) {
      setError('Ce produit est en rupture de stock')
      return
    }

    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    setIsAddingToCart(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant || null,
          quantity,
        }),
      })

      if (response.ok) {
        setSuccess('Produit ajouté au panier !')
        dispatchCartUpdate()
        router.refresh()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'ajout au panier')
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      setError(error.message || 'Erreur lors de l\'ajout au panier')
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsAddingToCart(false)
    }
  }

  // ============================================
  // WISHLIST
  // ============================================
  const toggleWishlist = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    setIsWishlistLoading(true)
    setError(null)

    try {
      if (isWishlisted) {
        const response = await fetch(`/api/wishlist?productId=${product.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to remove from wishlist')
        }

        setIsWishlisted(false)
        setWishlistId(null)
        setSuccess('Retiré de votre liste d\'envies')
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to add to wishlist')
        }

        const data = await response.json()
        setIsWishlisted(true)
        setWishlistId(data.item?.id || null)
        setSuccess('Ajouté à votre liste d\'envies')
      }

      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      console.error('Wishlist error:', error)
      setError(error.message || 'Erreur lors de la modification')
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsWishlistLoading(false)
    }
  }

  // ============================================
  // GUEST ADD
  // ============================================
  const handleGuestAddToCart = () => {
    addToGuestCart(product.id, quantity, selectedVariant || undefined)
    setSuccess('Produit ajouté au panier ! (en local)')
    setShowLoginPrompt(false)
    setTimeout(() => setSuccess(null), 3000)
  }

  // ============================================
  // WHATSAPP ORDER (vitrine mode)
  // ============================================
  const handleWhatsAppOrder = () => {
    const msg = buildProductOrderMessage(
      product.name,
      displayPrice,           // ✅ uses effective price
      selectedVariantData?.name || null,
      quantity
    )
    window.open(buildWhatsAppUrl(msg), '_blank')
  }

  // ============================================
  // QUANTITY
  // ============================================
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    if (quantity < displayStock) setQuantity(quantity + 1)
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-5">
      {/* Product Name */}
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary leading-tight">
        {product.name}
      </h1>

      {/* Rating */}
      {product.rating > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={cn(
                  i < Math.floor(toNumber(product.rating))
                    ? 'fill-accent text-accent'
                    : 'text-border fill-border'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-text-secondary">
            ({product.reviews_count || 0} avis)
          </span>
        </div>
      )}

      {/* 🆕 PROMO BADGE */}
      {promoActive && promoDiscount > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          <Tag size={14} />
          Promotion : -{promoDiscount}%
        </div>
      )}

      {/* Price */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-3xl font-bold text-primary">
          {displayPrice.toFixed(2)} DH
        </span>
        {displayComparePrice && displayComparePrice > displayPrice && (
          <span className="text-base text-text-secondary line-through">
            {displayComparePrice.toFixed(2)} DH
          </span>
        )}
        {!promoActive && comparePriceNum && comparePriceNum > effectivePrice && (
          <span className="px-3 py-1 bg-primary text-white text-sm font-bold rounded-full">
            -{Math.round(((comparePriceNum - effectivePrice) / comparePriceNum) * 100)}%
          </span>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {isInStock ? (
          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <CheckCircle size={16} />
            En stock
          </span>
        ) : (
          <span className="text-red-600 text-sm font-medium">Rupture de stock</span>
        )}
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <AlertCircle size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                Connectez-vous pour continuer
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Créez un compte ou connectez-vous pour profiter de toutes les fonctionnalités
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/login" className="block w-full">
                <Button className="w-full bg-primary text-white hover:bg-primary/90">
                  Se connecter
                </Button>
              </Link>
              <Link href="/register" className="block w-full">
                <Button variant="outline" className="w-full">
                  Créer un compte
                </Button>
              </Link>
              <button
                onClick={handleGuestAddToCart}
                className="w-full text-sm text-text-secondary hover:text-primary transition-colors py-2"
              >
                Continuer en tant qu'invité
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full text-sm text-text-secondary hover:text-primary transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variants */}
      {hasVariants && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Variante</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant: any) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                className={cn(
                  'px-4 py-2 rounded-full border-2 text-sm transition-all',
                  selectedVariant === variant.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {variant.name}
                {variant.price && toNumber(variant.price) !== basePrice && (
                  <span className="text-xs text-text-secondary ml-1">
                    (+{(toNumber(variant.price) - basePrice).toFixed(2)} DH)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Quantité</label>
        <div className="flex items-center gap-2">
          <button
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="p-2 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={increaseQuantity}
            disabled={quantity >= displayStock}
            className="p-2 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
          </button>
          <span className="text-sm text-text-secondary ml-2">
            {displayStock > 0 ? `Max: ${displayStock}` : 'Stock épuisé'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {isVitrineMode() ? (
          <Button
            size="lg"
            onClick={handleWhatsAppOrder}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle size={18} className="mr-2" />
            Commander via WhatsApp
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!isInStock}
            className="w-full bg-primary"
          >
            <ShoppingCart size={18} className="mr-2" />
            Ajouter au panier
          </Button>
        )}

        {!isVitrineMode() && (
          <Button
            onClick={toggleWishlist}
            disabled={isWishlistLoading}
            variant="outline"
            size="lg"
            className={cn(
              'transition-all duration-300 min-w-[140px]',
              isWishlisted && 'border-primary text-primary bg-primary/10'
            )}
          >
            {isWishlistLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Heart
                  size={18}
                  className={cn('mr-2 transition-all', isWishlisted && 'fill-primary')}
                />
                {isWishlisted ? 'Ajouté' : 'Ajouter aux favoris'}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Delivery Info */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
        <div className="text-center p-2 bg-muted rounded-lg">
          <Truck size={18} className="mx-auto text-primary mb-1" />
          <p className="text-xs text-text-secondary">Livraison 24-48h</p>
        </div>
        <div className="text-center p-2 bg-muted rounded-lg">
          <Clock size={18} className="mx-auto text-primary mb-1" />
          <p className="text-xs text-text-secondary">Support WhatsApp</p>
        </div>
        <div className="text-center p-2 bg-muted rounded-lg">
          <Shield size={18} className="mx-auto text-primary mb-1" />
          <p className="text-xs text-text-secondary">Paiement à la livraison</p>
        </div>
      </div>
    </div>
  )
}