// File: app/(shop)/cart/page.tsx
// Add useSearchParams to read zone from URL

'use client'

import { useCart } from '@/hooks/use-cart'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  CreditCard,
  Shield,
  Loader2,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeliveryMapModal } from '@/components/delivery/delivery-map-modal'
import { CircularZone, DELIVERY_ZONES } from '@/config/delivery-zones'

export default function CartList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    items,
    loading,
    itemCount,
    updateQuantity,
    removeFromCart,
    getTotal
  } = useCart()

  const [updating, setUpdating] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)
  
  // Shop location state
  const [shopLocation, setShopLocation] = useState<{ 
    lat: number; 
    lng: number; 
    name?: string; 
    address?: string 
  }>({ 
    lat: 35.169829836951294, 
    lng: -2.933249645530903, 
    name: 'MercadoNacer', 
    address: 'Nador, Maroc' 
  })
  
  // 🔥 Read zone from URL params
  const [selectedZone, setSelectedZone] = useState<CircularZone | null>(null)
  const [deliveryFee, setDeliveryFee] = useState(30)

  // 🔥 Initialize zone from URL or find by ID
  useEffect(() => {
    const zoneId = searchParams.get('zoneId')
    const zoneFee = searchParams.get('deliveryFee')
    
    if (zoneId) {
      // Find zone by ID in DELIVERY_ZONES
      const foundZone = DELIVERY_ZONES.find(z => z.id === zoneId)
      if (foundZone) {
        setSelectedZone(foundZone)
        setDeliveryFee(foundZone.fee)
        console.log('📍 Zone loaded from URL:', foundZone.name)
        return
      }
    }
    
    // If no zone in URL, try to find by fee
    if (zoneFee) {
      const fee = parseFloat(zoneFee)
      const foundZone = DELIVERY_ZONES.find(z => z.fee === fee)
      if (foundZone) {
        setSelectedZone(foundZone)
        setDeliveryFee(foundZone.fee)
        console.log('📍 Zone loaded from fee:', foundZone.name)
        return
      }
    }
    
    // Default to first zone
    if (DELIVERY_ZONES.length > 0 && !selectedZone) {
      setSelectedZone(DELIVERY_ZONES[0])
      setDeliveryFee(DELIVERY_ZONES[0].fee)
    }
  }, [searchParams])

  // Fetch shop location from API
  useEffect(() => {
    const fetchShopLocation = async () => {
      try {
        const response = await fetch('/api/shop/location')
        if (response.ok) {
          const data = await response.json()
          setShopLocation({
            lat: data.latitude || 35.1684,
            lng: data.longitude || -2.9287,
            name: data.name || 'MercadoNacer',
            address: data.address || 'Nador, Maroc'
          })
        }
      } catch (error) {
        console.error('Error fetching shop location:', error)
      }
    }
    fetchShopLocation()
  }, [])

  const subtotal = getTotal()
  const total = subtotal + deliveryFee

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return
    setUpdating(itemId)
    await updateQuantity(itemId, quantity)
    setUpdating(null)
  }

  const handleRemove = async (itemId: string) => {
    setRemoving(itemId)
    await removeFromCart(itemId)
    setRemoving(null)
  }

  // 🔥 Update URL when zone changes
  const handleZoneSelect = (zone: CircularZone) => {
    setSelectedZone(zone)
    setDeliveryFee(zone.fee)
    setShowMap(false)
    
    // Update URL with zone params
    const params = new URLSearchParams(searchParams.toString())
    params.set('zoneId', zone.id)
    params.set('deliveryFee', zone.fee.toString())
    params.set('zoneName', zone.name)
    params.set('zoneMinOrder', zone.min_order.toString())
    params.set('zoneRadius', zone.radiusKm.toString())
    params.set('zoneColor', zone.color)
    
    router.replace(`/cart?${params.toString()}`, { scroll: false })
  }

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
    <>
      <div className="container-custom py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">
          Votre Panier ({itemCount} articles)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const product = item.products
              const variant = item.product_variants
              const price = variant?.price || product?.price || 0
              const name = product?.name || 'Produit'
              const image = product?.images?.[0] || '/images/placeholder.jpg'
              
              const uniqueKey = item.id || `cart-${item.product_id}-${item.variant_id || 'no-variant'}-${index}`

              return (
                <div
                  key={uniqueKey}
                  className="flex gap-4 p-4 bg-white rounded-xl border border-border hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${product?.slug}`}
                    className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden"
                  >
                    {image && image !== '/images/placeholder.jpg' ? (
                      <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary/30 bg-gray-100">
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
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updating === item.id}
                        className="p-1.5 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Minus size={14} />
                        )}
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (product?.stock || 0) || updating === item.id}
                        className="p-1.5 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Plus size={14} />
                        )}
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removing === item.id}
                      className="text-text-secondary hover:text-red-600 transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      {removing === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
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
                {/* Delivery Zone Selector */}
                <div 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setShowMap(true)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {selectedZone ? `Zone: ${selectedZone.name}` : 'Choisir la zone'}
                      </p>
                      {selectedZone && (
                        <p className="text-xs text-text-secondary">
                          {selectedZone.fee} DH • Min: {selectedZone.min_order} DH
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-primary hover:underline">
                    {selectedZone ? 'Modifier' : 'Sélectionner'}
                  </span>
                </div>

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
               
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-lg font-bold text-text-primary">
                    <span>Total</span>
                    <span>{total.toFixed(2)} DH</span>
                  </div>
                </div>
              </div>

              {/* Pass delivery fee and zone to checkout */}
              <Link
                href={{
                  pathname: '/checkout',
                  query: {
                    deliveryFee: deliveryFee,
                    zoneId: selectedZone?.id || '',
                    zoneName: selectedZone?.name || '',
                    zoneMinOrder: selectedZone?.min_order || 0,
                    zoneRadius: selectedZone?.radiusKm || 0,
                    zoneColor: selectedZone?.color || ''
                  }
                }}
              >
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

      {/* Delivery Map Modal */}
      {showMap && (
        <DeliveryMapModal
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          shopLocation={shopLocation}
          onZoneSelect={handleZoneSelect}
          selectedZone={selectedZone}
        />
      )}
    </>
  )
}