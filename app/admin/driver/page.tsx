// File: app/admin/delivery/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Truck, CheckCircle, Clock, MapPin, User, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  guest_name: string | null
  guest_phone: string | null
  address_line1: string
  city: string
  created_at: string
  items: { product_name: string; quantity: number }[]
}

export default function DriverOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/dashboard/driver/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchOrders()
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mes livraisons</h1>
        <p className="text-text-secondary text-sm">
          Commandes assignées à vous
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <Truck size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <h3 className="text-lg font-medium text-text-primary">Aucune livraison</h3>
          <p className="text-text-secondary">Aucune commande assignée pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-text-primary">#{order.order_number}</p>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  order.status === 'in_transit' && "bg-orange-100 text-orange-700",
                  order.status === 'delivered' && "bg-green-100 text-green-700"
                )}>
                  {order.status === 'in_transit' && 'En cours'}
                  {order.status === 'delivered' && 'Livrée'}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-text-primary flex items-center gap-1">
                  <User size={14} className="text-text-secondary" />
                  {order.guest_name || 'Client'}
                </p>
                {order.guest_phone && (
                  <p className="text-text-secondary flex items-center gap-1">
                    <Phone size={14} className="text-text-secondary" />
                    {order.guest_phone}
                  </p>
                )}
                <p className="text-text-secondary flex items-center gap-1">
                  <MapPin size={14} className="text-text-secondary" />
                  {order.address_line1}, {order.city}
                </p>
              </div>

              <p className="text-lg font-bold text-primary mt-2">
                {order.total.toFixed(2)} DH
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {order.status === 'in_transit' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(order.id, 'delivered')}
                    disabled={updating === order.id}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {updating === order.id ? <Loader2 size={14} className="animate-spin" /> : 'Livrée'}
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/admin/driver/orders/${order.id}`)}
                >
                  Voir détails
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}