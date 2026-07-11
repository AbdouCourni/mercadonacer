// File: services/cart.service.ts
// Path: /services/cart.service.ts
// Description: Cart service for MercadoNacer

import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

// ============================================
// SERVER SIDE (Database)
// ============================================

export async function getCart(userId: string) {
  const supabase = createClient()

  const { data, error } = await (await supabase)
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

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1,
  variantId?: string
) {
  const supabase = createClient()

  // Check if item exists
  let query = (await supabase)
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
    const { data, error } = await (await supabase)
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Insert new
    const { data, error } = await (await supabase)
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

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = createClient()

  if (quantity <= 0) {
    return await removeFromCart(itemId)
  }

  const { data, error } = await (await supabase)
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFromCart(itemId: string) {
  const supabase = createClient()

  const { error } = await (await supabase)
    .from('cart_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
  return { success: true }
}

export async function clearCart(userId: string) {
  const supabase = createClient()

  const { error } = await (await supabase)
    .from('cart_items')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
  return { success: true }
}

// ============================================
// CLIENT SIDE (Guest Cart - localStorage)
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

export function getGuestCartTotal(): number {
  // Note: This is just the count, actual price needs product data
  const cart = getGuestCart()
  return cart.reduce((total: number, item: any) => total + item.quantity, 0)
}