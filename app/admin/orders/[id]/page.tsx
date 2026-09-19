// File: app/admin/orders/[id]/page.tsx
// Description: Admin order detail page with employee & driver assignment and missing items tracking

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
  Printer,
  Users,
  UserCheck,
  UserX,
  Send,
  AlertTriangle,
  AlertCircle,
  Check,
  X,
  ClipboardList,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Order,
  OrderItem,
  Employee,
  Driver,
  ORDER_STATUSES,
  STATUS_OPTIONS,
  hasMissingItems,
  getMissingItemsCount,
  getMissingItems
} from '@/types/order.types'

// ============================================
// PREPARATION TYPES
// ============================================

interface PreparationItem {
  id: string
  order_id: string
  order_item_id: string
  product_id: string | null
  requested_quantity: number
  prepared_quantity: number
  is_out_of_stock: boolean
  is_partially_available: boolean
  notes: string | null
  status: 'pending' | 'preparing' | 'ready' | 'missing'
  created_at: string
  updated_at: string
}

// ============================================
// STATUS CONFIGURATION (with actual icon components)
// ============================================

const statusConfig: Record<string, { label: string; color: string; icon: any; nextStatuses: string[] }> = {
  pending: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
    nextStatuses: ['confirmed', 'cancelled']
  },
  confirmed: {
    label: 'Confirmée',
    color: 'bg-blue-100 text-blue-700',
    icon: CheckCircle,
    nextStatuses: ['assigned', 'cancelled']
  },
  assigned: {
    label: 'Assignée',
    color: 'bg-indigo-100 text-indigo-700',
    icon: UserCheck,
    nextStatuses: ['preparing', 'cancelled']
  },
  preparing: {
    label: 'En préparation',
    color: 'bg-indigo-100 text-indigo-700',
    icon: Package,
    nextStatuses: ['ready', 'cancelled']
  },
  ready: {
    label: 'Prête',
    color: 'bg-purple-100 text-purple-700',
    icon: CheckCircle,
    nextStatuses: ['in_transit', 'cancelled']
  },
  in_transit: {
    label: 'En cours de livraison',
    color: 'bg-orange-100 text-orange-700',
    icon: Truck,
    nextStatuses: ['delivered', 'cancelled']
  },
  delivered: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    nextStatuses: []
  },
  cancelled: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    nextStatuses: []
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [preparations, setPreparations] = useState<PreparationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Employees & Drivers
  const [employees, setEmployees] = useState<Employee[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  // Modals
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [showDriverModal, setShowDriverModal] = useState(false)

  // Missing items modal
  const [showMissingItemsModal, setShowMissingItemsModal] = useState(false)
  const [missingItemsNote, setMissingItemsNote] = useState('')
  const [updatingMissingItems, setUpdatingMissingItems] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch order
        const orderRes = await fetch(`/api/dashboard/orders/${orderId}`)
        if (!orderRes.ok) throw new Error('Failed to fetch order')
        const orderData = await orderRes.json()
        setOrder(orderData)
        setMissingItemsNote(orderData.missing_items_note || '')

        // Fetch preparations for this order
        const prepRes = await fetch(`/api/dashboard/orders/${orderId}/preparation`)
        if (prepRes.ok) {
          const prepData = await prepRes.json()
          setPreparations(prepData.data || [])
        }

        // Fetch employees (users with employee role)
        const empRes = await fetch('/api/dashboard/employee')
        if (empRes.ok) {
          const empData = await empRes.json()
          setEmployees(empData.employees || [])
        }

        // Fetch drivers
        const driverRes = await fetch('/api/dashboard/drivers')
        if (driverRes.ok) {
          const driverData = await driverRes.json()
          setDrivers(driverData.drivers || [])
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchData()
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
    } finally {
      setUpdating(false)
    }
  }

  const assignEmployee = async (employeeId: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/assign-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      })
      if (response.ok) {
        setShowEmployeeModal(false)
        // Refetch order
        const orderRes = await fetch(`/api/dashboard/orders/${orderId}`)
        const data = await orderRes.json()
        setOrder(data)
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to assign employee')
      }
    } catch (error) {
      console.error('Error assigning employee:', error)
    } finally {
      setUpdating(false)
    }
  }

  const assignDriver = async (driverId: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/assign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId })
      })
      if (response.ok) {
        setShowDriverModal(false)
        // Refetch order
        const orderRes = await fetch(`/api/dashboard/orders/${orderId}`)
        const data = await orderRes.json()
        setOrder(data)
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to assign driver')
      }
    } catch (error) {
      console.error('Error assigning driver:', error)
    } finally {
      setUpdating(false)
    }
  }

  const unassignEmployee = async () => {
    if (!order) return
    setUpdating(true)
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/unassign-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        const orderRes = await fetch(`/api/dashboard/orders/${orderId}`)
        const data = await orderRes.json()
        setOrder(data)
        router.refresh()
      }
    } catch (error) {
      console.error('Error unassigning employee:', error)
    } finally {
      setUpdating(false)
    }
  }

  const unassignDriver = async () => {
    if (!order) return
    setUpdating(true)
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/unassign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        const orderRes = await fetch(`/api/dashboard/orders/${orderId}`)
        const data = await orderRes.json()
        setOrder(data)
        router.refresh()
      }
    } catch (error) {
      console.error('Error unassigning driver:', error)
    } finally {
      setUpdating(false)
    }
  }

  // Update missing items
  const updateMissingItems = async () => {
    if (!order) return
    setUpdatingMissingItems(true)
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/missing-items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missingItemsNote,
          items: order.items.map(item => ({
            id: item.id,
            is_missing: item.is_missing,
            missing_reason: item.missing_reason
          }))
        })
      })
      if (response.ok) {
        const orderRes = await fetch(`/api/dashboard/orders/${orderId}`)
        const data = await orderRes.json()
        setOrder(data)
        setShowMissingItemsModal(false)
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update missing items')
      }
    } catch (error) {
      console.error('Error updating missing items:', error)
    } finally {
      setUpdatingMissingItems(false)
    }
  }

  // Toggle item missing status
  const toggleItemMissing = (itemId: string) => {
    if (!order) return
    setOrder({
      ...order,
      items: order.items.map(item =>
        item.id === itemId
          ? {
            ...item,
            is_missing: !item.is_missing,
            missing_reason: !item.is_missing ? '' : item.missing_reason
          }
          : item
      )
    })
  }

  // Update item missing reason
  const updateItemMissingReason = (itemId: string, reason: string) => {
    if (!order) return
    setOrder({
      ...order,
      items: order.items.map(item =>
        item.id === itemId
          ? { ...item, missing_reason: reason }
          : item
      )
    })
  }

  // Get preparation status for an item
  const getItemPreparation = (itemId: string): PreparationItem | undefined => {
    return preparations.find(p => p.order_item_id === itemId)
  }

  // Get preparation status label and color
  const getPrepStatusInfo = (prep: PreparationItem | undefined) => {
    if (!prep) return { label: 'Non préparé', color: 'bg-gray-100 text-gray-600' }
    if (prep.is_out_of_stock) return { label: 'Rupture', color: 'bg-red-100 text-red-700' }
    if (prep.is_partially_available) return { label: `Partiel (${prep.prepared_quantity}/${prep.requested_quantity})`, color: 'bg-yellow-100 text-yellow-700' }
    if (prep.status === 'ready') return { label: `Prêt (${prep.prepared_quantity}/${prep.requested_quantity})`, color: 'bg-green-100 text-green-700' }
    return { label: 'En attente', color: 'bg-gray-100 text-gray-600' }
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
        <Link href="/admin/orders" className="mt-4 inline-block">
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
  const hasMissing = hasMissingItems(order)
  const missingCount = getMissingItemsCount(order)
  const missingItems = getMissingItems(order)

  // Get assigned employee name
  const assignedEmployee = employees.find(e => e.id === order.assigned_to)
  const assignedDriver = drivers.find(d => d.id === order.delivery_id)

  // Calculate preparation summary
  const totalItems = order.items.length
  const preparedItems = preparations.filter(p => p.status === 'ready').length
  const partialItems = preparations.filter(p => p.is_partially_available).length
  const outOfStockItems = preparations.filter(p => p.is_out_of_stock).length
  const pendingItems = totalItems - preparedItems - partialItems - outOfStockItems

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Commande #{order.order_number}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={cn(
                "text-sm px-3 py-1 rounded-full flex items-center gap-1",
                status.color
              )}>
                <StatusIcon size={14} />
                {status.label}
              </span>
              {/* Missing Items Badge */}
              {hasMissing && (
                <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  {missingCount} article{missingCount > 1 ? 's' : ''} manquant{missingCount > 1 ? 's' : ''}
                </span>
              )}
              {order.assigned_to && assignedEmployee && (
                <span className="text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                  <Package size={14} />
                  {assignedEmployee.full_name}
                </span>
              )}
              {order.delivery_id && assignedDriver && (
                <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                  <Truck size={14} />
                  {assignedDriver.full_name}
                </span>
              )}
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Imprimer
          </Button>
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-2",
              hasMissing ? "border-red-300 text-red-600 hover:bg-red-50" : ""
            )}
            onClick={() => setShowMissingItemsModal(true)}
          >
            <AlertTriangle size={16} />
            {hasMissing ? `Gérer (${missingCount})` : 'Gérer les manquants'}
          </Button>
        </div>
      </div>

      {/* Preparation Summary */}
      {preparations.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <ClipboardList size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  État de la préparation
                </p>
                <p className="text-sm text-text-secondary">
                  {preparedItems} prêts · {partialItems} partiels · {outOfStockItems} en rupture · {pendingItems} en attente
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${totalItems > 0 ? (preparedItems / totalItems) * 100 : 0}%` }}
                />
                <div
                  className="h-full bg-yellow-500 transition-all duration-300"
                  style={{ width: `${totalItems > 0 ? (partialItems / totalItems) * 100 : 0}%` }}
                />
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${totalItems > 0 ? (outOfStockItems / totalItems) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-text-primary">
                {totalItems > 0 ? Math.round(((preparedItems + partialItems) / totalItems) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Code & Ultimate Total */}
      {(order.delivery_code || order.ultimate_total) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delivery Code */}
          {order.delivery_code && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🔑</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Code de livraison</p>
                    <p className="text-xs text-blue-600">À présenter par le client</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-700 tracking-widest">
                  {order.delivery_code}
                </span>
              </div>
              {order.ultimate_total_calculated_at && (
                <p className="text-xs text-blue-600 mt-2">
                  Généré le: {new Date(order.ultimate_total_calculated_at).toLocaleString('fr-MA')}
                </p>
              )}
            </div>
          )}

          {/* Ultimate Total */}
          {order.ultimate_total && order.ultimate_total !== order.total && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Total ajusté</p>
                  <p className="text-xs text-yellow-600">Articles manquants déduits</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-text-secondary line-through mr-2">
                    {order.total.toFixed(2)} DH
                  </span>
                  <span className="text-xl font-bold text-green-700">
                    {order.ultimate_total.toFixed(2)} DH
                  </span>
                </div>
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                💰 Montant à collecter par le livreur: {order.ultimate_total.toFixed(2)} DH
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status & Assignment Actions */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Update */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">Statut:</span>
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="px-3 py-1.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 flex-1"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {updating && <Loader2 size={16} className="animate-spin text-primary" />}
          </div>

          {/* Employee Assignment */}
          <div className="flex items-center gap-2">
            {order.assigned_to ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-text-secondary">Employé:</span>
                <span className="text-sm font-medium text-text-primary flex-1">
                  {assignedEmployee?.full_name || 'Assigné'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={unassignEmployee}
                  disabled={updating}
                  className="text-red-500 hover:text-red-700"
                >
                  <UserX size={14} />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowEmployeeModal(true)}
                className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 w-full"
              >
                <UserCheck size={14} />
                Assigner un employé
              </Button>
            )}
          </div>

          {/* Driver Assignment */}
          <div className="flex items-center gap-2">
            {order.delivery_id ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-text-secondary">Livreur:</span>
                <span className="text-sm font-medium text-text-primary flex-1">
                  {assignedDriver?.full_name || 'Assigné'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={unassignDriver}
                  disabled={updating}
                  className="text-red-500 hover:text-red-700"
                >
                  <UserX size={14} />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowDriverModal(true)}
                className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 w-full"
              >
                <Truck size={14} />
                Assigner un livreur
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Assigner un employé</h2>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <XCircle size={20} />
              </button>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Sélectionnez un employé pour préparer cette commande.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {employees.filter(e => e.is_active).map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => assignEmployee(employee.id)}
                  className="w-full text-left p-3 border rounded-xl hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-text-primary">{employee.full_name}</p>
                    <p className="text-sm text-text-secondary">{employee.phone}</p>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Disponible</span>
                </button>
              ))}
              {employees.filter(e => e.is_active).length === 0 && (
                <p className="text-text-secondary text-center py-4">
                  Aucun employé disponible
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Assigner un livreur</h2>
              <button
                onClick={() => setShowDriverModal(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <XCircle size={20} />
              </button>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Sélectionnez un livreur pour cette commande.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {drivers.filter(d => d.is_active).map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => assignDriver(driver.id)}
                  className="w-full text-left p-3 border rounded-xl hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-text-primary">{driver.full_name}</p>
                    <p className="text-sm text-text-secondary">{driver.phone}</p>
                    {driver.driver_zone && (
                      <p className="text-xs text-text-secondary">Zone: {driver.driver_zone}</p>
                    )}
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Disponible</span>
                </button>
              ))}
              {drivers.filter(d => d.is_active).length === 0 && (
                <p className="text-text-secondary text-center py-4">
                  Aucun livreur disponible
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Missing Items Modal */}
      {showMissingItemsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" />
                Gérer les articles manquants
              </h2>
              <button
                onClick={() => setShowMissingItemsModal(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <XCircle size={20} />
              </button>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Cochez les articles qui sont manquants dans la commande et ajoutez une raison si nécessaire.
            </p>

            <div className="space-y-3 mb-4">
              {order.items.map((item) => {
                const prep = getItemPreparation(item.id)
                const prepStatus = getPrepStatusInfo(prep)

                return (
                  <div key={item.id} className="border rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleItemMissing(item.id)}
                        className={cn(
                          "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          item.is_missing
                            ? "bg-red-500 border-red-500 text-white"
                            : "border-gray-300 hover:border-gray-400"
                        )}
                      >
                        {item.is_missing && <Check size={14} />}
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-text-primary">{item.product_name}</p>
                            <p className="text-sm text-text-secondary">
                              {item.quantity} × {item.unit_price.toFixed(2)} DH
                              {item.variant_name && ` (${item.variant_name})`}
                            </p>
                            {/* Show preparation status */}
                            {prep && (
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full inline-block mt-1",
                                prepStatus.color
                              )}>
                                {prepStatus.label}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-primary">
                            {item.total_price.toFixed(2)} DH
                          </span>
                        </div>
                        {item.is_missing && (
                          <div className="mt-2">
                            <input
                              type="text"
                              placeholder="Raison de l'absence (optionnel)"
                              value={item.missing_reason || ''}
                              onChange={(e) => updateItemMissingReason(item.id, e.target.value)}
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            />
                          </div>
                        )}
                        {prep?.notes && (
                          <div className="mt-1 text-xs bg-blue-50 border border-blue-200 rounded p-1.5 flex items-start gap-1.5">
                            <AlertCircle size={12} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-blue-700">Note: {prep.notes}</span>
                          </div>
                        )}
                      </div>
                      {item.is_missing && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 flex-shrink-0">
                          Manquant
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Note générale sur les manquants
                </label>
                <textarea
                  value={missingItemsNote}
                  onChange={(e) => setMissingItemsNote(e.target.value)}
                  placeholder="Ajoutez une note concernant les articles manquants..."
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowMissingItemsModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={updateMissingItems}
                  disabled={updatingMissingItems}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {updatingMissingItems ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Package size={18} />
              Articles ({order.items.length})
              {hasMissing && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  ⚠️ {missingCount} manquant{missingCount > 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <div className="divide-y divide-border">
              {order.items.map((item) => {
                const shippedQuantity = item.shipped_quantity || item.quantity
                const isMissing = item.is_missing || false
                const missingQuantity = item.quantity - shippedQuantity
                const prep = getItemPreparation(item.id)
                const prepStatus = getPrepStatusInfo(prep)

                return (
                  <div key={item.id} className={cn(
                    "py-3 first:pt-0 last:pb-0",
                    isMissing && "bg-red-50/50 -mx-2 px-2 rounded"
                  )}>
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn(
                            "font-medium",
                            isMissing && "text-red-700"
                          )}>
                            {item.product_name}
                          </p>
                          {isMissing && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Manquant
                            </span>
                          )}
                          {/* Preparation status badge */}
                          {prep && (
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              prepStatus.color
                            )}>
                              {prepStatus.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary">
                          {item.quantity} × {item.unit_price.toFixed(2)} DH
                          {item.variant_name && ` (${item.variant_name})`}
                        </p>
                        {isMissing && (
                          <p className="text-xs text-red-600 mt-0.5">
                            {missingQuantity > 0 && `${missingQuantity} article${missingQuantity > 1 ? 's' : ''} non livré${missingQuantity > 1 ? 's' : ''}`}
                            {item.missing_reason && ` - ${item.missing_reason}`}
                          </p>
                        )}
                        {prep?.notes && !isMissing && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            📝 {prep.notes}
                          </p>
                        )}
                      </div>
                      <span className={cn(
                        "font-medium ml-4",
                        isMissing && "text-red-700 line-through"
                      )}>
                        {item.total_price.toFixed(2)} DH
                      </span>
                    </div>
                  </div>
                )
              })}
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
                <a href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
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
              {/* 🔥 ADD THIS: Show ultimate total if exists */}
              {order.ultimate_total && order.ultimate_total !== order.total && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Montant initial</span>
                    <span className="text-text-secondary line-through">{order.total.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-text-primary">À collecter</span>
                    <span className="text-green-700">{order.ultimate_total.toFixed(2)} DH</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Montant ajusté (articles manquants)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4">Livraison</h2>
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                {order.delivery_notes || 'Aucune note de livraison'}
              </p>

              {/* Missing Items Summary */}
              {hasMissing && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Articles manquants
                  </p>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {missingItems.map(item => (
                      <li key={item.id}>
                        {item.product_name}
                        {item.missing_reason && ` - ${item.missing_reason}`}
                      </li>
                    ))}
                  </ul>
                  {order.missing_items_note && (
                    <p className="text-sm text-red-600 mt-1">
                      Note: {order.missing_items_note}
                    </p>
                  )}
                </div>
              )}

              {/* Preparation Summary */}
              {preparations.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <ClipboardList size={16} />
                    Résumé de la préparation
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">✅ Prêts</span>
                      <span className="font-medium text-blue-800">{preparedItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-700">⚠️ Partiels</span>
                      <span className="font-medium text-yellow-800">{partialItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">❌ En rupture</span>
                      <span className="font-medium text-red-800">{outOfStockItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">⏳ En attente</span>
                      <span className="font-medium text-gray-800">{pendingItems}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Employee */}
              {order.assigned_to && assignedEmployee && (
                <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm font-medium text-indigo-800 flex items-center gap-2">
                    <Package size={16} />
                    Employé assigné
                  </p>
                  <p className="text-sm text-indigo-700 font-medium">
                    {assignedEmployee.full_name}
                  </p>
                  <p className="text-sm text-indigo-600">{assignedEmployee.phone}</p>
                  {order.assigned_at && (
                    <p className="text-xs text-indigo-600 mt-1">
                      Assigné le: {new Date(order.assigned_at).toLocaleString('fr-MA')}
                    </p>
                  )}
                </div>
              )}

              {/* Assigned Driver */}
              {order.delivery_id && assignedDriver && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <Truck size={16} />
                    Livreur assigné
                  </p>
                  <p className="text-sm text-green-700 font-medium">
                    {assignedDriver.full_name}
                  </p>
                  <p className="text-sm text-green-600">{assignedDriver.phone}</p>
                  {assignedDriver.driver_zone && (
                    <p className="text-xs text-green-600">Zone: {assignedDriver.driver_zone}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4">Suivi</h2>
            <div className="space-y-4">
              {/* Pending */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  order.status !== 'pending' ? "bg-green-600" : "bg-muted"
                )}>
                  <Clock size={16} className={order.status !== 'pending' ? "text-white" : "text-text-secondary"} />
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    order.status !== 'pending' ? "text-text-primary" : "text-text-secondary"
                  )}>
                    Commande reçue
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(order.created_at).toLocaleString('fr-MA')}
                  </p>
                </div>
              </div>

              {/* Confirmed */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  ['confirmed', 'assigned', 'preparing', 'ready', 'in_transit', 'delivered'].includes(order.status) ? "bg-green-600" : "bg-muted"
                )}>
                  <CheckCircle size={16} className={['confirmed', 'assigned', 'preparing', 'ready', 'in_transit', 'delivered'].includes(order.status) ? "text-white" : "text-text-secondary"} />
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    ['confirmed', 'assigned', 'preparing', 'ready', 'in_transit', 'delivered'].includes(order.status) ? "text-text-primary" : "text-text-secondary"
                  )}>
                    Confirmée
                  </p>
                  {order.confirmed_at && (
                    <p className="text-xs text-text-secondary">
                      {new Date(order.confirmed_at).toLocaleString('fr-MA')}
                    </p>
                  )}
                </div>
              </div>

              {/* Assigned */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  ['assigned', 'preparing', 'ready', 'in_transit', 'delivered'].includes(order.status) ? "bg-green-600" : "bg-muted"
                )}>
                  <UserCheck size={16} className={['assigned', 'preparing', 'ready', 'in_transit', 'delivered'].includes(order.status) ? "text-white" : "text-text-secondary"} />
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    ['assigned', 'preparing', 'ready', 'in_transit', 'delivered'].includes(order.status) ? "text-text-primary" : "text-text-secondary"
                  )}>
                    Assignée
                  </p>
                  {order.assigned_at && (
                    <p className="text-xs text-text-secondary">
                      {new Date(order.assigned_at).toLocaleString('fr-MA')}
                    </p>
                  )}
                </div>
              </div>

              {/* Preparing */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  ['preparing', 'ready', 'in_transit', 'delivered'].includes(order.status) ? "bg-green-600" : "bg-muted"
                )}>
                  <Package size={16} className={['preparing', 'ready', 'in_transit', 'delivered'].includes(order.status) ? "text-white" : "text-text-secondary"} />
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    ['preparing', 'ready', 'in_transit', 'delivered'].includes(order.status) ? "text-text-primary" : "text-text-secondary"
                  )}>
                    En préparation
                  </p>
                  {order.preparing_at && (
                    <p className="text-xs text-text-secondary">
                      {new Date(order.preparing_at).toLocaleString('fr-MA')}
                    </p>
                  )}
                </div>
              </div>

              {/* Ready */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  ['ready', 'in_transit', 'delivered'].includes(order.status) ? "bg-green-600" : "bg-muted"
                )}>
                  <CheckCircle size={16} className={['ready', 'in_transit', 'delivered'].includes(order.status) ? "text-white" : "text-text-secondary"} />
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    ['ready', 'in_transit', 'delivered'].includes(order.status) ? "text-text-primary" : "text-text-secondary"
                  )}>
                    Prête
                  </p>
                  {order.ready_at && (
                    <p className="text-xs text-text-secondary">
                      {new Date(order.ready_at).toLocaleString('fr-MA')}
                    </p>
                  )}
                  {/* 🔥 ADD THIS: Show delivery code when ready */}
                  {order.delivery_code && ['ready', 'in_transit', 'delivered'].includes(order.status) && (
                    <p className="text-xs text-blue-600 mt-0.5 font-mono">
                      🔑 Code: {order.delivery_code}
                    </p>
                  )}
                </div>
              </div>

              {/* In Transit */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  ['in_transit', 'delivered'].includes(order.status) ? "bg-green-600" : "bg-muted"
                )}>
                  <Truck size={16} className={['in_transit', 'delivered'].includes(order.status) ? "text-white" : "text-text-secondary"} />
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    ['in_transit', 'delivered'].includes(order.status) ? "text-text-primary" : "text-text-secondary"
                  )}>
                    En cours de livraison
                  </p>
                  {order.in_transit_at && (
                    <p className="text-xs text-text-secondary">
                      {new Date(order.in_transit_at).toLocaleString('fr-MA')}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivered */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  order.status === 'delivered' ? "bg-green-600" : "bg-muted"
                )}>
                  <CheckCircle size={16} className={order.status === 'delivered' ? "text-white" : "text-text-secondary"} />
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    order.status === 'delivered' ? "text-text-primary" : "text-text-secondary"
                  )}>
                    Livrée
                  </p>
                  {order.delivered_at && (
                    <p className="text-xs text-text-secondary">
                      {new Date(order.delivered_at).toLocaleString('fr-MA')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}