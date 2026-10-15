// File: app/(shop)/wishlist/page.tsx
// Path: /app/(shop)/wishlist/page.tsx
// Description: Wishlist page — supports vitrine (guest) and commerce (logged) modes

'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  Trash2,
  ShoppingCart,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUser } from '@/services/auth.service'
import {
  isVitrineMode,
  buildWhatsAppUrl,
  VITRINE_WHATSAPP,
} from '@/lib/site-mode'
import {
  GuestWishlistItem,
  getGuestWishlist,
  removeFromGuestWishlist,
  updateGuestWishlistQuantity,
  onGuestWishlistChange,
} from '@/lib/wishlist-client'

// ---------- Types ----------
interface ServerWishlistItem {
  id: string
  product_id: string
  products: {
    id: string
    name: string
    slug: string
    price: number
    compare_price: number | null
    images: string[]
    stock: number
  }
}

// ---------- Build WhatsApp list message ----------
function buildWishlistWhatsAppMessage(
  items: GuestWishlistItem[],
  checkedIds: Set<string>
): string {
  const selected = items.filter((i) => checkedIds.has(i.productId))
  if (selected.length === 0) return ''

  const siteUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'https://nacermarket.com'

  const lines: string[] = [
    'Bonjour Mercado Nacer,',
    '',
    'Je souhaite commander les produits suivants :',
    '',
  ]

  let total = 0
  selected.forEach((item, index) => {
    const lineTotal = item.price * item.quantity
    total += lineTotal
    lines.push(
      `${index + 1}. ${item.name}`,
      `   • Quantité : ${item.quantity}`,
      `   • Prix unitaire : ${item.price.toFixed(2)} DH`,
      `   • Sous-total : ${lineTotal.toFixed(2)} DH`,
      `   • Lien : ${siteUrl}/products/${item.slug}`,
      ''
    )
  })

  lines.push(`💰 Total estimé : ${total.toFixed(2)} DH`)
  lines.push('')
  lines.push('Merci de me confirmer la disponibilité et le délai de livraison.')

  return lines.join('\n')
}

