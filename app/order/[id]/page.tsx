// File: app/order/[id]/page.tsx
// Path: /app/order/[id]/page.tsx
// Description: Simple order page with all participants info

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: PageProps) {
  try {
    const { id } = await params
    
    console.log('🔍 [OrderPage] Fetching order:', id)
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // 1. Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          id,
          product_name,
          quantity,
          unit_price,
          total_price,
          variant_name
        )
      `)
      .eq('id', id)
      .maybeSingle()

    if (orderError || !order) {
      console.log('❌ [OrderPage] Order not found:', orderError)
      notFound()
    }

    // 2. Fetch CLIENT info (from profiles using user_id)
    let clientInfo = null
    if (order.user_id) {
      const { data: client } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email')
        .eq('id', order.user_id)
        .maybeSingle()
      
      clientInfo = client
    }

    // 3. Fetch EMPLOYEE info (from profiles using assigned_to)
    let employeeInfo = null
    if (order.assigned_to) {
      const { data: employee } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('id', order.assigned_to)
        .maybeSingle()
      
      employeeInfo = employee
    }

    // 4. Fetch DRIVER info (from profiles using delivery_id)
    let driverInfo = null
    if (order.delivery_id) {
      const { data: driver } = await supabase
        .from('profiles')
        .select('id, full_name, phone, driver_zone')
        .eq('id', order.delivery_id)
        .maybeSingle()
      
      driverInfo = driver
    }

    // 5. Determine user's role
    let userRole = 'none'
    if (user) {
      if (user.id === order.user_id) userRole = 'client'
      else if (user.id === order.delivery_id) userRole = 'driver'
      else if (user.id === order.assigned_to) userRole = 'employee'
    }

    // 6. Build participant list for display
    const participants = [
      {
        role: 'client',
        name: clientInfo?.full_name || order.guest_name || 'Client',
        phone: clientInfo?.phone || order.guest_phone || 'Non disponible',
        id: order.user_id,
        present: !!order.user_id
      },
      {
        role: 'employee',
        name: employeeInfo?.full_name || 'Non assigné',
        phone: employeeInfo?.phone || 'Non disponible',
        id: order.assigned_to,
        present: !!order.assigned_to
      },
      {
        role: 'driver',
        name: driverInfo?.full_name || 'Non assigné',
        phone: driverInfo?.phone || 'Non disponible',
        id: order.delivery_id,
        present: !!order.delivery_id
      }
    ]

    // Status config
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-teal-100 text-teal-700',
      assigned: 'bg-blue-100 text-blue-700',
      preparing: 'bg-indigo-100 text-indigo-700',
      ready: 'bg-purple-100 text-purple-700',
      in_transit: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }

    const statusLabels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      assigned: 'À préparer',
      preparing: 'En préparation',
      ready: 'Prête',
      in_transit: 'En cours de livraison',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Commande #{order.order_number}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <span className="text-sm text-gray-500">
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
                <div className="text-right">
                  <p className="text-sm text-gray-500">Vous êtes</p>
                  <p className="font-semibold text-gray-900 capitalize">{userRole || 'Visiteur'}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Participants Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Participants</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {participants.map((p) => (
                    <div 
                      key={p.role}
                      className={`p-4 rounded-lg border ${
                        p.present ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {p.role === 'client' && '👤'}
                          {p.role === 'employee' && '👨‍🍳'}
                          {p.role === 'driver' && '🚚'}
                        </span>
                        <span className="font-medium text-gray-900 capitalize">{p.role}</span>
                        {p.present && (
                          <span className="text-xs text-green-600 bg-green-200 px-2 py-0.5 rounded-full">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 font-medium">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Articles ({order.items?.length || 0})
                </h2>
                <div className="divide-y divide-gray-200">
                  {(order.items || []).map((item: any) => (
                    <div key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {item.unit_price} DH
                          {item.variant_name && ` (${item.variant_name})`}
                        </p>
                      </div>
                      <span className="font-medium text-gray-900">
                        {(item.total_price || item.unit_price * item.quantity).toFixed(2)} DH
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sous-total</span>
                    <span>{order.subtotal?.toFixed(2) || '0'} DH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Livraison</span>
                    <span>{order.delivery_fee === 0 ? 'Gratuite' : `${order.delivery_fee?.toFixed(2) || '0'} DH`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                    <span>Total</span>
                    <span className="text-primary">{order.total?.toFixed(2) || '0'} DH</span>
                  </div>
                </div>
              </div>

              {/* Address & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">📍 Adresse</h3>
                  <p className="text-gray-600">{order.address_line1}</p>
                  {order.address_line2 && <p className="text-gray-600">{order.address_line2}</p>}
                  <p className="text-gray-600">{order.city} {order.postal_code}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">💳 Paiement</h3>
                  <p className="text-gray-600 capitalize">
                    {order.payment_method === 'cod' ? 'À la livraison' : 'Carte bancaire'}
                  </p>
                  {order.delivery_notes && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-900 mb-1">📝 Notes</h3>
                      <p className="text-gray-600 text-sm">{order.delivery_notes}</p>
                    </div>
                  )}
                </div>
              </div>

            
            </div>
          </div>
        </div>
      </div>
    )
    
  } catch (error) {
    console.error('❌ [OrderPage] Error:', error)
    notFound()
  }
}