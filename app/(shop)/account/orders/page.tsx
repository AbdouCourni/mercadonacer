// File: app/(shop)/account/orders/page.tsx
// Path: /app/(shop)/account/orders/page.tsx
// Description: Customer orders list

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUser } from '@/services/auth.service'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  payment_method: string
  created_at: string
  items: {
    product_name: string
    quantity: number
    unit_price: number
  }[]
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

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const currentUser = await getUser()
        setUser(currentUser)

        if (!currentUser) {
          setLoading(false)
          return
        }

        console.log('🔍 Fetching orders for user:', currentUser.id)
        
        const response = await fetch('/api/orders')
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Response error:', response.status, errorText)
          throw new Error(`Failed to fetch orders: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📦 Orders data:', data)
        
        setOrders(data.orders || [])
      } catch (error) {
        console.error('❌ Error fetching orders:', error)
        setError(error instanceof Error ? error.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Erreur</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-custom py-12 text-center">
        <Package size={48} className="mx-auto text-text-secondary/30 mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Connectez-vous</h1>
        <p className="text-text-secondary mb-6">Pour voir vos commandes, veuillez vous connecter.</p>
        <Link href="/login">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Se connecter
          </Button>
        </Link>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <Package size={48} className="mx-auto text-text-secondary/30 mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Aucune commande</h1>
        <p className="text-text-secondary mb-6">Vous n'avez pas encore passé de commande.</p>
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
      <h1 className="text-2xl font-bold text-text-primary mb-6">Mes commandes</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending
          const StatusIcon = status.icon

          return (
            <Link
              key={order.id}
              href={`/account/orders/${order.order_number}`}
              className="block bg-white rounded-xl border border-border hover:shadow-md transition-shadow p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-text-primary">
                      #{order.order_number}
                    </p>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                      status.color
                    )}>
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {new Date(order.created_at).toLocaleDateString('fr-MA', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="text-sm text-text-secondary">
                  {order.items?.length || 0} produit{(order.items?.length || 0) > 1 ? 's' : ''}
                </div>

                <div className="text-lg font-bold text-primary">
                  {order.total.toFixed(2)} DH
                </div>

                <ChevronRight size={18} className="text-text-secondary flex-shrink-0" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}