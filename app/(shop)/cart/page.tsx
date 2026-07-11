// File: app/(shop)/cart/page.tsx
// Path: /app/(shop)/cart/page.tsx
// Description: Shopping cart page

'use client'

import { useCart } from '@/hooks/use-cart'
import Link from 'next/link'
import Image from 'next/image'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  CreditCard,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function CartPage() {
  const {
    items,
    loading,
    itemCount,
    updateQuantity,
    removeFromCart,
    getTotal
  } = useCart()

  const subtotal = getTotal()
  const deliveryFee = subtotal >= 200 ? 0 : 30
 // const tax = subtotal * 0.07 // 7% VAT
  const total = subtotal + deliveryFee 

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-12">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Votre panier est vide
          </h1>
          <p className="text-text-secondary mb-6">
            Découvrez nos produits et faites votre shopping
          </p>
          <Link href="/products">
            <Button className="bg-primary text-white hover:bg-primary/90">
              Découvrir nos produits
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">
        Votre Panier ({itemCount} articles)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.products
            const variant = item.product_variants
            const price = variant?.price || product?.price || 0
            const name = product?.name || 'Produit'
            const image = product?.images?.[0] || '/images/placeholder.jpg'

            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white rounded-xl border border-border hover:shadow-md transition-shadow"
              >
              {/* Image */}
<Link
  href={`/products/${product?.slug}`}
  className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden"
>
  {image ? (
    <Image
      src={image}
      alt={name}
      fill
      className="object-cover"
      sizes="96px"
      onError={(e) => {
        // 🔥 If image fails, show fallback
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        // Show fallback div
        const parent = target.parentElement;
        if (parent) {
          const fallback = document.createElement('div');
          fallback.className = 'w-full h-full flex items-center justify-center text-text-secondary/30';
          fallback.innerHTML = '📦';
          parent.appendChild(fallback);
        }
      }}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-text-secondary/30">
      <ShoppingBag size={32} />
    </div>
  )}
</Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${product?.slug}`}
                    className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-2"
                  >
                    {name}
                  </Link>
                  {variant && (
                    <p className="text-sm text-text-secondary">
                      Variante: {variant.name}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-primary">
                      {price.toFixed(2)} DH
                    </span>
                    {product?.compare_price && (
                      <span className="text-sm text-text-secondary line-through">
                        {product.compare_price.toFixed(2)} DH
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  {/* Quantity */}
                  <div className="flex items-center gap-1 border border-border rounded-full overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-muted transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-muted transition-colors"
                      disabled={item.quantity >= (product?.stock || 0)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-text-secondary hover:text-red-600 transition-colors text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Résumé de la commande
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-text-secondary">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Livraison</span>
                <span>{deliveryFee === 0 ? 'Gratuite' : `${deliveryFee.toFixed(2)} DH`}</span>
              </div>
             
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-lg font-bold text-text-primary">
                  <span>Total</span>
                  <span>{total.toFixed(2)} DH</span>
                </div>
              </div>
            </div>

            {deliveryFee === 0 && (
              <div className="mt-3 text-sm text-green-600 bg-green-50 p-2 rounded-lg text-center">
                🎉 Livraison gratuite !
              </div>
            )}

            <Link href="/checkout">
              <Button
                size="lg"
                className="w-full mt-4 bg-primary text-white hover:bg-primary/90 transform hover:scale-105 transition-all duration-300"
              >
                Passer à la caisse
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-text-secondary text-center">
              <div>
                <Truck size={16} className="mx-auto mb-1" />
                Livraison 24h
              </div>
              <div>
                <CreditCard size={16} className="mx-auto mb-1" />
                Paiement sécurisé
              </div>
              <div>
                <Shield size={16} className="mx-auto mb-1" />
                Satisfait ou remboursé
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}