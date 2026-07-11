// File: app/(shop)/account/orders/[orderNumber]/page.tsx
// Path: /app/(shop)/account/orders/[orderNumber]/page.tsx
// Description: Customer order details - FIXED

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Truck, CreditCard, Package, Clock, CheckCircle, XCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  variant_name: string | null
}

interface Order {
  delivery_notes: string | null
  driver: any
  delivery_id: string | null
  id: string
  order_number: string
  status: string
  total: number
  subtotal: number
  delivery_fee: number
  tax: number
  payment_method: string
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  created_at: string
  items: OrderItem[]  // ← Make sure this is defined
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  preparing: { label: 'En préparation', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  ready: { label: 'Prête', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  assigned: { label: 'Assignée', color: 'bg-cyan-100 text-cyan-700', icon: Truck },
  in_transit: { label: 'En cours de livraison', color: 'bg-orange-100 text-orange-700', icon: Truck },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: XCircle }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log('🔍 Fetching order:', orderNumber)
        const response = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📦 Order data:', data)
        
        // 🔥 Ensure items is always an array
        if (data) {
          data.items = data.items || []
        }
        
        setOrder(data)
      } catch (error) {
        console.error('❌ Error fetching order:', error)
        setError(error instanceof Error ? error.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    if (orderNumber) {
      fetchOrder()
    }
  }, [orderNumber])

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Commande non trouvée</h1>
        <p className="text-text-secondary mb-6">{error || 'Cette commande n\'existe pas ou a été supprimée.'}</p>
        <Link href="/account/orders">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Voir mes commandes
          </Button>
        </Link>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon
  const items = order.items || []  // 🔥 Always use array

  return (
    <div className="container-custom py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/account/orders" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Commande #{order.order_number}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "text-sm px-3 py-1 rounded-full flex items-center gap-1",
              status.color
            )}>
              <StatusIcon size={14} />
              {status.label}
            </span>
            <span className="text-sm text-text-secondary">
              {new Date(order.created_at).toLocaleDateString('fr-MA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="font-semibold text-text-primary mb-4">Articles</h2>
        {items.length > 0 ? (
          <div className="divide-y divide-border">
            {items.map((item, index) => (
              <div key={index} className="py-3 first:pt-0 last:pb-0 flex justify-between">
                <div>
                  <p className="font-medium text-text-primary">{item.product_name}</p>
                  <p className="text-sm text-text-secondary">
                    {item.quantity} × {item.unit_price?.toFixed(2) || '0'} DH
                    {item.variant_name && ` (${item.variant_name})`}
                  </p>
                </div>
                <span className="font-medium text-text-primary">
                  {item.total_price?.toFixed(2) || (item.unit_price * item.quantity).toFixed(2)} DH
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-4">Aucun article</p>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="font-semibold text-text-primary mb-4">Résumé</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-text-secondary">
            <span>Sous-total</span>
            <span>{order.subtotal?.toFixed(2) || '0'} DH</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Livraison</span>
            <span>{order.delivery_fee === 0 ? 'Gratuite' : `${order.delivery_fee?.toFixed(2) || '0'} DH`}</span>
          </div>
        
          <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border">
            <span>Total</span>
            <span>{order.total?.toFixed(2) || '0'} DH</span>
          </div>
        </div>
      </div>

      {/* Delivery Details */}
     <div className="bg-white rounded-xl border border-border p-6">
  <h2 className="font-semibold text-text-primary mb-4">Adresse de livraison</h2>
  
  <div className="space-y-3 text-sm">
    {/* Address */}
    <div className="space-y-1">
      <p className="text-text-primary font-medium">{order.address_line1}</p>
      {order.address_line2 && <p className="text-text-secondary">{order.address_line2}</p>}
      <p className="text-text-secondary">{order.city} {order.postal_code}</p>
    </div>

    {/* Divider */}
    <div className="border-t border-border pt-3 space-y-2">
      {/* Payment */}
      <div className="flex items-center gap-2 text-text-secondary">
        <CreditCard size={14} className="text-primary" />
        <span>
          Paiement: <span className="text-text-primary capitalize font-medium">
            {order.payment_method === 'cod' ? 'À la livraison' : 'Carte bancaire'}
          </span>
        </span>
      </div>

      {/* Driver Info (if assigned) */}
      {order.delivery_id && (
        <div className="flex items-center gap-2 text-text-secondary">
          <Truck size={14} className="text-primary" />
          <span>
            Livreur: <span className="text-text-primary font-medium">
              {order.driver?.full_name || 'Assigné'}
            </span>
          </span>
          {order.driver?.phone && (
            <a 
              href={`https://wa.me/${order.driver.phone.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 hover:underline text-xs flex items-center gap-1"
            >
              <Phone size={12} />
              WhatsApp
            </a>
          )}
        </div>
      )}

      {/* Delivery Notes */}
      {order.delivery_notes && (
        <div className="text-text-secondary text-xs bg-muted p-2 rounded-lg">
          <span className="font-medium">Note:</span> {order.delivery_notes}
        </div>
      )}
    </div>
  </div>
</div>
    </div>
  )
}