// File: lib/constants/order-status.ts
// Path: /lib/constants/order-status.ts
// Description: Order status constants

export const ORDER_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PREPARING: 'preparing',
  READY: 'ready',
  CONFIRMED: 'confirmed',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]

// Status transitions (which status can go to which)
export const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['assigned', 'cancelled'],
  assigned: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['confirmed', 'cancelled'],
  confirmed: ['delivering', 'cancelled'],
  delivering: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
}

// Status labels for display
export const statusLabels: Record<OrderStatus, string> = {
  pending: 'En attente',
  assigned: 'Assignée',
  preparing: 'En préparation',
  ready: 'Prête',
  confirmed: 'Confirmée',
  delivering: 'En cours de livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée'
}

// Status colors
export const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  preparing: 'bg-indigo-100 text-indigo-700',
  ready: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-teal-100 text-teal-700',
  delivering: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}