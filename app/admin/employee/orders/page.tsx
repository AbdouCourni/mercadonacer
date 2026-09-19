// File: app/(dashboard)/dashboard/employee/orders/page.tsx
// Path: /app/(dashboard)/dashboard/employee/orders/page.tsx
// Description: Employee orders dashboard - shows all orders with all statuses

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Loader2, 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  History, 
  ListChecks, 
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buildPreparationMessage, getWhatsAppUrl } from '@/lib/whatsapp-preparation'


interface Order {
  id: string
  order_number: string
  status: string
  total: number
  guest_name: string | null
  city: string
  created_at: string
  items: { product_name: string; quantity: number }[]
  assigned_at: string | null
  preparing_at: string | null
  ready_at: string | null
}

type TabType = 'all' | 'active' | 'assigned' | 'preparing' | 'ready' | 'completed' | 'cancelled'

// Status configuration
const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  assigned: { 
    label: 'À préparer', 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-100',
    icon: Clock
  },
  preparing: { 
    label: 'En préparation', 
    color: 'text-indigo-700', 
    bgColor: 'bg-indigo-100',
    icon: Package
  },
  ready: { 
    label: 'Prête', 
    color: 'text-purple-700', 
    bgColor: 'bg-purple-100',
    icon: CheckCircle
  },
  in_transit: { 
    label: 'En livraison', 
    color: 'text-orange-700', 
    bgColor: 'bg-orange-100',
    icon: Truck
  },
  delivered: { 
    label: 'Livrée ✅', 
    color: 'text-green-700', 
    bgColor: 'bg-green-100',
    icon: CheckCircle
  },
  cancelled: { 
    label: 'Annulée ❌', 
    color: 'text-red-700', 
    bgColor: 'bg-red-100',
    icon: XCircle
  }
}

