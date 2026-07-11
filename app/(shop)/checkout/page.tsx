// File: app/(shop)/checkout/page.tsx
// Path: /app/(shop)/checkout/page.tsx
// Description: Complete checkout flow

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Truck, CreditCard, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUser } from '@/services/auth.service'
import { getGuestCart } from '@/services/cart.client.service'

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

interface DeliveryZone {
  id: string
  name: string
  cities: string[]
  fee: number
  min_order_amount: number
  estimated_time: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null)

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
    payment_method: 'cod' // 'cod' or 'card'
  })

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
          // Convert guest cart to display format
          // For now, we'll just use guest cart
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

  // Fetch delivery zones
  useEffect(() => {
    const fetchDeliveryZones = async () => {
      try {
        const response = await fetch('/api/delivery-zones')
        if (response.ok) {
          const data = await response.json()
          setDeliveryZones(data.zones || [])
          if (data.zones && data.zones.length > 0) {
            setSelectedZone(data.zones[0])
          }
        }
      } catch (error) {
        console.error('Error fetching delivery zones:', error)
      }
    }
    fetchDeliveryZones()
  }, [])

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.products?.price || 0
    return total + (price * item.quantity)
  }, 0)

  const deliveryFee = selectedZone?.fee || 0
  //const tax = subtotal * 0.07 // 7% VAT
  const total = subtotal + deliveryFee 

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Validate required fields
    if (!formData.full_name) {
      alert('Veuillez entrer votre nom complet')
      setSubmitting(false)
      return
    }

    if (!formData.email) {
      alert('Veuillez entrer votre email')
      setSubmitting(false)
      return
    }

    if (!formData.phone) {
      alert('Veuillez entrer votre numéro de téléphone')
      setSubmitting(false)
      return
    }

    if (!formData.address) {
      alert('Veuillez entrer votre adresse')
      setSubmitting(false)
      return
    }

    if (!formData.city) {
      alert('Veuillez entrer votre ville')
      setSubmitting(false)
      return
    }

      try {
    // Get user before creating order
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
        payment_method: formData.payment_method,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        tax: 0,
        total: total
      })
    })

      if (response.ok) {
        const data = await response.json()

        if (!user) {
      localStorage.removeItem('cart')
      // 🔥 Dispatch event to update header
      window.dispatchEvent(new Event('cartUpdated'))
    }

        router.push(`/checkout/success?order=${data.order_number}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order')
    } finally {
      setSubmitting(false)
    }
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
        <Link href="/cart" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-4">Moyen de paiement</h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={formData.payment_method === 'cod'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="rounded-full"
                  />
                  <Truck size={20} className="text-primary" />
                  <div>
                    <p className="font-medium text-text-primary">Paiement à la livraison</p>
                    <p className="text-xs text-text-secondary">Payez en espèces à la réception</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={formData.payment_method === 'card'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="rounded-full"
                  />
                  <CreditCard size={20} className="text-primary" />
                  <div>
                    <p className="font-medium text-text-primary">Carte bancaire</p>
                    <p className="text-xs text-text-secondary">Payez en ligne par carte</p>
                  </div>
                </label>
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
                <span>{deliveryFee === 0 ? 'Gratuite' : `${deliveryFee.toFixed(2)} DH`}</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border">
                <span>Total</span>
                <span>{total.toFixed(2)} DH</span>
              </div>
            </div>

            {deliveryFee === 0 && (
              <div className="mt-3 text-sm text-green-600 bg-green-50 p-2 rounded-lg text-center">
                🎉 Livraison gratuite !
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}