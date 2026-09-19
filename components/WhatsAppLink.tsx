// File: components/WhatsAppLink.tsx
// Description: Simple WhatsApp link with shared order link

'use client'

import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WhatsAppLinkProps {
  phone: string
  order: any
  label?: string
  className?: string
}

export function WhatsAppLink({ phone, order, label, className }: WhatsAppLinkProps) {
  if (!phone) return null

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const sharedLink = `${baseUrl}/order/${order.id}`

  const message = `🛒 *Commande #${order.order_number}*

📦 *Statut:* ${order.status}
💰 *Total:* ${order.total?.toFixed(2) || '0'} DH
📍 *Adresse:* ${order.address_line1}, ${order.city}

🔗 *Voir la commande:*
${sharedLink}`

  const cleaned = phone.replace(/[^0-9]/g, '')
  const formatted = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned
  const international = formatted.startsWith('212') ? formatted : `212${formatted}`
  const url = `https://wa.me/${international}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:underline text-sm font-medium",
        className
      )}
    >
      <MessageCircle size={16} />
      {label || 'WhatsApp'}
    </a>
  )
}