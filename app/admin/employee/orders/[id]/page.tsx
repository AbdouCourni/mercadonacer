// File: app/admin/employee/orders/[id]/page.tsx
// Path: /app/admin/employee/orders/[id]/page.tsx
// Description: Employee order detail page with preparation tools, missing items, and WhatsApp

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Loader2,
  User,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckSquare,
  Square,
  Edit3,
  Save,
  X,
  AlertTriangle,
  ThumbsUp,
  ClipboardList,
  MessageCircle,
  Send,
  Minus,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Order,
  OrderItem,
  OrderStatus,
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
// STATUS CONFIG
// ============================================

const statusConfig: Record<string, { label: string; color: string; icon: any; nextAction?: string }> = {
  assigned: {
    label: 'À préparer',
    color: 'bg-blue-100 text-blue-700',
    icon: Clock,
    nextAction: 'Commencer la préparation'
  },
  preparing: {
    label: 'En préparation',
    color: 'bg-indigo-100 text-indigo-700',
    icon: Package,
    nextAction: 'Marquer comme prête'
  },
  ready: {
    label: 'Prête',
    color: 'bg-purple-100 text-purple-700',
    icon: CheckCircle
  },
  pending: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock
  },
  confirmed: {
    label: 'Confirmée',
    color: 'bg-teal-100 text-teal-700',
    icon: CheckCircle
  },
  in_transit: {
    label: 'En livraison',
    color: 'bg-orange-100 text-orange-700',
    icon: Truck
  },
  delivered: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-700',
    icon: AlertCircle
  }
}

// ============================================
// WHATSAPP FUNCTIONS
// ============================================

function buildPreparationMessage(
  order: Order,
  preparationItems: Record<string, PreparationItem>
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const sharedLink = `${baseUrl}/order/${order.id}`

  const prepared: OrderItem[] = []
  const partial: { item: OrderItem; prepared: number }[] = []
  const outOfStock: OrderItem[] = []
  const notPrepared: OrderItem[] = []
  const notes: string[] = []

  order.items.forEach((item) => {
    const prep = preparationItems[item.id]

    if (prep?.is_out_of_stock) {
      outOfStock.push(item)
      if (prep.notes) notes.push(`📝 ${item.product_name}: ${prep.notes}`)
    } else if (prep?.is_partially_available) {
      partial.push({ item, prepared: prep.prepared_quantity || 0 })
      if (prep.notes) notes.push(`📝 ${item.product_name}: ${prep.notes}`)
    } else if (prep?.status === 'ready') {
      prepared.push(item)
      if (prep.notes) notes.push(`📝 ${item.product_name}: ${prep.notes}`)
    } else {
      notPrepared.push(item)
      if (prep?.notes) notes.push(`📝 ${item.product_name}: ${prep.notes}`)
    }
  })

  const parts: string[] = []

  parts.push(`🛒 *Commande #${order.order_number}*`)
  parts.push(`👤 *Client:* ${order.guest_name || 'Client'}`)
  parts.push('')

  if (prepared.length > 0) {
    parts.push('✅ *Articles préparés:*')
    prepared.forEach((item) => {
      parts.push(`  • ${item.quantity}x ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''}`)
    })
    parts.push('')
  }

  if (partial.length > 0) {
    parts.push('⚠️ *Articles partiellement préparés:*')
    partial.forEach(({ item, prepared }) => {
      parts.push(`  • ${prepared}/${item.quantity}x ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''}`)
    })
    parts.push('')
  }

  if (outOfStock.length > 0) {
    parts.push('❌ *Articles en rupture de stock:*')
    outOfStock.forEach((item) => {
      parts.push(`  • ${item.quantity}x ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''} ⚠️`)
    })
    parts.push('')
  }

  if (notPrepared.length > 0) {
    parts.push('⏳ *Articles non préparés:*')
    notPrepared.forEach((item) => {
      parts.push(`  • ${item.quantity}x ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''}`)
    })
    parts.push('')
  }

  const total = order.items.length
  const preparedCount = prepared.length
  const partialCount = partial.length
  const outOfStockCount = outOfStock.length

  parts.push('📊 *Résumé:*')
  parts.push(`  • ✅ Préparés: ${preparedCount}/${total}`)
  if (partialCount > 0) parts.push(`  • ⚠️ Partiels: ${partialCount}`)
  if (outOfStockCount > 0) parts.push(`  • ❌ Rupture: ${outOfStockCount}`)
  parts.push('')

  if (notes.length > 0) {
    parts.push('📝 *Notes:*')
    notes.forEach((note) => parts.push(`  ${note}`))
    parts.push('')
  }

  if (order.missing_items_note) {
    parts.push('📝 *Note sur les articles manquants:*')
    parts.push(`  ${order.missing_items_note}`)
    parts.push('')
  }

  parts.push(`🔗 *Suivre la commande:*`)
  parts.push(sharedLink)
  parts.push('')
  parts.push('Merci de votre confiance ! 🙏')

  return parts.join('\n')
}

