// File: components/OrderWhatsAppButtons.tsx
// Description: WhatsApp buttons with shared order link

'use client'

import { useState } from 'react'
import { MessageCircle, Phone, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getWhatsAppLink,
  buildClientMessage,
  buildDriverMessage,
  buildEmployeeMessage
} from '@/lib/whatsapp-messages'

interface Participant {
  role: 'client' | 'driver' | 'employee'
  name: string
  phone: string
  id: string
}

interface OrderWhatsAppButtonsProps {
  order: any
  className?: string
}

export function OrderWhatsAppButtons({ order, className }: OrderWhatsAppButtonsProps) {
  const [expanded, setExpanded] = useState(false)
  
  if (!order) return null

  // Build participants list with their messages
  const participants = [
    {
      role: 'client' as const,
      name: order.customer?.full_name || order.guest_name || 'Client',
      phone: order.customer?.phone || order.guest_phone || '',
      id: order.user_id,
      message: buildClientMessage(order),
      icon: '👤',
      label: 'Client'
    },
    {
      role: 'driver' as const,
      name: order.driver?.full_name || 'Livreur',
      phone: order.driver?.phone || '',
      id: order.delivery_id,
      message: buildDriverMessage(order),
      icon: '🚚',
      label: 'Livreur'
    },
    {
      role: 'employee' as const,
      name: order.employee?.full_name || 'Employé',
      phone: order.employee?.phone || '',
      id: order.assigned_to,
      message: buildEmployeeMessage(order),
      icon: '👨‍🍳',
      label: 'Employé'
    }
  ].filter(p => p.phone) // Only show participants with phone numbers

  if (participants.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm w-full justify-center"
      >
        <MessageCircle size={16} className="text-[#25D366]" />
        <span>Contacter via WhatsApp ({participants.length})</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </Button>

      {expanded && (
        <div className="space-y-2 p-2 bg-gray-50 rounded-lg">
          {participants.map((p) => (
            <a
              key={p.role}
              href={getWhatsAppLink(p.phone, p.message)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white hover:bg-gray-100 p-3 rounded-lg transition-colors border border-gray-200"
            >
              <span className="text-xl">{p.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{p.label}</p>
                <p className="text-xs text-gray-500">{p.name}</p>
              </div>
              <div className="flex items-center gap-1 text-[#25D366]">
                <MessageCircle size={16} />
                <span className="text-xs font-medium">WhatsApp</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}