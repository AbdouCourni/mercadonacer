// File: app/(shop)/wishlist/page.tsx
// Path: /app/(shop)/wishlist/page.tsx
// Description: Wishlist page

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2, ShoppingCart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUser } from '@/services/auth.service'

interface WishlistItem {
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

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Fetch wishlist
  useEffect(() => {
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
          setItems(data.items || [])
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  // Remove from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setItems(items.filter(item => item.product_id !== productId))
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  // Add to cart
  const addToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          quantity: 1
        })
      })

      if (response.ok) {
        // Remove from wishlist after adding to cart
        await removeFromWishlist(productId)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-custom py-12 text-center">
        <Heart size={48} className="mx-auto text-text-secondary/30 mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Connectez-vous</h1>
        <p className="text-text-secondary mb-6">Pour voir votre liste d'envies, veuillez vous connecter.</p>
        <Link href="/login">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Se connecter
          </Button>
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <Heart size={48} className="mx-auto text-text-secondary/30 mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Votre liste d'envies est vide</h1>
        <p className="text-text-secondary mb-6">Commencez à ajouter vos produits préférés.</p>
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
          <h1 className="text-2xl font-bold text-text-primary">Ma liste d'envies</h1>
          <p className="text-text-secondary text-sm">{items.length} produit{items.length > 1 ? 's' : ''}</p>
        </div>
        <Link href="/products">
          <Button variant="outline" className="text-sm">
            Voir tous les produits
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => {
          const product = item.products
          const discount = product.compare_price 
            ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) 
            : 0
          const isInStock = product.stock > 0

          return (
            <div key={item.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
              <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
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