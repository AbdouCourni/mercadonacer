// File: app/(shop)/checkout/page.tsx
// Path: /app/(shop)/checkout/page.tsx
// Description: Complete checkout flow with delivery zone from cart

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Truck, CreditCard, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUser } from '@/services/auth.service'
import { getGuestCart } from '@/services/cart.client.service'
import { CircularZone } from '@/config/delivery-zones'

interface CartItem {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  products: {
    id: string
    name: string
    price: number
    compare_price: number | null
    images: string[]
    stock: number
    slug: string
  }
  product_variants: {
    id: string
    name: string
    price: number
    stock: number
  } | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 🔥 Get delivery zone from URL params
  const deliveryFeeFromUrl = searchParams.get('deliveryFee')
  const zoneIdFromUrl = searchParams.get('zoneId')
  const zoneNameFromUrl = searchParams.get('zoneName')
  const zoneMinOrderFromUrl = searchParams.get('zoneMinOrder')
  const zoneRadiusFromUrl = searchParams.get('zoneRadius')
  const zoneColorFromUrl = searchParams.get('zoneColor')

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedZone, setSelectedZone] = useState<CircularZone | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    address_line2: '',
    city: '',
    postal_code: '',
    delivery_notes: '',
    payment_method: 'cod'
  })

  // 🔥 Set delivery zone from URL
  useEffect(() => {
    if (zoneIdFromUrl && zoneNameFromUrl && deliveryFeeFromUrl) {
      const zone: CircularZone = {
        id: zoneIdFromUrl,
        name: zoneNameFromUrl,
        fee: parseFloat(deliveryFeeFromUrl),
        min_order: parseInt(zoneMinOrderFromUrl || '0'),
        radiusKm: parseFloat(zoneRadiusFromUrl || '0'),
        color: zoneColorFromUrl || '#22c55e',
        center: { lat: 35.169829836951294, lng: -2.933249645530903 }
      }
      setSelectedZone(zone)
      console.log('📍 Zone loaded from cart:', zone)
    }
  }, [zoneIdFromUrl, zoneNameFromUrl, deliveryFeeFromUrl, zoneMinOrderFromUrl, zoneRadiusFromUrl, zoneColorFromUrl])

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getUser()
      setUser(currentUser)
      
      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          full_name: currentUser.user_metadata?.full_name || '',
          email: currentUser.email || '',
          phone: currentUser.user_metadata?.phone || ''
        }))
      }
    }
    checkUser()
  }, [])

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const user = await getUser()
        let items: CartItem[] = []
        
        if (user) {
          const response = await fetch('/api/cart')
          if (response.ok) {
            const data = await response.json()
            items = data.items || []
          }
        } else {
          const guestItems = getGuestCart()
          items = guestItems as any
        }
        
        setCartItems(items)
      } catch (error) {
        console.error('Error fetching cart:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [])

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.products?.price || 0
    return total + (price * item.quantity)
  }, 0)

  // 🔥 Use delivery fee from URL or default to 0
  const deliveryFee = selectedZone?.fee ?? (deliveryFeeFromUrl ? parseFloat(deliveryFeeFromUrl) : 0)
  const total = subtotal + deliveryFee

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Validate required fields
    if (!formData.full_name) {
      setError('Veuillez entrer votre nom complet')
      setSubmitting(false)
      return
    }

    if (!formData.email) {
      setError('Veuillez entrer votre email')
      setSubmitting(false)
      return
    }

    if (!formData.phone) {
      setError('Veuillez entrer votre numéro de téléphone')
      setSubmitting(false)
      return
    }

    if (!formData.address) {
      setError('Veuillez entrer votre adresse')
      setSubmitting(false)
      return
    }

    if (!formData.city) {
      setError('Veuillez entrer votre ville')
      setSubmitting(false)
      return
    }

    try {
      const user = await getUser()
      console.log('👤 Checkout user:', user?.id || 'Guest')

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.products?.price || 0,
            product_name: item.products?.name || '',
            product_slug: item.products?.slug || ''
          })),
          address: formData.address,
          address_line2: formData.address_line2,
          city: formData.city,
          postal_code: formData.postal_code,
          delivery_notes: formData.delivery_notes,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          payment_method: 'cod',
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          tax: 0,
          total: total,
          // 🔥 Pass zone info to order
          zone_id: selectedZone?.id || zoneIdFromUrl || null,
          zone_name: selectedZone?.name || zoneNameFromUrl || null,
          delivery_code: generateDeliveryCode()

        })
      })

      const data = await response.json()

      if (response.ok) {
        // Clear guest cart
        if (!user) {
          localStorage.removeItem('cart')
          window.dispatchEvent(new Event('cartUpdated'))
        }
        router.push(`/checkout/success?order=${data.order_number}`)
      } else {
        setError(data.error || 'Erreur lors de la création de la commande')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      setError('Erreur lors de la création de la commande')
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================
// HELPER: Generate Delivery Code
// ============================================

function generateDeliveryCode(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
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
      <div className="flex items-center gap-4 mb-6">
       <Link 
  href={{
    pathname: '/cart',
    query: {
      deliveryFee: deliveryFee,
      zoneId: selectedZone?.id || '',
      zoneName: selectedZone?.name || '',
      zoneMinOrder: selectedZone?.min_order || 0,
      zoneRadius: selectedZone?.radiusKm || 0,
      zoneColor: selectedZone?.color || ''
    }
  }} 
  className="p-2 hover:bg-muted rounded-lg transition-colors"
>
  <ArrowLeft size={20} />
</Link>
        <h1 className="text-2xl font-bold text-text-primary">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Une erreur est survenue</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-4">Informations personnelles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  placeholder="+212 6XX-XXXXXX"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-4">Adresse de livraison</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                    placeholder="Rue, numéro, quartier"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Complément d'adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Appartement, étage, résidence..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="60000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Notes de livraison
                  </label>
                  <textarea
                    rows={2}
                    value={formData.delivery_notes}
                    onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Instructions spéciales pour le livreur..."
                  />
                </div>

                {/* 🔥 Show selected zone */}
                {selectedZone && (
                  <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-text-secondary">
                      Zone de livraison: <span className="font-medium text-text-primary">{selectedZone.name}</span>
                      {' · '}
                      <span className="text-primary font-bold">{selectedZone.fee} DH</span>
                      {' · Rayon '}
                      <span className="font-medium">{selectedZone.radiusKm} km</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment - Only COD */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-4">Moyen de paiement</h2>
              
              <div className="p-4 border-2 border-primary rounded-xl bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                  <Truck size={20} className="text-primary" />
                  <div>
                    <p className="font-medium text-text-primary">Paiement à la livraison</p>
                    <p className="text-xs text-text-secondary">Payez en espèces à la réception</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3 opacity-60">
                  <CreditCard size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-500">Carte bancaire</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                      Bientôt disponible
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                'Confirmer la commande'
              )}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
            <h2 className="font-semibold text-text-primary mb-4">Résumé</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.products?.images?.[0] && (
                      <img
                        src={item.products.images[0]}
                        alt={item.products.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.products?.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {item.quantity} x {(item.products?.price || 0).toFixed(2)} DH
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {((item.products?.price || 0) * item.quantity).toFixed(2)} DH
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-text-secondary">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Livraison</span>
                <span>
                  {deliveryFee === 0 ? 'Gratuite' : `${deliveryFee.toFixed(2)} DH`}
                  {selectedZone && (
                    <span className="text-xs text-text-secondary ml-1">
                      ({selectedZone.name})
                    </span>
                  )}
                </span>
              </div>
              
              <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border">
                <span>Total</span>
                <span>{total.toFixed(2)} DH</span>
              </div>
            </div>

            {/* 🔥 REMOVED free shipping over 200 DH */}
          </div>
        </div>
      </div>
    </div>
  )
}