// File: app/order/[id]/OrderView.tsx
// Path: /app/order/[id]/OrderView.tsx
// Description: Unified order view component with role-based rendering

'use client'

import { useState } from 'react'
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
  MessageCircle,
  Users,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  variant_name?: string | null
}

interface Participant {
  role: 'client' | 'driver' | 'employee'
  name: string
  phone: string
  userId: string
}

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  subtotal: number
  delivery_fee: number
  tax: number
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  delivery_notes: string
  payment_method: string
  created_at: string
  items: OrderItem[]
  assigned_at: string | null
  customer: { full_name: string; phone: string } | null
  driver: { id: string; full_name: string; phone: string; driver_zone: string } | null
  employee: { id: string; full_name: string; phone: string } | null
  participants: Participant[]
  userRole: 'client' | 'driver' | 'employee' | 'none'
  participantName: string
  participantPhone: string
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'bg-teal-100 text-teal-700', icon: CheckCircle },
  assigned: { label: 'À préparer', color: 'bg-blue-100 text-blue-700', icon: Clock },
  preparing: { label: 'En préparation', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  ready: { label: 'Prête', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  in_transit: { label: 'En cours de livraison', color: 'bg-orange-100 text-orange-700', icon: Truck },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: CheckCircle }
}

const roleEmojis: Record<string, string> = {
  client: '👤',
  driver: '🚚',
  employee: '👨‍🍳'
}

const roleLabels: Record<string, string> = {
  client: 'Client',
  driver: 'Livreur',
  employee: 'Employé'
}

interface OrderViewProps {
  order: Order
  userRole: 'client' | 'driver' | 'employee' | 'none'
}

