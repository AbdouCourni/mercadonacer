// File: app/(dashboard)/dashboard/employee/orders/page.tsx
// Path: /app/(dashboard)/dashboard/employee/orders/page.tsx
// Description: Employee orders dashboard

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Package, CheckCircle, Clock, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  guest_name: string | null
  city: string
  created_at: string
  items: { product_name: string; quantity: number }[]
}

export default function EmployeeOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
     const response = await fetch('/api/dashboard/employee/orders')

    
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
        <h1 className="text-2xl font-bold text-text-primary">Mes commandes</h1>
        <p className="text-text-secondary text-sm">
          Commandes assignées à vous
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <Package size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <h3 className="text-lg font-medium text-text-primary">Aucune commande</h3>
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
                  order.status === 'assigned' && "bg-blue-100 text-blue-700",
                  order.status === 'preparing' && "bg-indigo-100 text-indigo-700",
                  order.status === 'ready' && "bg-purple-100 text-purple-700"
                )}>
                  {order.status === 'assigned' && 'À préparer'}
                  {order.status === 'preparing' && 'En préparation'}
                  {order.status === 'ready' && 'Prête'}
                </span>
              </div>

              <p className="text-sm text-text-secondary">{order.guest_name || 'Client'}</p>
              <p className="text-sm text-text-secondary">{order.city}</p>
              <p className="text-lg font-bold text-primary mt-1">{order.total.toFixed(2)} DH</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {order.status === 'assigned' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(order.id, 'preparing')}
                    disabled={updating === order.id}
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {updating === order.id ? <Loader2 size={14} className="animate-spin" /> : 'Commencer'}
                  </Button>
                )}

                {order.status === 'preparing' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(order.id, 'ready')}
                    disabled={updating === order.id}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {updating === order.id ? <Loader2 size={14} className="animate-spin" /> : 'Terminée'}
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/employee/orders/${order.id}`)}
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