// app/driver/orders/[id]/page.tsx
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
  Calendar,
  AlertTriangle,
  Key,
  XCircle,
  Check,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Order,
  OrderItem,
  PreparationItem,
  hasMissingItems,
  getMissingItemsCount,
  getMissingItems
} from '@/types/order.types'

// ============================================
// STATUS CONFIG (Local - with actual icons)
// ============================================

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
  },
  ready: {
    label: 'Prête',
    color: 'bg-purple-100 text-purple-700',
    icon: Package
  },
  pending: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock
  },
  cancelled: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-700',
    icon: XCircle
  }
}

// ============================================
// COMPONENT
// ============================================

export default function DriverOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Delivery code verification
  const [enteredCode, setEnteredCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeVerified, setCodeVerified] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/dashboard/drivers/orders/${orderId}`)
        
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

  const handleVerifyCode = () => {
    if (!order?.delivery_code) {
      setCodeError('Aucun code de livraison généré pour cette commande')
      return
    }

    if (enteredCode.trim() === '') {
      setCodeError('Veuillez entrer le code de livraison')
      return
    }

    if (enteredCode.trim() === order.delivery_code) {
      setCodeVerified(true)
      setCodeError(null)
    } else {
      setCodeError('❌ Code incorrect. Veuillez réessayer.')
      setEnteredCode('')
    }
  }

 const updateStatus = async (newStatus: string) => {
  if (!order) return
  
  // Require code verification before marking as delivered
  if (newStatus === 'delivered' && !codeVerified) {
    alert('⚠️ Veuillez d\'abord vérifier le code de livraison avec le client')
    return
  }
  
  setUpdating(true)
  try {
    const response = await fetch(`/api/dashboard/drivers/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: newStatus,
        delivery_code_verified: codeVerified,
        verified_at: new Date().toISOString()
      })
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-MA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Use helper functions from types
  const hasMissing = order ? hasMissingItems(order) : false
  const missingCount = order ? getMissingItemsCount(order) : 0
  const missingItems = order ? getMissingItems(order) : []
  
  const totalToCollect = order?.ultimate_total || order?.total || 0
  const isAdjusted = order?.ultimate_total && order?.ultimate_total !== order?.total

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="mt-4 text-text-secondary">Chargement de la commande...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <Package size={48} className="mx-auto text-text-secondary/30 mb-4" />
        <h2 className="text-xl font-bold text-text-primary">Commande non trouvée</h2>
        <p className="text-text-secondary">{error || 'Cette commande ne vous est pas assignée.'}</p>
        <Link href="/dashboard/driver/orders">
          <Button className="mt-4 bg-primary text-white hover:bg-primary/90">
            Retour aux livraisons
          </Button>
        </Link>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.in_transit
  const StatusIcon = status.icon
  const canDeliver = order.status === 'in_transit' || order.status === 'ready'

  return (
    <div className="space-y-6">
      {/* Header */}
     {/* Header */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  <div className="flex items-center gap-4">
    <Link href="/dashboard/driver/orders" className="p-2 hover:bg-muted rounded-lg transition-colors">
      <ArrowLeft size={20} />
    </Link>
    <div>
      <h1 className="text-2xl font-bold text-text-primary">
        Livraison #{order.order_number}
      </h1>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className={cn(
          "text-sm px-3 py-1 rounded-full flex items-center gap-1",
          status.color
        )}>
          <StatusIcon size={14} />
          {status.label}
        </span>
        {hasMissing && (
          <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
            <AlertTriangle size={14} />
            {missingCount} article{missingCount > 1 ? 's' : ''} manquant{missingCount > 1 ? 's' : ''}
          </span>
        )}
        {isAdjusted && (
          <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
            Total ajusté
          </span>
        )}
        <span className="text-sm text-text-secondary flex items-center gap-1">
          <Calendar size={14} />
          {formatDate(order.created_at)}
        </span>
      </div>
    </div>
  </div>

  {/* 🔥 FIXED: Button always visible when canDeliver, but disabled if not verified */}
  {canDeliver && (
    <Button
      onClick={() => updateStatus('delivered')}
      disabled={updating || !codeVerified}
      className={cn(
        "flex items-center gap-2",
        codeVerified 
          ? "bg-green-600 text-white hover:bg-green-700" 
          : "bg-gray-400 text-white cursor-not-allowed"
      )}
    >
      {updating ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <CheckCircle size={16} />
      )}
      {updating ? 'Traitement...' : codeVerified ? 'Marquer comme livrée' : 'Vérifiez le code d\'abord'}
    </Button>
  )}
</div>

      {/* Delivery Code Verification */}
      {order.delivery_code && order.status !== 'delivered' && (
        <div className={cn(
          "bg-white rounded-xl border p-6 transition-all",
          codeVerified ? "border-green-500 bg-green-50" : "border-blue-300"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
              codeVerified ? "bg-green-100" : "bg-blue-100"
            )}>
              {codeVerified ? (
                <Check size={24} className="text-green-600" />
              ) : (
                <Key size={24} className="text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              {codeVerified ? (
                <div>
                  <h3 className="text-lg font-bold text-green-700">✅ Code vérifié !</h3>
                  <p className="text-sm text-green-600">
                    Vous pouvez maintenant marquer la livraison comme terminée.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-text-primary">🔑 Code de livraison</h3>
                  <p className="text-sm text-text-secondary mb-3">
                    Demandez le code à 6 chiffres au client et entrez-le ci-dessous.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
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
                    </div>
                    <Button
                      onClick={handleVerifyCode}
                      className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                    >
                      <Key size={16} />
                      Vérifier le code
                    </Button>
                  </div>
                  {codeError && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <XCircle size={16} />
                      {codeError}
                    </p>
                  )}
                  <p className="text-xs text-text-secondary mt-2">
                    💡 Le code a été envoyé au client par WhatsApp lors de la préparation de la commande.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items - Left Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Package size={18} />
              Articles ({order.items?.length || 0})
              {hasMissing && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  ⚠️ {missingCount} manquant{missingCount > 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <div className="divide-y divide-border">
              {order.items?.map((item, index) => {
                const isMissing = item.is_missing || false
                const shippedQty = item.shipped_quantity || item.quantity
                const missingQty = item.quantity - shippedQty
                
                return (
                  <div 
                    key={item.id || index} 
                    className={cn(
                      "py-3 first:pt-0 last:pb-0 flex justify-between items-center",
                      isMissing && "bg-red-50/50 -mx-2 px-2 rounded"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-medium",
                          isMissing && "text-red-700 line-through"
                        )}>
                          {item.product_name}
                        </p>
                        {isMissing && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Manquant
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">
                        {item.quantity} × {item.unit_price.toFixed(2)} DH
                        {item.variant_name && ` (${item.variant_name})`}
                      </p>
                      {isMissing && item.missing_reason && (
                        <p className="text-xs text-red-600 mt-0.5">
                          Raison: {item.missing_reason}
                        </p>
                      )}
                      {isMissing && missingQty > 0 && (
                        <p className="text-xs text-red-600">
                          {missingQty} article{missingQty > 1 ? 's' : ''} non livré{missingQty > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <span className={cn(
                      "font-medium",
                      isMissing && "text-red-700 line-through"
                    )}>
                      {item.total_price.toFixed(2)} DH
                    </span>
                  </div>
                )
              })}
            </div>
            
            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Sous-total</span>
                <span>{order.subtotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Frais de livraison</span>
                <span>{order.delivery_fee === 0 ? 'Gratuite' : `${order.delivery_fee.toFixed(2)} DH`}</span>
              </div>
              
              {isAdjusted ? (
                <>
                  <div className="flex justify-between text-sm text-text-secondary line-through">
                    <span>Total initial</span>
                    <span>{order.total.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-text-primary">💰 À collecter</span>
                    <span className="text-green-700">{totalToCollect.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-xs text-yellow-600">
                    <span>⚠️ Total ajusté (articles manquants)</span>
                    <span>-{(order.total - totalToCollect).toFixed(2)} DH</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border">
                  <span>💰 À collecter</span>
                  <span className="text-primary">{totalToCollect.toFixed(2)} DH</span>
                </div>
              )}
            </div>
          </div>

          {/* Missing Items Summary */}
          {hasMissing && order.missing_items_note && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-medium text-red-800 flex items-center gap-2">
                <AlertTriangle size={18} />
                Résumé des articles manquants
              </h3>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap">{order.missing_items_note}</p>
            </div>
          )}
        </div>

        {/* Info - Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <User size={18} />
              Client
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-text-secondary flex-shrink-0" />
                <span className="text-text-primary">{order.guest_name || 'Client'}</span>
              </div>
              {order.guest_phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-text-secondary flex-shrink-0" />
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
                <MapPin size={16} className="text-text-secondary flex-shrink-0 mt-1" />
                <div className="text-text-primary text-sm">
                  <p>{order.address_line1}</p>
                  {order.address_line2 && <p>{order.address_line2}</p>}
                  <p>{order.city} {order.postal_code}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <CreditCard size={18} />
              Paiement
            </h2>
            <p className="text-text-primary capitalize">
              {order.payment_method === 'cod' ? '💰 À la livraison' : '💳 Carte bancaire'}
            </p>
            {isAdjusted && (
              <p className="text-sm text-yellow-600 mt-2">
                ⚠️ Montant ajusté: {totalToCollect.toFixed(2)} DH
              </p>
            )}
          </div>

          {/* Delivery Notes */}
          {order.delivery_notes && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-2">📝 Notes de livraison</h2>
              <p className="text-text-secondary text-sm">{order.delivery_notes}</p>
            </div>
          )}

          {/* Delivery Code Status */}
          {order.delivery_code && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Key size={18} />
                Code de livraison
              </h2>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm px-2 py-1 rounded-full",
                  codeVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                )}>
                  {codeVerified ? '✅ Vérifié' : '⏳ En attente'}
                </span>
                {codeVerified && (
                  <span className="text-xs text-green-600">
                    Vérifié à {new Date().toLocaleTimeString('fr-MA')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}