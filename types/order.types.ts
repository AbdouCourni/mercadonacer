// File: types/order.types.ts
// Path: /types/order.types.ts
// Description: Shared order types for all pages

// ============================================
// CORE TYPES
// ============================================

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  shipped_quantity: number
  unit_price: number
  total_price: number
  variant_name: string | null
  variant_id: string | null
  is_missing: boolean
  missing_reason: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  address_line1: string
  address_line2: string
  city: string
  state: string | null
  postal_code: string
  country: string
  delivery_notes: string | null
  subtotal: number
  delivery_fee: number
  tax: number
  discount: number
  total: number
  ultimate_total: number | null          // ✅ Final amount after adjustments
  ultimate_total_calculated_at: string | null  // ✅ When adjusted total was calculated
  payment_method: string
  payment_status: string
  payment_id: string | null
  status: string
  assigned_to: string | null
  delivery_id: string | null
  delivery_code: string | null            // ✅ Delivery verification code
  has_missing_items: boolean
  missing_items_note: string | null
  preparation_notes: any | null           // ✅ Preparation data from employee
  assigned_at: string | null
  confirmed_at: string | null
  preparing_at: string | null
  ready_at: string | null
  in_transit_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
}

// ============================================
// PREPARATION TYPES
// ============================================

export interface PreparationItem {
  id: string
  order_id: string
  order_item_id: string
  product_id: string | null
  requested_quantity: number
  prepared_quantity: number
  is_out_of_stock: boolean
  is_partially_available: boolean
  notes: string | null
  status: 'pending' | 'preparing' | 'ready' | 'missing'
  created_at: string
  updated_at: string
}

// ============================================
// RELATION TYPES
// ============================================

export interface OrderWithRelations extends Order {
  customer: {
    id: string
    full_name: string
    phone: string
    email: string
  } | null
  driver: {
    id: string
    full_name: string
    phone: string
    email: string
    driver_zone: string | null
  } | null
  employee: {
    id: string
    full_name: string
    phone: string
    email: string
  } | null
  preparations?: PreparationItem[]  // ✅ Added preparations relation
}

// ============================================
// USER TYPES
// ============================================

export interface Employee {
  id: string
  full_name: string
  phone: string
  email: string
  is_active: boolean
  driver_zone: string | null
  preferred_language: string
}

export interface Driver {
  id: string
  full_name: string
  phone: string
  email: string
  is_active: boolean
  driver_zone: string | null
  is_available: boolean
}

// ============================================
// STATUS TYPES
// ============================================

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'preparing'
  | 'ready'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'

// Status config with icon names (will be mapped to actual components in pages)
export const ORDER_STATUSES: Record<OrderStatus, { label: string; color: string; iconName: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', iconName: 'Clock' },
  confirmed: { label: 'Confirmée', color: 'bg-teal-100 text-teal-700', iconName: 'CheckCircle' },
  assigned: { label: 'Assignée', color: 'bg-blue-100 text-blue-700', iconName: 'UserCheck' },
  preparing: { label: 'En préparation', color: 'bg-indigo-100 text-indigo-700', iconName: 'Package' },
  ready: { label: 'Prête', color: 'bg-purple-100 text-purple-700', iconName: 'CheckCircle' },
  in_transit: { label: 'En livraison', color: 'bg-orange-100 text-orange-700', iconName: 'Truck' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700', iconName: 'CheckCircle' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700', iconName: 'XCircle' }
}

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'assigned', label: 'Assignée' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'ready', label: 'Prête' },
  { value: 'in_transit', label: 'En livraison' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' }
]

export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'cancelled'],
  assigned: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Check if order has missing items
export function hasMissingItems(order: Order): boolean {
  return order.items?.some(item => item.is_missing) || false
}

// Get missing items count
export function getMissingItemsCount(order: Order): number {
  return order.items?.filter(item => item.is_missing).length || 0
}

// Get missing items list
export function getMissingItems(order: Order): OrderItem[] {
  return order.items?.filter(item => item.is_missing) || []
}

// Calculate order total from items
export function calculateOrderTotal(items: OrderItem[], deliveryFee: number = 0, tax: number = 0): number {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.shipped_quantity * item.unit_price)
  }, 0)
  return subtotal + deliveryFee + tax
}

// Calculate ultimate total based on preparation
export function calculateUltimateTotal(
  order: Order,
  preparationItems: Record<string, PreparationItem>
): { ultimateTotal: number; missingTotal: number; hasChanges: boolean } {
  let missingTotal = 0

  order.items.forEach((item) => {
    const prep = preparationItems[item.id]
    if (prep) {
      const missingQuantity = prep.requested_quantity - prep.prepared_quantity
      if (missingQuantity > 0 && !prep.is_out_of_stock) {
        missingTotal += missingQuantity * item.unit_price
      } else if (prep.is_out_of_stock) {
        missingTotal += prep.requested_quantity * item.unit_price
      }
    }
  })

  const ultimateTotal = order.subtotal + order.delivery_fee + order.tax - missingTotal

  return {
    ultimateTotal: Math.max(0, ultimateTotal),
    missingTotal,
    hasChanges: missingTotal > 0
  }
}

// Generate delivery code
export function generateDeliveryCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}