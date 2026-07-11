// File: services/cart.client.service.ts
// Path: /services/cart.client.service.ts
// Description: Client-side cart service for MercadoNacer (uses browser client)

'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ============================================
// CLIENT SIDE (Database operations)
// ============================================

export async function getCartClient(userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_id,
      variant_id,
      products (*),
      product_variants (*)
    `)
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

export async function addToCartClient(
  userId: string,
  productId: string,
  quantity: number = 1,
  variantId?: string
) {
  // Check if item exists
  let query = supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (variantId) {
    query = query.eq('variant_id', variantId)
  }

  const { data: existing } = await query.single()

  if (existing) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{
        user_id: userId,
        product_id: productId,
        variant_id: variantId || null,
        quantity
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function updateCartItemQuantityClient(itemId: string, quantity: number) {
  if (quantity <= 0) {
    return await removeFromCartClient(itemId)
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFromCartClient(itemId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
  return { success: true }
}

export async function clearCartClient(userId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
  return { success: true }
}

// ============================================
// GUEST CART (localStorage)
// ============================================

export function getGuestCart(): any[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]')
  } catch {
    return []
  }
}

export function addToGuestCart(productId: string, quantity: number = 1, variantId?: string) {
  const cart = getGuestCart()
  const existing = cart.find(
    (item: any) => item.productId === productId && item.variantId === variantId
  )

  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ productId, variantId, quantity })
  }

  localStorage.setItem('cart', JSON.stringify(cart))
  return cart
}

export function removeFromGuestCart(productId: string, variantId?: string) {
  let cart = getGuestCart()
  cart = cart.filter(
    (item: any) => !(item.productId === productId && item.variantId === variantId)
  )
  localStorage.setItem('cart', JSON.stringify(cart))
  return cart
}

export function dispatchCartUpdate() {
  window.dispatchEvent(new Event('cartUpdated'))
}

export function updateGuestCartQuantity(productId: string, quantity: number, variantId?: string) {
  const cart = getGuestCart()
  const existing = cart.find(
    (item: any) => item.productId === productId && item.variantId === variantId
  )

  if (existing) {
    if (quantity <= 0) {
      return removeFromGuestCart(productId, variantId)
    }
    existing.quantity = quantity
    localStorage.setItem('cart', JSON.stringify(cart))
  }
  return cart
}

export function clearGuestCart() {
  localStorage.removeItem('cart')
  return []
}

export function getGuestCartCount(): number {
  const cart = getGuestCart()
  return cart.reduce((total: number, item: any) => total + item.quantity, 0)
}