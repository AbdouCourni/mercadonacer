// File: lib/whatsapp-messages.ts
// Description: Build WhatsApp messages with shared order link

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export function getWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '')
  const formatted = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned
  const international = formatted.startsWith('212') ? formatted : `212${formatted}`
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`
}

export function buildClientMessage(order: any): string {
  const sharedLink = `${baseUrl}/order/${order.id}`
  
  return `🛒 *Commande #${order.order_number}*

📦 *Statut:* ${getStatusLabel(order.status)}
💰 *Total:* ${order.total.toFixed(2)} DH
📍 *Adresse:* ${order.address_line1}, ${order.city}

📋 *Résumé des articles:*
${order.items?.map((item: any) => 
  `• ${item.quantity}x ${item.product_name} - ${(item.total_price || item.unit_price * item.quantity).toFixed(2)} DH`
).join('\n')}

${order.driver?.full_name ? `🚚 *Livreur:* ${order.driver.full_name}` : ''}
${order.driver?.phone ? `📱 *Téléphone:* ${order.driver.phone}` : ''}

🔗 *Suivre ma commande en temps réel:*
${sharedLink}

Merci de votre confiance ! 🙏`
}

export function buildDriverMessage(order: any): string {
  const sharedLink = `${baseUrl}/order/${order.id}`
  
  return `🚚 *Mission de livraison #${order.order_number}*

📦 *Statut:* ${getStatusLabel(order.status)}
👤 *Client:* ${order.customer?.full_name || order.guest_name || 'Client'}
📍 *Adresse:* ${order.address_line1}, ${order.city}
📱 *Téléphone client:* ${order.customer?.phone || order.guest_phone || 'Non disponible'}
💰 *Montant à collecter:* ${order.total.toFixed(2)} DH

📋 *Articles à livrer:*
${order.items?.map((item: any) => 
  `• ${item.quantity}x ${item.product_name}`
).join('\n')}

${order.delivery_notes ? `📝 *Notes:* ${order.delivery_notes}` : ''}

🔗 *Voir les détails complets:*
${sharedLink}

Bonne livraison ! 🚀`
}

export function buildEmployeeMessage(order: any): string {
  const sharedLink = `${baseUrl}/order/${order.id}`
  
  return `👨‍🍳 *Préparation commande #${order.order_number}*

📦 *Statut:* ${getStatusLabel(order.status)}
👤 *Client:* ${order.customer?.full_name || order.guest_name || 'Client'}
📍 *Adresse:* ${order.address_line1}, ${order.city}
📱 *Téléphone client:* ${order.customer?.phone || order.guest_phone || 'Non disponible'}
💰 *Montant:* ${order.total.toFixed(2)} DH

📋 *Articles à préparer:*
${order.items?.map((item: any) => 
  `• ${item.quantity}x ${item.product_name}`
).join('\n')}

${order.delivery_notes ? `📝 *Notes:* ${order.delivery_notes}` : ''}

🔗 *Voir les détails complets:*
${sharedLink}

Bon travail ! 💪`
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    assigned: 'À préparer',
    preparing: 'En préparation',
    ready: 'Prête',
    in_transit: 'En cours de livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }
  return labels[status] || status
}