// ============================================
// COMPONENT
// ============================================
export default function WishlistPage() {
  const vitrine = isVitrineMode()

  // --- Mode-specific state ---
  const [guestItems, setGuestItems] = useState<GuestWishlistItem[]>([])
  const [serverItems, setServerItems] = useState<ServerWishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // --- Selection state (vitrine) ---
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  // ============================================
  // LOAD DATA
  // ============================================
  useEffect(() => {
    if (vitrine) {
      // Guest wishlist from localStorage
      setGuestItems(getGuestWishlist())
      setLoading(false)

      // Listen for changes
      const unsubscribe = onGuestWishlistChange(() => {
        setGuestItems(getGuestWishlist())
      })
      return unsubscribe
    }

    // Commerce mode — server wishlist
    const fetchWishlist = async () => {
      try {
        const currentUser = await getUser()
        setUser(currentUser)
        if (!currentUser) {
          setLoading(false)
          return
        }
        const response = await fetch('/api/wishlist')
        if (response.ok) {
          const data = await response.json()
          setServerItems(data.items || [])
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [vitrine])

  // ============================================
  // VITRINE — SELECTION + QUANTITY
  // ============================================
  const toggleChecked = (productId: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const changeQuantity = (productId: string, delta: number) => {
    const item = guestItems.find((i) => i.productId === productId)
    if (!item) return
    updateGuestWishlistQuantity(productId, item.quantity + delta)
  }

  const removeGuestItem = (productId: string) => {
    removeFromGuestWishlist(productId)
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }

  const shareOnWhatsApp = () => {
    const message = buildWishlistWhatsAppMessage(guestItems, checkedIds)
    if (!message) {
      alert('Sélectionnez au moins un produit.')
      return
    }
    window.open(buildWhatsAppUrl(message), '_blank')
  }

  // Stats for header
  const checkedCount = checkedIds.size
  const checkedTotal = useMemo(() => {
    return guestItems
      .filter((i) => checkedIds.has(i.productId))
      .reduce((sum, i) => sum + i.price * i.quantity, 0)
  }, [guestItems, checkedIds])

  // ============================================
  // COMMERCE MODE HANDLERS (keep existing)
  // ============================================
  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setServerItems(serverItems.filter((i) => i.product_id !== productId))
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      if (response.ok) await removeFromWishlist(productId)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  // ============================================
  // VITRINE MODE RENDER
  // ============================================
  if (vitrine) {
    if (guestItems.length === 0) {
      return (
        <div className="container-custom py-12 text-center">
          <Heart size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Votre liste d'envies est vide
          </h1>
          <p className="text-text-secondary mb-6">
            Ajoutez vos produits préférés et partagez-les sur WhatsApp.
          </p>
          <Link href="/products">
            <Button className="bg-primary text-white hover:bg-primary/90">
              Découvrir nos produits
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="container-custom py-8 pb-32 md:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            Ma liste d'envies
          </h1>
          <p className="text-text-secondary text-sm">
            {guestItems.length} produit{guestItems.length > 1 ? 's' : ''} —{' '}
            cochez pour partager sur WhatsApp
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {guestItems.map((item) => {
            const isChecked = checkedIds.has(item.productId)

            return (
              <div
                key={item.productId}
                className={`bg-white rounded-xl border overflow-hidden transition-all ${
                  isChecked
                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                    : 'border-border hover:shadow-md'
                }`}
              >
                {/* Image + checkbox + remove */}
                <div className="relative aspect-square bg-muted">
                  <Link href={`/products/${item.slug}`}>
                    <Image
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  </Link>

                  {/* Checkbox */}
                  <label className="absolute top-2 left-2 flex items-center justify-center w-7 h-7 bg-white rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform z-10">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleChecked(item.productId)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </label>

                  {/* Remove */}
                  <button
                    onClick={() => removeGuestItem(item.productId)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
                    aria-label="Retirer"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-2 min-h-[40px] text-sm">
                      {item.name}
                    </h3>
                  </Link>

                  <p className="text-base font-bold text-primary">
                    {item.price.toFixed(2)} DH
                  </p>

                  {/* Quantity — only when checked */}
                  {isChecked && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => changeQuantity(item.productId, -1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Diminuer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[2rem] text-center font-medium text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => changeQuantity(item.productId, +1)}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                        aria-label="Augmenter"
                      >
                        <Plus size={14} />
                      </button>
                      <span className="ml-auto text-xs text-text-secondary">
                        = {(item.price * item.quantity).toFixed(2)} DH
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Sticky share bar — mobile + desktop */}
        <div className="fixed bottom-0 left-0 right-0 md:sticky md:bottom-4 md:left-auto md:right-4 md:mt-8 z-40 md:z-30 pointer-events-none">
          <div className="pointer-events-auto bg-white md:bg-white md:rounded-2xl shadow-2xl border-t md:border border-border p-4 md:max-w-md md:ml-auto">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-text-secondary">
                {checkedCount === 0
                  ? 'Aucun produit sélectionné'
                  : `${checkedCount} produit${checkedCount > 1 ? 's' : ''} sélectionné${checkedCount > 1 ? 's' : ''}`}
              </span>
              {checkedCount > 0 && (
                <span className="font-bold text-primary">
                  {checkedTotal.toFixed(2)} DH
                </span>
              )}
            </div>

            <button
              onClick={shareOnWhatsApp}
              disabled={checkedCount === 0}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <MessageCircle size={20} />
              Partager sur WhatsApp
            </button>

            <p className="text-[11px] text-text-secondary text-center mt-2">
              Commande via WhatsApp : {VITRINE_WHATSAPP}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // COMMERCE MODE RENDER (unchanged)
  // ============================================
  if (!user) {
    return (
      <div className="container-custom py-12 text-center">
        <Heart size={48} className="mx-auto text-text-secondary/30 mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Connectez-vous
        </h1>
        <p className="text-text-secondary mb-6">
          Pour voir votre liste d'envies, veuillez vous connecter.
        </p>
        <Link href="/login">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Se connecter
          </Button>
        </Link>
      </div>
    )
  }

  if (serverItems.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <Heart size={48} className="mx-auto text-text-secondary/30 mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Votre liste d'envies est vide
        </h1>
        <p className="text-text-secondary mb-6">
          Commencez à ajouter vos produits préférés.
        </p>
        <Link href="/products">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Découvrir nos produits
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Ma liste d'envies
          </h1>
          <p className="text-text-secondary text-sm">
            {serverItems.length} produit{serverItems.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/products">
          <Button variant="outline" className="text-sm">
            Voir tous les produits
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {serverItems.map((item) => {
          const product = item.products
          const discount = product.compare_price
            ? Math.round(
                ((product.compare_price - product.price) /
                  product.compare_price) *
                  100
              )
            : 0
          const isInStock = product.stock > 0

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group"
            >
              <Link
                href={`/products/${product.slug}`}
                className="relative block aspect-square overflow-hidden bg-muted"
              >
                <Image
                  src={product.images?.[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {discount > 0 && (
                  <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                    -{discount}%
                  </span>
                )}
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </Link>

              <div className="p-3">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-2 min-h-[40px] text-sm">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-bold text-primary">
                    {product.price.toFixed(2)} DH
                  </span>
                  {product.compare_price && (
                    <span className="text-xs text-text-secondary line-through">
                      {product.compare_price.toFixed(2)} DH
                    </span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={!isInStock}
                  className="mt-2 w-full py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <ShoppingCart size={14} />
                  {isInStock ? 'Ajouter au panier' : 'Rupture'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}