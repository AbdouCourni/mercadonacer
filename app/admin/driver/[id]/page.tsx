// File: app/(dashboard)/dashboard/driver/orders/[id]/page.tsx
// Path: /app/(dashboard)/dashboard/driver/orders/[id]/page.tsx
// Description: Driver order detail page

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Loader2,
  User,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  subtotal: number
  delivery_fee: number
  guest_name: string | null
  guest_phone: string | null
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  delivery_notes: string
  payment_method: string
  created_at: string
  items: OrderItem[]
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  in_transit: {
    label: 'En cours de livraison',
    color: 'bg-orange-100 text-orange-700',
    icon: Truck
  },
  delivered: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle
  }
}

export default function DriverOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/dashboard/driver/orders/${orderId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }
        
        const data = await response.json()
        setOrder(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const updateStatus = async (newStatus: string) => {
    if (!order) return
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setOrder({ ...order, status: newStatus })
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <Package size={48} className="mx-auto text-text-secondary/30 mb-4" />
        <h2 className="text-xl font-bold text-text-primary">Commande non trouvée</h2>
        <p className="text-text-secondary">{error || 'Cette commande ne vous est pas assignée.'}</p>
        <Link href="/admin/driver/orders">
          <Button className="mt-4 bg-primary text-white hover:bg-primary/90">
            Retour aux livraisons
          </Button>
        </Link>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.in_transit
  const StatusIcon = status.icon
  const canDeliver = order.status === 'in_transit'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/driver/orders" className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Livraison #{order.order_number}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-sm px-3 py-1 rounded-full flex items-center gap-1",
                status.color
              )}>
                <StatusIcon size={14} />
                {status.label}
              </span>
              <span className="text-sm text-text-secondary">
                <Calendar size={14} className="inline mr-1" />
                {new Date(order.created_at).toLocaleDateString('fr-MA')}
              </span>
            </div>
          </div>
        </div>

        {canDeliver && (
          <Button
            onClick={() => updateStatus('delivered')}
            disabled={updating}
            className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {updating ? 'Traitement...' : 'Marquer comme livrée'}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4">Articles</h2>
            <div className="divide-y divide-border">
              {order.items.map((item, index) => (
                <div key={item.id || index} className="py-3 first:pt-0 last:pb-0 flex justify-between">
                  <div>
                    <p className="font-medium text-text-primary">{item.product_name}</p>
                    <p className="text-sm text-text-secondary">
                      {item.quantity} × {item.unit_price.toFixed(2)} DH
                    </p>
                  </div>
                  <span className="font-medium text-primary">
                    {item.total_price.toFixed(2)} DH
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Sous-total</span>
                <span>{order.subtotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Livraison</span>
                <span>{order.delivery_fee === 0 ? 'Gratuite' : `${order.delivery_fee.toFixed(2)} DH`}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border">
                <span>Total</span>
                <span>{order.total.toFixed(2)} DH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <User size={18} />
              Client
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-text-secondary" />
                <span className="text-text-primary">{order.guest_name || 'Client'}</span>
              </div>
              {order.guest_phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-text-secondary" />
                  <a 
                    href={`https://wa.me/${order.guest_phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {order.guest_phone}
                  </a>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-text-secondary mt-1" />
                <div className="text-text-primary">
                  <p>{order.address_line1}</p>
                  {order.address_line2 && <p>{order.address_line2}</p>}
                  <p>{order.city} {order.postal_code}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4">Paiement</h2>
            <p className="text-text-primary capitalize">
              {order.payment_method === 'cod' ? 'À la livraison' : 'Carte bancaire'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}