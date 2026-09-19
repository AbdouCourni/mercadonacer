// File: app/admin/delivery/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Truck, CheckCircle, Clock, MapPin, User, Phone, Key, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Order,
  hasMissingItems,
  getMissingItemsCount
} from '@/types/order.types'

interface OrderWithDelivery extends Order {
  delivery_code: string | null
  ultimate_total: number | null
  has_missing_items: boolean
}

export default function DriverOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Delivery code modal state
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [enteredCode, setEnteredCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [orderCode, setOrderCode] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔍 Fetching driver orders...')
      
      // Try both possible endpoints
      let response = await fetch('/api/dashboard/driver/orders')
      
      // If first fails, try with 's'
      if (!response.ok) {
        console.log('🔄 Trying /api/dashboard/drivers/orders...')
        response = await fetch('/api/dashboard/drivers/orders')
      }
      
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Orders data:', data)
        
        // Handle different response formats
        const ordersData = data.orders || data.data || []
        setOrders(ordersData)
        
        if (ordersData.length === 0) {
          console.log('ℹ️ No orders found')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ API Error:', errorData)
        setError(errorData.error || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      setError('Network error - please try again')
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

  // Handle delivery code verification
  const handleDeliverClick = (order: OrderWithDelivery) => {
    if (!order.delivery_code) {
      alert('⚠️ Aucun code de livraison généré pour cette commande')
      return
    }
    
    setSelectedOrderId(order.id)
    setOrderCode(order.delivery_code)
    setEnteredCode('')
    setCodeError(null)
    setShowCodeModal(true)
  }

  const handleVerifyCode = () => {
    if (!orderCode) {
      setCodeError('Aucun code disponible')
      return
    }

    if (enteredCode.trim() === '') {
      setCodeError('Veuillez entrer le code de livraison')
      return
    }

    if (enteredCode.trim() === orderCode) {
      // Code verified - proceed with delivery
      setShowCodeModal(false)
      if (selectedOrderId) {
        updateStatus(selectedOrderId, 'delivered')
      }
    } else {
      setCodeError('❌ Code incorrect. Veuillez réessayer.')
      setEnteredCode('')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mes livraisons</h1>
          <p className="text-text-secondary text-sm">
            {orders.length} commande{orders.length > 1 ? 's' : ''} assignée{orders.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchOrders}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Actualiser
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-medium">⚠️ Erreur</p>
          <p className="text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="mt-2"
          >
            Réessayer
          </Button>
        </div>
      )}

      {!error && orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <Truck size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <h3 className="text-lg font-medium text-text-primary">Aucune livraison</h3>
          <p className="text-text-secondary">Aucune commande assignée pour le moment.</p>
          <Button
            variant="outline"
            onClick={fetchOrders}
            className="mt-4"
          >
            <RefreshCw size={16} className="mr-2" />
            Actualiser
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const hasMissing = hasMissingItems(order)
            const missingCount = getMissingItemsCount(order)
            const isAdjusted = order.ultimate_total && order.ultimate_total !== order.total
            const totalToCollect = order.ultimate_total || order.total
            
            return (
              <div key={order.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-text-primary">#{order.order_number}</p>
                  <div className="flex items-center gap-1">
                    {hasMissing && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-0.5">
                        <AlertTriangle size={10} />
                        {missingCount}
                      </span>
                    )}
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      order.status === 'in_transit' && "bg-orange-100 text-orange-700",
                      order.status === 'delivered' && "bg-green-100 text-green-700",
                      order.status === 'ready' && "bg-purple-100 text-purple-700"
                    )}>
                      {order.status === 'in_transit' && 'En cours'}
                      {order.status === 'delivered' && 'Livrée'}
                      {order.status === 'ready' && 'Prête'}
                    </span>
                  </div>
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

                <div className="mt-2 flex items-center gap-2">
                  <p className="text-lg font-bold text-primary">
                    {totalToCollect.toFixed(2)} DH
                  </p>
                  {isAdjusted && (
                    <span className="text-xs text-yellow-600 line-through">
                      {order.total.toFixed(2)} DH
                    </span>
                  )}
                </div>

                {/* Delivery Code Status */}
                {order.delivery_code && order.status !== 'delivered' && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <Key size={12} className="text-blue-500" />
                    <span className="text-text-secondary">Code: {order.delivery_code}</span>
                    <span className="text-xs text-blue-500 ml-1">(à demander au client)</span>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {order.status === 'in_transit' && (
                    <Button
                      size="sm"
                      onClick={() => handleDeliverClick(order)}
                      disabled={updating === order.id}
                      className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                    >
                      {updating === order.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Livrée
                        </>
                      )}
                    </Button>
                  )}

                  {order.status === 'ready' && (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/admin/driver/orders/${order.id}`)}
                      className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Truck size={14} />
                      Commencer
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
            )
          })}
        </div>
      )}

      {/* Delivery Code Verification Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Key size={22} className="text-blue-600" />
                Vérification du code
              </h2>
              <button
                onClick={() => {
                  setShowCodeModal(false)
                  setSelectedOrderId(null)
                }}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-2">
              Demandez le code de livraison au client et entrez-le ci-dessous.
            </p>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-xs text-blue-600">Code à vérifier</p>
              <p className="text-2xl font-bold text-blue-700 tracking-widest">
                {orderCode}
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                placeholder="Entrez le code à 6 chiffres"
                value={enteredCode}
                onChange={(e) => {
                  setEnteredCode(e.target.value.replace(/\D/g, ''))
                  setCodeError(null)
                }}
                className={cn(
                  "w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg focus:outline-none focus:ring-2 font-mono",
                  codeError 
                    ? "border-red-300 focus:ring-red-500/50 bg-red-50" 
                    : "border-border focus:ring-primary/50"
                )}
                autoFocus
              />

              {codeError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle size={16} />
                  {codeError}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCodeModal(false)
                    setSelectedOrderId(null)
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleVerifyCode}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle size={16} className="mr-1" />
                  Confirmer la livraison
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}