function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return ''
  let cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  if (!cleaned.startsWith('212')) {
    cleaned = '212' + cleaned
  }
  return cleaned
}

function getWhatsAppUrl(phone: string, message: string): string {
  const formatted = formatPhoneForWhatsApp(phone)
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`
}

// ============================================
// HELPER: Calculate Ultimate Total
// ============================================

function calculateUltimateTotal(
  order: Order,
  preparationItems: Record<string, PreparationItem>
): { ultimateTotal: number; missingTotal: number; hasChanges: boolean } {
  let missingTotal = 0

  order.items.forEach((item) => {
    const prep = preparationItems[item.id]
    if (prep) {
      // Calculate missing quantity
      const missingQuantity = prep.requested_quantity - prep.prepared_quantity
      if (missingQuantity > 0 && !prep.is_out_of_stock) {
        missingTotal += missingQuantity * item.unit_price
      } else if (prep.is_out_of_stock) {
        missingTotal += prep.requested_quantity * item.unit_price
      }
    }
  })

  const ultimateTotal = order.subtotal + order.delivery_fee + order.tax - missingTotal
  const hasChanges = missingTotal > 0

  return {
    ultimateTotal: Math.max(0, ultimateTotal),
    missingTotal,
    hasChanges
  }
}

// ============================================
// HELPER: Generate Delivery Code
// ============================================

function generateDeliveryCode(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ============================================
// COMPONENT
// ============================================

export default function EmployeeOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  

  // Preparation state
  const [preparationItems, setPreparationItems] = useState<Record<string, PreparationItem>>({})
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showQuantityModal, setShowQuantityModal] = useState<string | null>(null)
  const [quantityInput, setQuantityInput] = useState<number>(0)

  const [ultimateTotal, setUltimateTotal] = useState<number | null>(null)
  const [deliveryCode, setDeliveryCode] = useState<string | null>(null)
  // const [showDeliveryCode, setShowDeliveryCode] = useState(false)
  // const [codeCopied, setCodeCopied] = useState(false)


  const [preparationSummary, setPreparationSummary] = useState<{
    total_items: number
    prepared_count: number
    partial_count: number
    out_of_stock_count: number
    all_prepared: boolean
  }>({ total_items: 0, prepared_count: 0, partial_count: 0, out_of_stock_count: 0, all_prepared: false })



  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log('🔍 Fetching employee order:', orderId)

        const response = await fetch(`/api/dashboard/employee/orders/${orderId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Commande non trouvée')
          }
          throw new Error(`Failed to fetch order: ${response.status}`)
        }

        const data = await response.json()
        console.log('✅ Order fetched:', data)

        if (data) {
          data.items = data.items || []
        }

        setOrder(data)

        // Initialize preparation items from order_items
        if (data.items && data.items.length > 0) {
          const initialPreparations: Record<string, PreparationItem> = {}

          // Check if we have existing preparation data
          const existingPreparations = data.preparations || []

          data.items.forEach((item: OrderItem) => {
            const existing = existingPreparations.find((p: any) => p.order_item_id === item.id)

            if (existing) {
              initialPreparations[item.id] = {
                ...existing,
                order_item_id: item.id,
                requested_quantity: item.quantity,
                product_id: item.product_id || null
              }
            } else {
              initialPreparations[item.id] = {
                id: '',
                order_id: orderId,
                order_item_id: item.id,
                product_id: item.product_id || null,
                requested_quantity: item.quantity,
                prepared_quantity: 0,
                is_out_of_stock: false,
                is_partially_available: false,
                notes: null,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }
          })

          setPreparationItems(initialPreparations)
          calculateSummary(initialPreparations, data.items)
        }
      } catch (error) {
        console.error('❌ Error fetching order:', error)
        setError(error instanceof Error ? error.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  // Calculate preparation summary
  const calculateSummary = (
    preparations: Record<string, PreparationItem>,
    items: OrderItem[]
  ) => {
    let preparedCount = 0
    let partialCount = 0
    let outOfStockCount = 0
    let totalItems = items.length

    Object.values(preparations).forEach((p) => {
      if (p.status === 'ready') preparedCount++
      else if (p.is_partially_available) partialCount++
      else if (p.is_out_of_stock) outOfStockCount++
    })

    setPreparationSummary({
      total_items: totalItems,
      prepared_count: preparedCount,
      partial_count: partialCount,
      out_of_stock_count: outOfStockCount,
      all_prepared: preparedCount === totalItems && totalItems > 0
    })
  }

  // Save preparation to database
  const savePreparation = async (itemId: string, prepData: Partial<PreparationItem>) => {
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/preparation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_item_id: itemId,
          ...prepData
        })
      })

      if (!response.ok) {
        console.error('Failed to save preparation')
      }
    } catch (error) {
      console.error('Error saving preparation:', error)
    }
  }

  // Toggle item preparation with quantity support
  const toggleItemPreparation = (itemId: string) => {
    const item = order?.items.find(i => i.id === itemId)
    if (!item) return

    const current = preparationItems[itemId]

    // If quantity > 1 and not prepared, show quantity modal
    if (item.quantity > 1 && current?.status !== 'ready' && !current?.is_partially_available && !current?.is_out_of_stock) {
      setShowQuantityModal(itemId)
      setQuantityInput(1)
      return
    }

    // If already prepared, toggle off
    if (current?.status === 'ready') {
      const updated = {
        ...current,
        status: 'pending' as const,
        prepared_quantity: 0,
        is_partially_available: false
      }
      setPreparationItems(prev => {
        const newState = { ...prev, [itemId]: updated }
        if (order) calculateSummary(newState, order.items)
        return newState
      })
      savePreparation(itemId, { status: 'pending', prepared_quantity: 0, is_partially_available: false })
      return
    }

    // Single item or full quantity
    const updated = {
      ...current,
      status: 'ready' as const,
      prepared_quantity: item.quantity,
      is_partially_available: false,
      is_out_of_stock: false
    }
    setPreparationItems(prev => {
      const newState = { ...prev, [itemId]: updated }
      if (order) calculateSummary(newState, order.items)
      return newState
    })
    savePreparation(itemId, { status: 'ready', prepared_quantity: item.quantity, is_partially_available: false, is_out_of_stock: false })
  }

  // Handle quantity selection for partial preparation
  const handleQuantitySelect = async (itemId: string, quantity: number) => {
    const item = order?.items.find(i => i.id === itemId)
    if (!item) return

    const current = preparationItems[itemId]
    const isPartial = quantity > 0 && quantity < item.quantity
    const isReady = quantity === item.quantity
    const isOutOfStock = quantity === 0

    const updated = {
      ...current,
      prepared_quantity: quantity,
      is_partially_available: isPartial,
      status: isReady ? 'ready' as const : isPartial ? 'preparing' as const : 'pending' as const,
      is_out_of_stock: isOutOfStock
    }

    setPreparationItems(prev => {
      const newState = { ...prev, [itemId]: updated }
      if (order) calculateSummary(newState, order.items)
      return newState
    })

    setShowQuantityModal(null)

    await savePreparation(itemId, {
      prepared_quantity: quantity,
      is_partially_available: isPartial,
      status: updated.status,
      is_out_of_stock: isOutOfStock
    })
  }

  // Toggle out of stock
  const toggleOutOfStock = async (itemId: string) => {
    const current = preparationItems[itemId]
    const isOutOfStock = !current?.is_out_of_stock

    const updated = {
      ...current,
      is_out_of_stock: isOutOfStock,
      status: isOutOfStock ? 'missing' as const : 'pending' as const,
      is_partially_available: false,
      prepared_quantity: 0
    }

    setPreparationItems(prev => {
      const newState = { ...prev, [itemId]: updated }
      if (order) calculateSummary(newState, order.items)
      return newState
    })

    await savePreparation(itemId, {
      is_out_of_stock: isOutOfStock,
      status: updated.status,
      is_partially_available: false,
      prepared_quantity: 0
    })
  }

  // Save note for item
  const saveNote = async (itemId: string) => {
    if (editingNote === itemId) {
      const updated = {
        ...preparationItems[itemId],
        notes: noteText
      }
      setPreparationItems(prev => ({
        ...prev,
        [itemId]: updated
      }))
      setEditingNote(null)
      setNoteText('')

      await savePreparation(itemId, { notes: noteText })
    }
  }

  // Start editing note
  const startEditingNote = (itemId: string, currentNote: string) => {
    setEditingNote(itemId)
    setNoteText(currentNote)
  }

  // Mark all as prepared
  const markAllPrepared = async () => {
    if (!order) return

    const updated: Record<string, PreparationItem> = {}
    const updates: { itemId: string; data: Partial<PreparationItem> }[] = []

    order.items.forEach((item) => {
      const prep = preparationItems[item.id]
      const newPrep = {
        ...prep,
        status: 'ready' as const,
        prepared_quantity: item.quantity,
        is_partially_available: false,
        is_out_of_stock: false
      }
      updated[item.id] = newPrep
      updates.push({
        itemId: item.id,
        data: { status: 'ready', prepared_quantity: item.quantity, is_partially_available: false, is_out_of_stock: false }
      })
    })

    setPreparationItems(updated)
    if (order) calculateSummary(updated, order.items)

    // Save all updates
    await Promise.all(updates.map(({ itemId, data }) => savePreparation(itemId, data)))
  }

  const updateStatus = async (newStatus: string) => {
    if (!order) return

    // Check for missing items before marking as ready
    if (newStatus === 'ready') {
      const hasMissing = Object.values(preparationItems).some(p => p.is_out_of_stock || p.is_partially_available)
      if (hasMissing) {
        const confirmReady = confirm(
          `⚠️ Certains articles sont en rupture ou partiellement préparés.\n\n` +
          `Voulez-vous quand même marquer la commande comme prête ?\n` +
          `(Les articles manquants seront signalés et le total sera ajusté)`
        )
        if (!confirmReady) return
      }
    }

    setUpdating(true)
    try {
      console.log('🔄 Updating status to:', newStatus)

      // Calculate missing items
      const hasMissing = Object.values(preparationItems).some(p => p.is_out_of_stock || p.is_partially_available)
      const missingItemsNote = Object.values(preparationItems)
        .filter(p => p.is_out_of_stock || p.is_partially_available)
        .map(p => {
          const item = order.items.find(i => i.id === p.order_item_id)
          if (p.is_out_of_stock) return `${item?.product_name}: Rupture de stock`
          if (p.is_partially_available) return `${item?.product_name}: ${p.prepared_quantity}/${item?.quantity} préparés`
          return ''
        })
        .filter(Boolean)
        .join('\n')

      // Get preparation data to save
      const preparationData = Object.values(preparationItems).map(p => ({
        order_item_id: p.order_item_id,
        prepared_quantity: p.prepared_quantity,
        is_out_of_stock: p.is_out_of_stock,
        is_partially_available: p.is_partially_available,
        notes: p.notes,
        status: p.status
      }))

      // 🔥 CALCULATE ULTIMATE TOTAL AND GENERATE DELIVERY CODE
      let ultimateTotalValue = null
      let deliveryCodeValue = null

      if (newStatus === 'ready') {
        // Calculate ultimate total using the helper function
        let missingTotal = 0
        order.items.forEach((item) => {
          const prep = preparationItems[item.id]
          if (prep) {
            const missingQuantity = prep.requested_quantity - prep.prepared_quantity
            if (missingQuantity > 0 && !prep.is_out_of_stock) {
              missingTotal += missingQuantity * item.unit_price
            } else if (prep.is_out_of_stock) {
              missingTotal += prep.requested_quantity * item.unit_price
            }
          }
        })
        ultimateTotalValue = Math.max(0, order.subtotal + order.delivery_fee + order.tax - missingTotal)

        // Generate delivery code (6 digits)
        deliveryCodeValue = Math.floor(100000 + Math.random() * 900000).toString()
      }

      const response = await fetch(`/api/dashboard/employee/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          preparation_notes: preparationData,
          has_missing_items: hasMissing,
          missing_items_note: missingItemsNote || null,
          ultimate_total: ultimateTotalValue,
          delivery_code: deliveryCodeValue
        })
      })

      if (response.ok) {
        const data = await response.json()

        // Update local state
        const updatedOrder = {
          ...order,
          status: newStatus,
          has_missing_items: hasMissing,
          missing_items_note: missingItemsNote
        }

        // Add ultimate_total and delivery_code if they exist
        if (ultimateTotalValue !== null) {
          updatedOrder.ultimate_total = ultimateTotalValue
          // Also update the component state if you have setters
          setUltimateTotal(ultimateTotalValue)
        }
        if (deliveryCodeValue !== null) {
          updatedOrder.delivery_code = deliveryCodeValue
          setDeliveryCode(deliveryCodeValue)
        }

        setOrder(updatedOrder)
        router.refresh()
        console.log('✅ Status updated to:', newStatus)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('❌ Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  // Handle mark ready with WhatsApp
  const handleMarkReady = () => {
    setShowWhatsAppModal(true)
  }

  const handleSendWhatsAppAndReady = async () => {
    if (!order || !order.guest_phone) {
      alert('Numéro de téléphone client non disponible')
      return
    }

    const message = buildPreparationMessage(order, preparationItems)
    const url = getWhatsAppUrl(order.guest_phone, message)

    window.open(url, '_blank')
    setShowWhatsAppModal(false)
    await updateStatus('ready')
  }

  const handleReadyWithoutWhatsApp = async () => {
    setShowWhatsAppModal(false)
    await updateStatus('ready')
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
        <p className="text-text-secondary">{error || 'Cette commande n\'existe pas ou ne vous est pas assignée.'}</p>
        <Link href="/admin/employee/orders">
          <Button className="mt-4 bg-primary text-white hover:bg-primary/90">
            Retour aux commandes
          </Button>
        </Link>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon
  const canUpdate = order.status === 'assigned' || order.status === 'preparing'
  const isPreparing = order.status === 'assigned' || order.status === 'preparing'
  const items = order.items || []
  const hasMissing = hasMissingItems(order)
  const missingCount = getMissingItemsCount(order)
  const missingItems = getMissingItems(order)

  // ============================================
  // QUANTITY MODAL
  // ============================================

  const QuantityModal = () => {
    if (!showQuantityModal) return null
    const item = items.find(i => i.id === showQuantityModal)
    if (!item) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 className="text-lg font-bold text-text-primary mb-2">
            Quantité préparée
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            {item.product_name} - Commandé: {item.quantity}
          </p>
          <div className="flex items-center gap-4 justify-center mb-4">
            <button
              onClick={() => setQuantityInput(Math.max(0, quantityInput - 1))}
              className="p-2 rounded-full border border-border hover:bg-muted"
            >
              <Minus size={16} />
            </button>
            <span className="text-2xl font-bold w-12 text-center">{quantityInput}</span>
            <button
              onClick={() => setQuantityInput(Math.min(item.quantity, quantityInput + 1))}
              className="p-2 rounded-full border border-border hover:bg-muted"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowQuantityModal(null)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-primary text-white hover:bg-primary/90"
              onClick={() => handleQuantitySelect(showQuantityModal, quantityInput)}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // WHATSAPP MODAL
  // ============================================

  const WhatsAppModal = () => {
    if (!showWhatsAppModal || !order) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <MessageCircle size={22} className="text-[#25D366]" />
                Notifier le client
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Commande #{order.order_number} - {order.guest_name || 'Client'}
              </p>
            </div>
            <button
              onClick={() => setShowWhatsAppModal(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-[#ece5dd] rounded-xl p-4 text-sm whitespace-pre-wrap font-sans">
              {buildPreparationMessage(order, preparationItems)}
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium text-text-primary mb-2">Résumé</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total articles</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">✅ Préparés</span>
                  <span className="font-medium text-green-600">{preparationSummary.prepared_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">⚠️ Partiels</span>
                  <span className="font-medium text-yellow-600">{preparationSummary.partial_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">❌ Rupture</span>
                  <span className="font-medium text-red-600">{preparationSummary.out_of_stock_count}</span>
                </div>
              </div>
            </div>

            {order.guest_phone && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <Phone size={18} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Client</p>
                  <p className="text-sm text-green-700">{order.guest_name}</p>
                  <p className="text-sm text-green-600">{order.guest_phone}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleReadyWithoutWhatsApp}
              disabled={updating}
            >
              Marquer prête sans notifier
            </Button>
            <Button
              onClick={handleSendWhatsAppAndReady}
              disabled={updating}
              className="bg-[#25D366] hover:bg-[#1da851] text-white flex items-center gap-2"
            >
              {updating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  Envoyer et marquer prête
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/employee/orders" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Commande #{order.order_number}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
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
              <span className="text-sm text-text-secondary">
                <Calendar size={14} className="inline mr-1" />
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

        {/* Action Buttons */}
        {canUpdate && (
          <div className="flex flex-wrap gap-2">
            {order.status === 'assigned' && (
              <Button
                onClick={() => updateStatus('preparing')}
                disabled={updating}
                className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
              >
                {updating ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                {updating ? 'Traitement...' : 'Commencer la préparation'}
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button
                onClick={handleMarkReady}
                disabled={updating}
                className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
              >
                {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {updating ? 'Traitement...' : 'Marquer comme prête'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Preparation Progress */}
      {isPreparing && (
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <ClipboardList size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Progression de la préparation
                </p>
                <p className="text-sm text-text-secondary">
                  {preparationSummary.prepared_count} / {preparationSummary.total_items} articles préparés
                  {preparationSummary.partial_count > 0 && (
                    <span className="ml-2 text-yellow-500">
                      • {preparationSummary.partial_count} partiels
                    </span>
                  )}
                  {preparationSummary.out_of_stock_count > 0 && (
                    <span className="ml-2 text-red-500">
                      • {preparationSummary.out_of_stock_count} en rupture
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${preparationSummary.total_items > 0 ?
                      ((preparationSummary.prepared_count + preparationSummary.partial_count) / preparationSummary.total_items) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-text-primary">
                {preparationSummary.total_items > 0 ?
                  Math.round(((preparationSummary.prepared_count + preparationSummary.partial_count) / preparationSummary.total_items) * 100) : 0}%
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={markAllPrepared}
                className="ml-2"
              >
                <CheckCircle size={14} className="mr-1" />
                Tout préparer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items with Preparation Tools */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Package size={18} />
              Articles ({items.length})
              {hasMissing && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  ⚠️ {missingCount} manquant{missingCount > 1 ? 's' : ''}
                </span>
              )}
            </h2>

            {items.length === 0 ? (
              <p className="text-text-secondary text-center py-8">Aucun article dans cette commande</p>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {items.map((item, index) => {
                    const prep = preparationItems[item.id]
                    const isPrepared = prep?.status === 'ready' || false
                    const isOutOfStock = prep?.is_out_of_stock || false
                    const isPartial = prep?.is_partially_available || false
                    const hasNote = prep?.notes && prep.notes.length > 0
                    const preparedQty = prep?.prepared_quantity || 0

                    return (
                      <div key={item.id || index} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          {/* Checkbox for preparation */}
                          {isPreparing && (
                            <button
                              onClick={() => toggleItemPreparation(item.id)}
                              className="mt-0.5 flex-shrink-0"
                              disabled={updating}
                            >
                              {isPrepared ? (
                                <CheckSquare size={20} className="text-green-600" />
                              ) : isPartial ? (
                                <Square size={20} className="text-yellow-500" />
                              ) : isOutOfStock ? (
                                <Square size={20} className="text-red-500" />
                              ) : (
                                <Square size={20} className="text-text-secondary" />
                              )}
                            </button>
                          )}

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className={cn(
                                  "font-medium",
                                  isPrepared ? "text-green-600 line-through" :
                                    isPartial ? "text-yellow-600" :
                                      isOutOfStock ? "text-red-600" : "text-text-primary"
                                )}>
                                  {item.product_name}
                                  {isOutOfStock && (
                                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                      Rupture
                                    </span>
                                  )}
                                  {isPartial && (
                                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                      Partiel ({preparedQty}/{item.quantity})
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-text-secondary">
                                  {item.quantity} × {item.unit_price?.toFixed(2) || '0'} DH
                                  {item.variant_name && ` (${item.variant_name})`}
                                </p>
                                {isPartial && (
                                  <p className="text-xs text-yellow-600 mt-0.5">
                                    {preparedQty} préparés sur {item.quantity} commandés
                                  </p>
                                )}
                              </div>
                              <span className="font-medium text-primary">
                                {(item.total_price || item.unit_price * item.quantity)?.toFixed(2) || '0'} DH
                              </span>
                            </div>

                            {/* Actions */}
                            {isPreparing && (
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {item.quantity > 1 && !isPrepared && !isOutOfStock && (
                                  <button
                                    onClick={() => {
                                      setShowQuantityModal(item.id)
                                      setQuantityInput(1)
                                    }}
                                    className="text-xs flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                  >
                                    <Edit3 size={12} />
                                    Quantité partielle
                                  </button>
                                )}

                                <button
                                  onClick={() => toggleOutOfStock(item.id)}
                                  className={cn(
                                    "text-xs flex items-center gap-1 px-2 py-0.5 rounded",
                                    isOutOfStock
                                      ? "bg-red-100 text-red-700"
                                      : "text-text-secondary hover:bg-muted"
                                  )}
                                >
                                  <AlertTriangle size={12} />
                                  {isOutOfStock ? 'Annuler rupture' : 'Rupture de stock'}
                                </button>

                                <button
                                  onClick={() => startEditingNote(item.id, prep?.notes || '')}
                                  className="text-xs text-text-secondary hover:text-primary flex items-center gap-1"
                                >
                                  <Edit3 size={12} />
                                  {hasNote ? 'Modifier la note' : 'Ajouter une note'}
                                </button>
                              </div>
                            )}

                            {/* Note input */}
                            {editingNote === item.id && (
                              <div className="mt-2 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder="Note pour cet article..."
                                  className="flex-1 px-3 py-1 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  autoFocus
                                />
                                <button
                                  onClick={() => saveNote(item.id)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                  disabled={updating}
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNote(null)
                                    setNoteText('')
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            )}

                            {/* Show note */}
                            {hasNote && editingNote !== item.id && (
                              <div className="mt-1 text-xs bg-yellow-50 border border-yellow-200 rounded p-1.5 flex items-start gap-1.5">
                                <AlertCircle size={12} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                <span className="text-yellow-700">{prep?.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Sous-total</span>
                    <span>{order.subtotal?.toFixed(2) || '0'} DH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Livraison</span>
                    <span>{order.delivery_fee === 0 ? 'Gratuite' : `${order.delivery_fee?.toFixed(2) || '0'} DH`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{order.total?.toFixed(2) || '0'} DH</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Missing Items Note */}
          {hasMissing && order.missing_items_note && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h2 className="font-semibold text-red-800 mb-1 flex items-center gap-2">
                <AlertTriangle size={18} />
                Articles manquants
              </h2>
              <p className="text-red-700 text-sm whitespace-pre-wrap">{order.missing_items_note}</p>
            </div>
          )}

          {/* Delivery Notes */}
          {order.delivery_notes && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-2">Notes de livraison</h2>
              <p className="text-text-secondary">{order.delivery_notes}</p>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Customer Info */}
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
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-text-secondary" />
                <a
                  href={`https://wa.me/${order.guest_phone?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {order.guest_phone || 'N/A'}
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
            <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <CreditCard size={18} />
              Paiement
            </h2>
            <p className="text-text-primary capitalize">
              {order.payment_method === 'cod' ? 'À la livraison' : 'Carte bancaire'}
            </p>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-text-primary mb-4">Suivi</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  order.status !== 'pending' ? "bg-green-600" : "bg-muted"
                )}>
                  <CheckCircle size={16} className={order.status !== 'pending' ? "text-white" : "text-text-secondary"} />
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

              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  ['assigned', 'preparing', 'ready'].includes(order.status) ? "bg-green-600" : "bg-muted"
                )}>
                  {['assigned', 'preparing', 'ready'].includes(order.status) ? (
                    <Package size={16} className="text-white" />
                  ) : (
                    <Package size={16} className="text-text-secondary" />
                  )}
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    ['assigned', 'preparing', 'ready'].includes(order.status) ? "text-text-primary" : "text-text-secondary"
                  )}>
                    En préparation
                  </p>
                  {order.assigned_at && (
                    <p className="text-xs text-text-secondary">
                      {new Date(order.assigned_at).toLocaleString('fr-MA')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  order.status === 'ready' ? "bg-green-600" : "bg-muted"
                )}>
                  <CheckCircle size={16} className={order.status === 'ready' ? "text-white" : "text-text-secondary"} />
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    order.status === 'ready' ? "text-text-primary" : "text-text-secondary"
                  )}>
                    Prête
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quantity Modal */}
      <QuantityModal />

      {/* WhatsApp Modal */}
      <WhatsAppModal />
    </div>
  )
}