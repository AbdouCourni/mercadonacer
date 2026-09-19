// File: hooks/use-cart.ts
// Path: /hooks/use-cart.ts
// Description: Cart hook - WITH SILENT REFRESH

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
  } | null
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

  // Fetch cart - with silent option
  const fetchCart = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true)
      }
      
      const user = await getUser()
      setIsLoggedIn(!!user)
      setUserId(user?.id || null)

      if (user) {
        const data = await getCartClient(user.id)
        const mappedItems = data.map((item: any) => ({
          id: String(item.id),
          product_id: String(item.product_id),
          variant_id: item.variant_id || null,
          quantity: Number(item.quantity),
          products: item.products ? {
            id: String(item.products.id),
            name: String(item.products.name),
            slug: String(item.products.slug),
            price: Number(item.products.price),
            compare_price: item.products.compare_price || null,
            images: Array.isArray(item.products.images) ? item.products.images : [],
            stock: Number(item.products.stock || 0)
          } : null,
          product_variants: item.product_variants || null
        }))
        
        setItems(mappedItems)
        setItemCount(mappedItems.reduce((acc, item) => acc + item.quantity, 0))
      } else {
        const guestItems = getGuestCart()
        
        if (guestItems.length === 0) {
          setItems([])
          setItemCount(0)
          if (!silent) setLoading(false)
          return
        }

        const mappedItems = []
        for (const guestItem of guestItems) {
          try {
            const response = await fetch(`/api/products?id=${guestItem.productId}`)
            if (response.ok) {
              const product = await response.json()
              mappedItems.push({
                id: `guest-${guestItem.productId}-${Date.now()}`,
                product_id: String(guestItem.productId),
                variant_id: guestItem.variantId || null,
                quantity: Number(guestItem.quantity || 1),
                products: {
                  id: String(product.id),
                  name: String(product.name),
                  slug: String(product.slug),
                  price: Number(product.price),
                  compare_price: product.compare_price || null,
                  images: Array.isArray(product.images) ? product.images : [],
                  stock: Number(product.stock || 0)
                },
                product_variants: null
              })
            } else {
              mappedItems.push({
                id: `guest-${guestItem.productId}-${Date.now()}`,
                product_id: String(guestItem.productId),
                variant_id: guestItem.variantId || null,
                quantity: Number(guestItem.quantity || 1),
                products: null,
                product_variants: null
              })
            }
          } catch (error) {
            console.error('Error fetching product:', guestItem.productId, error)
          }
        }
        
        setItems(mappedItems)
        setItemCount(mappedItems.reduce((acc, item) => acc + item.quantity, 0))
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  // Add to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1, variantId?: string) => {
    try {
      if (isLoggedIn && userId) {
        await addToCartClient(userId, productId, quantity, variantId)
      } else {
        addToGuestCart(productId, quantity, variantId)
      }
      // 🔥 Silent refresh - no loading spinner
      await fetchCart(true)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }, [isLoggedIn, userId, fetchCart])

  // Update quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      console.log('🔄 Updating quantity:', { itemId, quantity })
      
      if (isLoggedIn && userId) {
        await updateCartItemQuantityClient(itemId, quantity)
      } else {
        const item = items.find((i: any) => i.id === itemId)
        if (item) {
          updateGuestCartQuantity(item.product_id, quantity, item.variant_id || undefined)
        }
      }
      // 🔥 Silent refresh - no loading spinner
      await fetchCart(true)
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }, [isLoggedIn, userId, items, fetchCart])

  // Remove from cart
 const removeFromCart = useCallback(async (itemId: string) => {
  try {
    console.log('🗑️ Removing item:', itemId)
    
    if (isLoggedIn && userId) {
      await removeFromCartClient(itemId)
    } else {
      const item = items.find((i: any) => i.id === itemId)
      if (item) {
        removeFromGuestCart(item.product_id, item.variant_id || undefined)
      }
    }
    // ✅ Silent refresh - this will update items
    await fetchCart(true)
  } catch (error) {
    console.error('Error removing from cart:', error)
  }
}, [isLoggedIn, userId, items, fetchCart])

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      if (isLoggedIn && userId) {
        await clearCartClient(userId)
      } else {
        clearGuestCart()
      }
      // 🔥 Silent refresh - no loading spinner
      await fetchCart(true)
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }, [isLoggedIn, userId, fetchCart])

  // Calculate total
 const getTotal = useCallback(() => {
  console.log('💰 Calculating total for items:', items.length)
  const total = items.reduce((sum, item) => {
    const price = item.products?.price || 0
    return sum + (price * item.quantity)
  }, 0)
  console.log('💰 Total:', total)
  return total
}, [items])

  // Load cart on mount
  useEffect(() => {
    fetchCart(false)
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