export default function OrderView({ order, userRole }: OrderViewProps) {
  const [showParticipants, setShowParticipants] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon
  const items = order.items || []
  const participants = order.participants || []

  // Format phone for WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
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

  // Build WhatsApp message
  const buildWhatsAppMessage = (participant: Participant) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const orderLink = `${baseUrl}/order/${order.id}`
    
    const messages: Record<string, string> = {
      client: `🛒 *Commande #${order.order_number}*

📦 *Statut:* ${status.label}
💰 *Total:* ${order.total.toFixed(2)} DH
📍 *Adresse:* ${order.address_line1}, ${order.city}

🔗 *Suivre ma commande:*
${orderLink}

Merci de votre confiance ! 🙏`,
      
      driver: `🚚 *Mission de livraison #${order.order_number}*

👤 *Client:* ${order.customer?.full_name || order.guest_name || 'Client'}
📍 *Adresse:* ${order.address_line1}, ${order.city}
📱 *Téléphone client:* ${order.customer?.phone || order.guest_phone || 'Non disponible'}
💰 *Montant:* ${order.total.toFixed(2)} DH

🔗 *Détails de la commande:*
${orderLink}

Bonne livraison ! 🚀`,
      
      employee: `👨‍🍳 *Préparation commande #${order.order_number}*

👤 *Client:* ${order.customer?.full_name || order.guest_name || 'Client'}
📍 *Adresse:* ${order.address_line1}, ${order.city}
💰 *Montant:* ${order.total.toFixed(2)} DH

📋 *Articles:*
${items.map((item: OrderItem) => `• ${item.quantity}x ${item.product_name}`).join('\n')}

🔗 *Détails de la commande:*
${orderLink}

Bon travail ! 💪`
    }

    return messages[participant.role] || `📦 *Commande #${order.order_number}*\n\n🔗 ${orderLink}`
  }

  const sendWhatsAppMessage = (participant: Participant) => {
    const message = buildWhatsAppMessage(participant)
    const phone = formatPhoneForWhatsApp(participant.phone)
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  const sendCustomMessage = () => {
    if (!selectedParticipant || !message.trim()) return
    
    setSending(true)
    const phone = formatPhoneForWhatsApp(selectedParticipant.phone)
    if (phone) {
      const fullMessage = `${message}\n\n📦 *Commande #${order.order_number}*\n🔗 ${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`, '_blank')
    }
    setSending(false)
    setMessage('')
    setSelectedParticipant(null)
  }

  // Get available participants to contact (excluding self)
  const availableParticipants = participants.filter(
    p => p.role !== userRole && p.phone
  )

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="container-custom max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Commande #{order.order_number}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-sm px-3 py-1 rounded-full flex items-center gap-1",
                status.color
              )}>
                <StatusIcon size={14} />
                {status.label}
              </span>
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

        {/* Role Badge */}
        <div className="mb-6 bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <span className="text-2xl">{roleEmojis[userRole] || '👤'}</span>
          <div>
            <p className="text-sm text-text-secondary">Vous êtes le/la</p>
            <p className="font-medium text-text-primary">
              {roleLabels[userRole] || 'Visiteur'}
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Package size={18} />
                Articles ({items.length})
              </h2>
              
              {items.length === 0 ? (
                <p className="text-text-secondary text-center py-8">Aucun article</p>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {items.map((item, index) => (
                      <div key={item.id || index} className="py-3 first:pt-0 last:pb-0 flex justify-between items-start">
                        <div>
                          <p className="font-medium text-text-primary">{item.product_name}</p>
                          <p className="text-sm text-text-secondary">
                            {item.quantity} × {item.unit_price?.toFixed(2) || '0'} DH
                            {item.variant_name && ` (${item.variant_name})`}
                          </p>
                        </div>
                        <span className="font-medium text-primary">
                          {item.total_price?.toFixed(2) || (item.unit_price * item.quantity).toFixed(2)} DH
                        </span>
                      </div>
                    ))}
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

            {/* Delivery Notes */}
            {order.delivery_notes && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="font-semibold text-text-primary mb-2">Notes de livraison</h2>
                <p className="text-text-secondary">{order.delivery_notes}</p>
              </div>
            )}
          </div>

          {/* Right: Info & Actions */}
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-4">Informations</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-text-secondary" />
                  <span className="text-text-primary">
                    {order.customer?.full_name || order.guest_name || 'Client'}
                  </span>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-text-secondary mt-1" />
                  <div className="text-text-primary">
                    <p>{order.address_line1}</p>
                    {order.address_line2 && <p>{order.address_line2}</p>}
                    <p>{order.city} {order.postal_code}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-text-secondary" />
                  <span className="text-text-primary capitalize">
                    {order.payment_method === 'cod' ? 'À la livraison' : 'Carte bancaire'}
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Contact Section */}
            {availableParticipants.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <MessageCircle size={18} className="text-[#25D366]" />
                  Contacter
                </h2>

                {/* Quick contact buttons */}
                <div className="space-y-2">
                  {availableParticipants.map((participant) => (
                    <Button
                      key={participant.role}
                      variant="outline"
                      size="sm"
                      onClick={() => sendWhatsAppMessage(participant)}
                      className="w-full justify-start gap-2 text-sm"
                    >
                      <span>{roleEmojis[participant.role]}</span>
                      <span className="flex-1 text-left">
                        {roleLabels[participant.role]}: {participant.name}
                      </span>
                      <MessageCircle size={14} className="text-[#25D366]" />
                    </Button>
                  ))}
                </div>

                {/* Custom message */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-text-secondary mb-2">Message personnalisé</p>
                  <div className="flex gap-2">
                    <select
                      value={selectedParticipant?.role || ''}
                      onChange={(e) => {
                        const p = availableParticipants.find(p => p.role === e.target.value)
                        setSelectedParticipant(p || null)
                      }}
                      className="flex-1 px-2 py-1.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Sélectionner</option>
                      {availableParticipants.map((p) => (
                        <option key={p.role} value={p.role}>
                          {roleLabels[p.role]}
                        </option>
                      ))}
                    </select>
                    
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Votre message..."
                        className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={!selectedParticipant}
                      />
                      <Button
                        size="sm"
                        onClick={sendCustomMessage}
                        disabled={!selectedParticipant || !message.trim() || sending}
                        className="bg-[#25D366] hover:bg-[#1da851] text-white"
                      >
                        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6">
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h2 className="font-semibold text-text-primary flex items-center gap-2">
                    <Users size={18} />
                    Participants ({participants.length})
                  </h2>
                  <span className="text-text-secondary">
                    {showParticipants ? '▲' : '▼'}
                  </span>
                </button>
                
                {showParticipants && (
                  <div className="mt-4 space-y-2">
                    {participants.map((p) => (
                      <div key={p.role} className="flex items-center gap-3 text-sm p-2 hover:bg-muted rounded-lg">
                        <span className="text-lg">{roleEmojis[p.role]}</span>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{p.name}</p>
                          <p className="text-xs text-text-secondary">{roleLabels[p.role]}</p>
                        </div>
                        {p.phone && (
                          <a
                            href={`https://wa.me/${formatPhoneForWhatsApp(p.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#25D366] hover:text-[#1da851]"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}