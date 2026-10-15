// File: lib/wishlist-client.ts
// Path: /lib/wishlist-client.ts
// Description: Guest wishlist stored in localStorage (vitrine mode)

export interface GuestWishlistItem {
  productId: string
  name: string
  slug: string
  price: number
  image: string
  quantity: number
}

const STORAGE_KEY = 'mn_guest_wishlist'
const EVENT_NAME = 'mn:wishlist-updated'

// ---- Read ----
export function getGuestWishlist(): GuestWishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// ---- Write (internal) ----
function setGuestWishlist(items: GuestWishlistItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

// ---- Add / Toggle ----
export function addToGuestWishlist(item: Omit<GuestWishlistItem, 'quantity'>): void {
  const items = getGuestWishlist()
  if (items.some((i) => i.productId === item.productId)) return
  items.push({ ...item, quantity: 1 })
  setGuestWishlist(items)
}

export function removeFromGuestWishlist(productId: string): void {
  const items = getGuestWishlist().filter((i) => i.productId !== productId)
  setGuestWishlist(items)
}

export function toggleGuestWishlist(item: Omit<GuestWishlistItem, 'quantity'>): boolean {
  const items = getGuestWishlist()
  const exists = items.some((i) => i.productId === item.productId)
  if (exists) {
    removeFromGuestWishlist(item.productId)
    return false
  }
  addToGuestWishlist(item)
  return true
}

export function isInGuestWishlist(productId: string): boolean {
  return getGuestWishlist().some((i) => i.productId === productId)
}

// ---- Quantity ----
export function updateGuestWishlistQuantity(productId: string, quantity: number): void {
  const items = getGuestWishlist().map((i) =>
    i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i
  )
  setGuestWishlist(items)
}

// ---- Clear ----
export function clearGuestWishlist(): void {
  setGuestWishlist([])
}

// ---- Event subscription (for React components) ----
export function onGuestWishlistChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', handler) // cross-tab
  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', handler)
  }
}

// ---- Count (for navbar badge) ----
export function getGuestWishlistCount(): number {
  return getGuestWishlist().length
}