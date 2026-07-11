// File: app/(dashboard)/dashboard/orders/[id]/page.tsx
// Path: /app/(dashboard)/dashboard/orders/[id]/page.tsx
// Description: Order details page for dashboard

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Loader2,
  RefreshCw,
  Edit,
  Save,
  X,
  Printer,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  variant_name: string | null
}

interface Order {
  delivery_id: string | null
  id: string
  order_number: string
  user_id: string | null
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  delivery_notes: string
  subtotal: number
  delivery_fee: number
  tax: number
  discount: number
  total: number
  payment_method: string
  payment_status: string
  status: string
  created_at: string
  items: OrderItem[]
}

interface DeliveryDriver {
  id: string
  full_name: string
  phone: string
  is_available: boolean
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

const statusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'ready', label: 'Prête' },
  { value: 'assigned', label: 'Assignée' },
  { value: 'in_transit', label: 'En cours de livraison' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' }
]

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<string>('')
  const [showAssignModal, setShowAssignModal] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/dashboard/orders/${orderId}`)
        if (!response.ok) throw new Error('Failed to fetch order')
        const data = await response.json()
        setOrder(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    const fetchDrivers = async () => {
      try {
        const response = await fetch('/api/dashboard/drivers')
        if (response.ok) {
          const data = await response.json()
          setDrivers(data.drivers || [])
        }
      } catch (error) {
        console.error('Error fetching drivers:', error)
      }
    }

    if (orderId) {
      fetchOrder()
      fetchDrivers()
    }
  }, [orderId])

  const updateStatus = async (newStatus: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        setOrder({ ...order, status: newStatus })
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const assignDriver = async (driverId: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId })
      })
      if (response.ok) {
        setShowAssignModal(false)
        router.refresh()
        // Refetch order to get updated data
        const orderRes = await fetch(`/api/dashboard/orders/${orderId}`)
        const data = await orderRes.json()
        setOrder(data)
      }
    } catch (error) {
      console.error('Error assigning driver:', error)
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
        <p className="text-red-600">{error || 'Order not found'}</p>
        <Link href="/dashboard/orders" className="mt-4 inline-block">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Retour aux commandes
          </Button>
        </Link>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon
  const customerName = order.guest_name || 'Client'
  const customerEmail = order.guest_email || 'Non renseigné'
  const customerPhone = order.guest_phone || 'Non renseigné'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders" className="p-2 hover:bg-muted rounded-lg transition-colors">
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
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Imprimer
          </Button>
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">Statut:</span>
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="px-3 py-1.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {updating && <Loader2 size={16} className="animate-spin text-primary" />}
          </div>
          <Button
            onClick={() => setShowAssignModal(true)}
            className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
          >
            <Truck size={16} />
            Assigner un livreur
          </Button>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Assigner un livreur</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Sélectionnez un livreur pour cette commande.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {drivers.map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => assignDriver(driver.id)}
                  className="w-full text-left p-3 border rounded-xl hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-text-primary">{driver.full_name}</p>
                    <p className="text-sm text-text-secondary">{driver.phone}</p>
                  </div>
                  {driver.is_available ? (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Disponible</span>
                  ) : (
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">Occupé</span>
                  )}
                </button>
              ))}
              {drivers.length === 0 && (
                <p className="text-text-secondary text-center py-4">
                  Aucun livreur disponible
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4">Articles</h2>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex justify-between">
                  <div>
                    <p className="font-medium text-text-primary">{item.product_name}</p>
                    <p className="text-sm text-text-secondary">
                      {item.quantity} × {item.unit_price.toFixed(2)} DH
                      {item.variant_name && ` (${item.variant_name})`}
                    </p>
                  </div>
                  <span className="font-medium text-text-primary">
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
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">TVA</span>
                <span>{order.tax.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border">
                <span>Total</span>
                <span>{order.total.toFixed(2)} DH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info & Delivery */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4">Client</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-text-secondary" />
                <span className="text-text-primary">{customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-text-secondary" />
                <a href={`mailto:${customerEmail}`} className="text-primary hover:underline">
                  {customerEmail}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-text-secondary" />
                <a href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener">
                  {customerPhone}
                </a>
              </div>
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

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4">Paiement</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CreditCard size={16} className="text-text-secondary" />
                <span className="text-text-primary capitalize">
                  {order.payment_method === 'cod' ? 'À la livraison' : 'Carte bancaire'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4">Livraison</h2>
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">
                {order.delivery_notes || 'Aucune note de livraison'}
              </p>
              {order.delivery_id && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-text-primary">Livreur assigné</p>
                  <p className="text-sm text-text-secondary">En attente...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}