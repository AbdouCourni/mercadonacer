// File: app/(dashboard)/dashboard/orders/page.tsx
// Path: /app/(dashboard)/dashboard/orders/page.tsx
// Description: Orders management page for dashboard

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  order_number: string
  user_id: string | null
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  city: string
  total: number
  status: string
  payment_method: string
  created_at: string
  assigned_to: string | null  // ← NEW
  assigned_to_name?: string   // ← NEW (for display)
  items: {
    product_name: string
    quantity: number
  }[]
}

interface DeliveryDriver {
  id: string
  full_name: string
  phone: string
  is_available: boolean
}

const getAssignedEmployee = (order: Order) => {
  return order.assigned_to_name || 'Non assigné'
}

// ============================================
// STATUS CONFIGURATION
// ============================================

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  assigned: { label: 'Assignée', color: 'bg-blue-100 text-blue-700', icon: Truck },
  preparing: { label: 'En préparation', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  ready: { label: 'Prête', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  confirmed: { label: 'Confirmée', color: 'bg-teal-100 text-teal-700', icon: CheckCircle },
  delivering: { label: 'En cours de livraison', color: 'bg-orange-100 text-orange-700', icon: Truck },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: XCircle }
}

const statusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'assigned', label: 'Assignée' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'ready', label: 'Prête' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'delivering', label: 'En cours de livraison' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' }
]

// ============================================
// STATUS TRANSITIONS
// ============================================

const statusTransitions: Record<string, string[]> = {
  pending: ['assigned', 'cancelled'],
  assigned: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['confirmed', 'cancelled'],
  confirmed: ['delivering', 'cancelled'],
  delivering: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  assigned: 'Assignée',
  preparing: 'En préparation',
  ready: 'Prête',
  confirmed: 'Confirmée',
  delivering: 'En cours de livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée'
}

// ============================================
// COMPONENT
// ============================================

