// File: hooks/use-cart.ts
// Path: /hooks/use-cart.ts
// Description: Cart hook for MercadoNacer (Client Component)

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUser } from '@/services/auth.service'
import { 
  getGuestCart, 
  addToGuestCart, 
  removeFromGuestCart, 
  updateGuestCartQuantity,
  clearGuestCart,
  getGuestCartCount,
  getCartClient,
  addToCartClient,
  updateCartItemQuantityClient,
  removeFromCartClient,
  clearCartClient
} from '@/services/cart.client.service'

interface CartItem {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  products: {
    id: string
    name: string
    slug: string
    price: number
    compare_price: number | null
    images: string[]
    stock: number
  }
  product_variants: {
    id: string
    name: string
    price: number
  } | null
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [itemCount, setItemCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  // Fetch cart
  const normalizeItems = (arr: any[] | null | undefined): CartItem[] => {
    return (arr || []).map((it: any) => ({
      id: String(it.id),
      product_id: String(it.product_id ?? it.product_id),
      variant_id: it.variant_id ?? null,
      quantity: Number(it.quantity ?? 0),
      products: it.products && !Array.isArray(it.products)
        ? {
            id: String(it.products.id ?? ''),
            name: String(it.products.name ?? ''),
            slug: String(it.products.slug ?? ''),
            price: Number(it.products.price ?? 0),
            compare_price: it.products.compare_price ?? null,
            images: Array.isArray(it.products.images) ? it.products.images : [],
            stock: Number(it.products.stock ?? 0)
          }
        : (Array.isArray(it.products) ? (it.products[0] ?? { id: '', name: '', slug: '', price: 0, compare_price: null, images: [], stock: 0 }) : { id: '', name: '', slug: '', price: 0, compare_price: null, images: [], stock: 0 }),
      product_variants: it.product_variants || null
    }))
  }

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check if user is logged in
      const user = await getUser()
      setIsLoggedIn(!!user)
      setUserId(user?.id || null)

      if (user) {
        // Fetch from database using client service
        const data = await getCartClient(user.id)
        const normalized = normalizeItems(data)
        setItems(normalized)
        setItemCount(normalized.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0)
      } else {
        // Fetch from localStorage
        const guestItems = getGuestCart()
        setItems(normalizeItems(guestItems as any))
        setItemCount(getGuestCartCount())
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Add to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1, variantId?: string) => {
    try {
      if (isLoggedIn && userId) {
        // User cart - client service
        await addToCartClient(userId, productId, quantity, variantId)
        const updatedCart = await getCartClient(userId)
        const normalized = normalizeItems(updatedCart)
        setItems(normalized)
        setItemCount(normalized.reduce((acc: number, item: any) => acc + item.quantity, 0))
      } else {
        // Guest cart - localStorage
        addToGuestCart(productId, quantity, variantId)
        const guestItems = getGuestCart()
        setItems(normalizeItems(guestItems as any))
        setItemCount(getGuestCartCount())
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }, [isLoggedIn, userId])

  // Update quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (isLoggedIn && userId) {
        // User cart - client service
        await updateCartItemQuantityClient(itemId, quantity)
        const updatedCart = await getCartClient(userId)
        const normalized = normalizeItems(updatedCart)
        setItems(normalized)
        setItemCount(normalized.reduce((acc: number, item: any) => acc + item.quantity, 0))
      } else {
        // Find productId from guest items
        const item = items.find((i: any) => i.id === itemId) as any
        if (item) {
          updateGuestCartQuantity(item.productId, quantity, item.variantId)
          const guestItems = getGuestCart()
          setItems(normalizeItems(guestItems as any))
          setItemCount(getGuestCartCount())
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }, [isLoggedIn, userId, items])

  // Remove from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      if (isLoggedIn && userId) {
        // User cart - client service
        await removeFromCartClient(itemId)
        const updatedCart = await getCartClient(userId)
        const normalized = normalizeItems(updatedCart)
        setItems(normalized)
        setItemCount(normalized.reduce((acc: number, item: any) => acc + item.quantity, 0))
      } else {
        // Find productId from guest items
        const item = items.find((i: any) => i.id === itemId) as any
        if (item) {
          removeFromGuestCart(item.productId, item.variantId)
          const guestItems = getGuestCart()
          setItems(normalizeItems(guestItems as any))
          setItemCount(getGuestCartCount())
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }, [isLoggedIn, userId, items])

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      if (isLoggedIn && userId) {
        // User cart - client service
        await clearCartClient(userId)
        setItems([])
        setItemCount(0)
      } else {
        // Guest cart - localStorage
        clearGuestCart()
        setItems([])
        setItemCount(0)
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }, [isLoggedIn, userId])

  // Calculate total
  const getTotal = useCallback(() => {
    return items.reduce((total, item) => {
      const price = item.products?.price || item.product_variants?.price || 0
      return total + (price * item.quantity)
    }, 0)
  }, [items])

  // Load cart on mount
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  return {
    items,
    loading,
    isLoggedIn,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    refresh: fetchCart
  }
}