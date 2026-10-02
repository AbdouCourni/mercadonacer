// File: lib/site-mode.ts
// Path: /lib/site-mode.ts
// Description: Site mode helper (vitrine vs commerce)

export type SiteMode = 'vitrine' | 'commerce'

export function getSiteMode(): SiteMode {
  const mode = process.env.NEXT_PUBLIC_SITE_MODE
  return mode === 'vitrine' ? 'vitrine' : 'commerce'
}

export function isVitrineMode(): boolean {
  return getSiteMode() === 'vitrine'
}

export function isCommerceMode(): boolean {
  return getSiteMode() === 'commerce'
}

/**
 * WhatsApp contact phone for showcase mode
 * ⚠️ CHANGE THIS to your actual business number
 */
export const VITRINE_WHATSAPP = '+212654063922'

/**
 * Base URL for the site (used to build product links in WhatsApp)
 */
function getSiteUrl(): string {
  // Client-side
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_APP_URL || 'https://nacermarket.com'
}

export function buildWhatsAppUrl(message: string): string {
  const cleanPhone = VITRINE_WHATSAPP.replace(/[^0-9]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

/**
 * Build a WhatsApp order message for a product.
 * Includes a direct link so the admin can see exactly which product.
 */
export function buildProductOrderMessage(
  productName: string,
  price: number,
  variantName?: string | null,
  quantity: number = 1,
  productSlug?: string | null
): string {
  const productUrl = productSlug
    ? `${getSiteUrl()}/products/${productSlug}`
    : null

  const lines = [
    'Bonjour Mercado Nacer,',
    '',
    'Je souhaite commander :',
    `• ${quantity}x ${productName}${variantName ? ` (${variantName})` : ''}`,
    `  Prix : ${price.toFixed(2)} DH`,
  ]

  if (productUrl) {
    lines.push('')
    lines.push(`🔗 Lien du produit : ${productUrl}`)
  }

  lines.push('')
  lines.push('Merci de me confirmer la disponibilité et le délai de livraison.')

  return lines.join('\n')
}