// File: app/(shop)/checkout/success/page.tsx
// Path: /app/(shop)/checkout/success/page.tsx
// Description: Order confirmation page - FIXED redirect

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, Clock, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderNumber) {
      router.push('/')
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber!)}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderNumber, router])

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container-custom py-12 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Commande confirmée !</h1>
        <p className="text-text-secondary mt-2">
          Merci pour votre commande. Nous vous tiendrons informé de son avancement.
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">Détails de la commande</h2>
          <span className="text-sm font-medium text-primary">#{order?.order_number}</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Date</span>
            <span className="text-text-primary">
              {order?.created_at ? new Date(order.created_at).toLocaleDateString('fr-MA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Total</span>
            <span className="font-bold text-primary">
              {order?.total?.toFixed(2) || '0'} DH
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Paiement</span>
            <span className="text-text-primary capitalize">
              {order?.payment_method === 'cod' ? 'À la livraison' : 'Carte bancaire'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Livraison</span>
            <span className="text-text-primary">{order?.city || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Adresse</span>
            <span className="text-text-primary text-right max-w-[60%]">
              {order?.address_line1}
              {order?.address_line2 && `, ${order.address_line2}`}
            </span>
          </div>
        </div>

        {/* Order Items */}
        {order?.items && order.items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="font-medium text-text-primary mb-2">Articles</h3>
            <div className="space-y-2">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="text-text-primary">
                    {item.total_price?.toFixed(2) || (item.unit_price * item.quantity).toFixed(2)} DH
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
{order.delivery_code && (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
    <h3 className="font-medium text-blue-800 mb-2">
      🔑 Code de livraison
    </h3>
    <p className="text-3xl font-bold text-blue-700 tracking-widest">
      {order.delivery_code}
    </p>
    <p className="text-sm text-blue-600 mt-2">
      Présentez ce code au livreur lors de la livraison
    </p>
  </div>
)}
      {/* Status Tracking */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="font-semibold text-text-primary mb-4">Suivi de commande</h2>
        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Commande confirmée</p>
              <p className="text-xs text-text-secondary">
                {order?.created_at ? new Date(order.created_at).toLocaleString('fr-MA') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="border-l-2 border-border ml-4 h-6" />
          <div className="flex items-center gap-4 opacity-50">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Clock size={16} className="text-text-secondary" />
            </div>
            <div>
              <p className="font-medium text-text-secondary">En préparation</p>
              <p className="text-xs text-text-secondary">En attente...</p>
            </div>
          </div>
          <div className="border-l-2 border-border ml-4 h-6" />
          <div className="flex items-center gap-4 opacity-50">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Truck size={16} className="text-text-secondary" />
            </div>
            <div>
              <p className="font-medium text-text-secondary">En cours de livraison</p>
              <p className="text-xs text-text-secondary">En attente...</p>
            </div>
          </div>
          <div className="border-l-2 border-border ml-4 h-6" />
          <div className="flex items-center gap-4 opacity-50">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="text-text-secondary" />
            </div>
            <div>
              <p className="font-medium text-text-secondary">Livrée</p>
              <p className="text-xs text-text-secondary">En attente...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions - Fixed redirect to customer orders */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">
            <Home size={18} className="mr-2" />
            Retour à l'accueil
          </Button>
        </Link>
        <Link href="/account/orders" className="flex-1">
          <Button className="w-full bg-primary text-white hover:bg-primary/90">
            <Package size={18} className="mr-2" />
            Voir mes commandes
          </Button>
        </Link>
      </div>
    </div>
  )
}