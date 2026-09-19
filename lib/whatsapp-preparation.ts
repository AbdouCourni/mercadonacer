// File: lib/whatsapp-preparation.ts
// Description: Build WhatsApp messages for preparation status

import { formatPhoneForWhatsApp } from './utils'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  variant_name?: string | null
}

interface PreparedItem {
  order_item_id: string
  prepared_quantity: number
  is_prepared: boolean
  notes: string
  is_out_of_stock: boolean
  stock_available: number
}

interface Order {
  id: string
  order_number: string
  guest_name: string | null
  guest_phone: string | null
  items: OrderItem[]
}

export function buildPreparationMessage(
  order: Order,
  preparedItems: Record<string, PreparedItem>
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const sharedLink = `${baseUrl}/order/${order.id}`
  
  // Separate items by status
  const prepared: OrderItem[] = []
  const notPrepared: OrderItem[] = []
  const outOfStock: OrderItem[] = []
  const notes: string[] = []

  order.items.forEach((item) => {
    const prep = preparedItems[item.id]
    
    if (prep?.is_out_of_stock) {
      outOfStock.push(item)
      if (prep.notes) notes.push(`📝 ${item.product_name}: ${prep.notes}`)
    } else if (prep?.is_prepared) {
      prepared.push(item)
      if (prep.notes) notes.push(`📝 ${item.product_name}: ${prep.notes}`)
    } else {
      notPrepared.push(item)
      if (prep?.notes) notes.push(`📝 ${item.product_name}: ${prep.notes}`)
    }
  })

  // Build message parts
  const parts: string[] = []

  // Header
  parts.push(`🛒 *Commande #${order.order_number}*`)
  parts.push(`👤 *Client:* ${order.guest_name || 'Client'}`)
  parts.push('')

  // Prepared items
  if (prepared.length > 0) {
    parts.push('✅ *Articles préparés:*')
    prepared.forEach((item) => {
      parts.push(`  • ${item.quantity}x ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''}`)
    })
    parts.push('')
  }

  // Out of stock items
  if (outOfStock.length > 0) {
    parts.push('❌ *Articles en rupture de stock:*')
    outOfStock.forEach((item) => {
      parts.push(`  • ${item.quantity}x ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''} ⚠️`)
    })
    parts.push('')
  }

  // Not prepared items
  if (notPrepared.length > 0) {
    parts.push('⏳ *Articles non préparés:*')
    notPrepared.forEach((item) => {
      parts.push(`  • ${item.quantity}x ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''}`)
    })
    parts.push('')
  }

  // Summary
  const total = order.items.length
  const preparedCount = prepared.length
  const outOfStockCount = outOfStock.length
  const notPreparedCount = notPrepared.length

  parts.push('📊 *Résumé:*')
  parts.push(`  • ✅ Préparés: ${preparedCount}/${total}`)
  if (outOfStockCount > 0) parts.push(`  • ❌ Rupture: ${outOfStockCount}`)
  if (notPreparedCount > 0) parts.push(`  • ⏳ Non préparés: ${notPreparedCount}`)
  parts.push('')

  // Notes
  if (notes.length > 0) {
    parts.push('📝 *Notes:*')
    notes.forEach((note) => parts.push(`  ${note}`))
    parts.push('')
  }

  // Footer
  parts.push(`🔗 *Suivre la commande:*`)
  parts.push(sharedLink)
  parts.push('')
  parts.push('Merci de votre confiance ! 🙏')

  return parts.join('\n')
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const formatted = formatPhoneForWhatsApp(phone)
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`
}