export default function EmployeeOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, activeTab, searchTerm])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dashboard/employee/orders?all=true')
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

  const filterOrders = () => {
    let filtered = [...orders]

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(search) ||
        (order.guest_name && order.guest_name.toLowerCase().includes(search)) ||
        order.city.toLowerCase().includes(search)
      )
    }

    // Filter by tab
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(o => !['delivered', 'cancelled'].includes(o.status))
        break
      case 'assigned':
        filtered = filtered.filter(o => o.status === 'assigned')
        break
      case 'preparing':
        filtered = filtered.filter(o => o.status === 'preparing')
        break
      case 'ready':
        filtered = filtered.filter(o => o.status === 'ready')
        break
      case 'completed':
        filtered = filtered.filter(o => o.status === 'delivered')
        break
      case 'cancelled':
        filtered = filtered.filter(o => o.status === 'cancelled')
        break
      case 'all':
      default:
        break
    }

    // Sort by created_at descending (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredOrders(filtered)
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const response = await fetch(`/api/dashboard/employee/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchOrders()
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  // Tab configuration
  const tabs: { id: TabType; label: string; icon: any; count: number }[] = [
    { 
      id: 'active', 
      label: 'Actives', 
      icon: Package,
      count: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length
    },
    { 
      id: 'assigned', 
      label: 'À préparer', 
      icon: Clock,
      count: orders.filter(o => o.status === 'assigned').length
    },
    { 
      id: 'preparing', 
      label: 'En préparation', 
      icon: Package,
      count: orders.filter(o => o.status === 'preparing').length
    },
    { 
      id: 'ready', 
      label: 'Prêtes', 
      icon: CheckCircle,
      count: orders.filter(o => o.status === 'ready').length
    },
    { 
      id: 'completed', 
      label: 'Livrées', 
      icon: History,
      count: orders.filter(o => o.status === 'delivered').length
    },
    { 
      id: 'cancelled', 
      label: 'Annulées', 
      icon: XCircle,
      count: orders.filter(o => o.status === 'cancelled').length
    },
    { 
      id: 'all', 
      label: 'Toutes', 
      icon: ListChecks,
      count: orders.length
    }
  ]

  // Status counts for stats
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mes commandes</h1>
          <p className="text-text-secondary text-sm">
            {orders.length} commande{orders.length > 1 ? 's' : ''} assignée{orders.length > 1 ? 's' : ''} à vous
          </p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-text-secondary">Total</p>
          <p className="text-2xl font-bold text-text-primary">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-text-secondary">À préparer</p>
          <p className="text-2xl font-bold text-blue-600">{statusCounts['assigned'] || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-text-secondary">En préparation</p>
          <p className="text-2xl font-bold text-indigo-600">{statusCounts['preparing'] || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-text-secondary">Prêtes</p>
          <p className="text-2xl font-bold text-purple-600">{statusCounts['ready'] || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-sm text-text-secondary">Livrées</p>
          <p className="text-2xl font-bold text-green-600">{statusCounts['delivered'] || 0}</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher une commande (numéro, client, ville)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/50"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-text-secondary"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <Package size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <h3 className="text-lg font-medium text-text-primary">
            {activeTab === 'all' && 'Aucune commande assignée'}
            {activeTab === 'active' && 'Aucune commande active'}
            {activeTab === 'assigned' && 'Aucune commande à préparer'}
            {activeTab === 'preparing' && 'Aucune commande en préparation'}
            {activeTab === 'ready' && 'Aucune commande prête'}
            {activeTab === 'completed' && 'Aucune commande livrée'}
            {activeTab === 'cancelled' && 'Aucune commande annulée'}
          </h3>
          <p className="text-text-secondary">
            {activeTab === 'all' && 'Vous n\'avez pas encore de commandes assignées.'}
            {activeTab === 'active' && 'Vous n\'avez pas de commandes à traiter pour le moment.'}
            {activeTab === 'assigned' && 'Toutes vos commandes assignées sont en cours de traitement.'}
            {activeTab === 'preparing' && 'Vous n\'avez pas de commandes en préparation.'}
            {activeTab === 'ready' && 'Vous n\'avez pas de commandes prêtes.'}
            {activeTab === 'completed' && 'Vous n\'avez pas encore de commandes livrées.'}
            {activeTab === 'cancelled' && 'Vous n\'avez pas de commandes annulées.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.assigned
            const StatusIcon = status.icon
            const isActive = !['delivered', 'cancelled'].includes(order.status)
            const isCompleted = order.status === 'delivered'
            const isCancelled = order.status === 'cancelled'

            return (
              <div 
                key={order.id} 
                className={cn(
                  "bg-white rounded-xl border p-4 transition-all",
                  isCompleted ? "border-green-200 bg-green-50/30" : 
                  isCancelled ? "border-red-200 bg-red-50/30" : 
                  "border-border hover:shadow-md"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-text-primary">#{order.order_number}</p>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                    status.bgColor,
                    status.color
                  )}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </div>

                {/* Info */}
                <p className="text-sm text-text-secondary">{order.guest_name || 'Client'}</p>
                <p className="text-sm text-text-secondary">{order.city}</p>
                <p className="text-lg font-bold text-primary mt-1">{order.total.toFixed(2)} DH</p>

                {/* Items preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-2 text-xs text-text-secondary">
                    {order.items.slice(0, 3).map((item, i) => (
                      <span key={i}>
                        {i > 0 && ', '}
                        {item.quantity}x {item.product_name}
                      </span>
                    ))}
                    {order.items.length > 3 && ` +${order.items.length - 3} autres`}
                  </div>
                )}

                {/* Actions */}
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
                    onClick={() => router.push(`/admin/employee/orders/${order.id}`)}
                    className="flex items-center gap-1"
                  >
                    <Eye size={14} />
                    Détails
                  </Button>

                  {/* Show status badge for completed/cancelled */}
                  {isCompleted && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={12} />
                      Livrée
                    </span>
                  )}
                  {isCancelled && (
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <XCircle size={12} />
                      Annulée
                    </span>
                  )}
                </div>

                {/* Timestamps */}
                <div className="mt-3 pt-2 border-t border-border text-xs text-text-secondary flex flex-wrap gap-3">
                  {order.assigned_at && (
                    <span>Assignée: {new Date(order.assigned_at).toLocaleDateString('fr-MA')}</span>
                  )}
                  {order.preparing_at && (
                    <span>Début: {new Date(order.preparing_at).toLocaleDateString('fr-MA')}</span>
                  )}
                  {order.ready_at && (
                    <span>Prête: {new Date(order.ready_at).toLocaleDateString('fr-MA')}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}