export default function DashboardOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    date: '',
    employee: ''  // ← NEW
  })
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 20,
    total: 0
  })
  const [updating, setUpdating] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('admin')

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/user/role')
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.role || 'user')
        }
      } catch (error) {
        console.error('Error fetching role:', error)
      }
    }
    fetchUserRole()
  }, [])

  // Check if user can change status
  const canChangeStatus = (currentStatus: string): boolean => {
    const rolePermissions: Record<string, string[]> = {
      superadmin: ['pending', 'assigned', 'preparing', 'ready', 'confirmed', 'delivering', 'delivered', 'cancelled'],
      admin: ['pending', 'assigned', 'preparing', 'ready', 'confirmed', 'delivering', 'delivered', 'cancelled'],
      manager: ['pending', 'assigned', 'preparing', 'ready', 'confirmed', 'delivering', 'delivered', 'cancelled'],
      employee: ['assigned', 'preparing', 'ready'],
      client: ['confirmed'],
      driver: ['delivered']
    }

    return rolePermissions[userRole]?.includes(currentStatus) || false
  }

  // Get available next statuses
  const getAvailableStatuses = (currentStatus: string): string[] => {
    return statusTransitions[currentStatus] || []
  }

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (filters.status) params.append('status', filters.status)
        if (filters.city) params.append('city', filters.city)
        if (filters.date) params.append('date', filters.date)
          if (filters.employee === 'assigned') {
  params.append('assigned', 'true')
} else if (filters.employee === 'unassigned') {
  params.append('unassigned', 'true')
}
        params.append('page', String(pagination.page))
        params.append('limit', String(pagination.limit))

        const response = await fetch(`/api/dashboard/orders?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
          setPagination(prev => ({ ...prev, total: data.count || 0 }))
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchOrders, 300)
    return () => clearTimeout(timer)
  }, [search, filters, pagination.page, pagination.limit])

  // Update order status
  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
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

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  // Get customer name
  const getCustomerName = (order: Order) => {
    return order.guest_name || 'Client'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Commandes</h1>
          <p className="text-text-secondary text-sm">
            {pagination.total} commande{pagination.total > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Actualiser
        </Button>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div className="bg-white rounded-xl border border-border p-4">
    <p className="text-sm text-text-secondary">Total</p>
    <p className="text-2xl font-bold text-text-primary">{pagination.total}</p>
  </div>
  <div className="bg-white rounded-xl border border-border p-4">
    <p className="text-sm text-text-secondary">Assignées</p>
    <p className="text-2xl font-bold text-blue-600">
      {orders.filter(o => o.assigned_to).length}
    </p>
  </div>
  <div className="bg-white rounded-xl border border-border p-4">
    <p className="text-sm text-text-secondary">Non assignées</p>
    <p className="text-2xl font-bold text-orange-600">
      {orders.filter(o => !o.assigned_to).length}
    </p>
  </div>
  <div className="bg-white rounded-xl border border-border p-4">
    <p className="text-sm text-text-secondary">En préparation</p>
    <p className="text-2xl font-bold text-indigo-600">
      {orders.filter(o => o.status === 'preparing').length}
    </p>
  </div>
</div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Rechercher une commande (numéro, client, email)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Filter size={18} />
            Filtres
            <span className={cn(
              "w-2 h-2 rounded-full",
              Object.values(filters).some(v => v) ? 'bg-primary' : 'bg-transparent'
            )} />
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
            <div>
              <label className="text-sm font-medium block mb-1">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border"
              >
                <option value="">Tous</option>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Ville</label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border"
              >
                <option value="">Toutes</option>
                <option value="Casablanca">Casablanca</option>
                <option value="Rabat">Rabat</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Nador">Nador</option>
                <option value="Tanger">Tanger</option>
                <option value="Fès">Fès</option>
                <option value="Agadir">Agadir</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border"
              />
            </div>
            <div>
  <label className="text-sm font-medium block mb-1">Employé</label>
  <select
    value={filters.employee}
    onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
    className="w-full px-3 py-2 rounded-lg border border-border"
  >
    <option value="">Tous</option>
    <option value="assigned">Assignées</option>
    <option value="unassigned">Non assignées</option>
  </select>
</div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-text-secondary/30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary">Aucune commande</h3>
            <p className="text-text-secondary">Aucune commande trouvée pour le moment.</p>
          </div>
        ) : (
          <>
            {/* Table - Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Commande</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Ville</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Actions</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Assigné à</th>

                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending
                    const StatusIcon = status.icon
                    const canChange = canChangeStatus(order.status)
                    const availableStatuses = getAvailableStatuses(order.status)

                    return (
                      <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-text-primary">#{order.order_number}</p>
                          <p className="text-xs text-text-secondary">
                            {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-text-primary">{getCustomerName(order)}</p>
                          <p className="text-xs text-text-secondary">{order.guest_email || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{order.city}</td>
                        <td className="px-4 py-3 font-bold text-primary">{order.total.toFixed(2)} DH</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                            status.color
                          )}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {new Date(order.created_at).toLocaleDateString('fr-MA')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Détails">
                                <Eye size={16} className="text-text-secondary" />
                              </button>
                            </Link>
                            {canChange && availableStatuses.length > 0 && (
                              <select
                                value=""
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                disabled={updating === order.id}
                                className="text-xs px-2 py-1 rounded border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                              >
                                <option value="">Changer</option>
                                {availableStatuses.map((s) => (
                                  <option key={s} value={s}>{statusLabels[s]}</option>
                                ))}
                              </select>
                            )}
                            {updating === order.id && <Loader2 size={14} className="animate-spin text-primary" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {getAssignedEmployee(order)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending
                const StatusIcon = status.icon
                const canChange = canChangeStatus(order.status)
                const availableStatuses = getAvailableStatuses(order.status)

                return (
                  <div key={order.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-text-primary">#{order.order_number}</p>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full flex items-center gap-1",
                        status.color
                      )}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-text-primary">{getCustomerName(order)}</p>
                      <p className="text-text-secondary">{order.city} • {order.total.toFixed(2)} DH</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye size={14} className="mr-1" />
                          Détails
                        </Button>
                      </Link>
                      {canChange && availableStatuses.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className="text-xs px-2 py-1 rounded border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        >
                          <option value="">Changer</option>
                          {availableStatuses.map((s) => (
                            <option key={s} value={s}>{statusLabels[s]}</option>
                          ))}
                        </select>
                      )}
                      {updating === order.id && <Loader2 size={14} className="animate-spin text-primary" />}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-border gap-3">
                <p className="text-sm text-text-secondary order-2 sm:order-1">
                  {pagination.page * pagination.limit + 1} - {Math.min((pagination.page + 1) * pagination.limit, pagination.total)} sur {pagination.total}
                </p>
                <div className="flex gap-1 order-1 sm:order-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 0}
                    className="p-2 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="flex items-center px-3 text-sm text-text-secondary">
                    {pagination.page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= totalPages - 1}
                    className="p-2 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}