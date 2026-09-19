// File: app/(dashboard)/page.tsx
// Path: /app/(dashboard)/page.tsx
// Description: Dashboard home with stats and financial summary

import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Link,
  Truck,
  Receipt,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Stats card component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  subtitle,
  className
}: { 
  title: string
  value: string | number
  icon: any
  trend?: string
  trendUp?: boolean
  subtitle?: string
  className?: string
}) {
  return (
    <div className={cn(
      "bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon size={24} className="text-primary" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          {trendUp ? (
            <ArrowUp size={16} className="text-green-600" />
          ) : (
            <ArrowDown size={16} className="text-red-600" />
          )}
          <span className={cn(
            "text-sm font-medium",
            trendUp ? "text-green-600" : "text-red-600"
          )}>
            {trend}
          </span>
          <span className="text-sm text-text-secondary">vs mois dernier</span>
        </div>
      )}
    </div>
  )
}

// Financial summary card
function FinancialCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  color,
  bgColor
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon: any
  color: string
  bgColor: string
}) {
  return (
    <div className={cn(
      "bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          bgColor
        )}>
          <Icon size={20} className={color} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className={cn("text-xl font-bold", color)}>{value}</p>
          {subtitle && (
            <p className="text-xs text-text-secondary">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()

  // Get counts
  const [productsCount, ordersCount, usersCount] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
  ])

  // Get completed orders (delivered)
  const { data: deliveredOrders } = await supabase
    .from('orders')
    .select('total, ultimate_total, delivery_fee, subtotal, has_missing_items')
    .eq('status', 'delivered')

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get low stock products
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('*')
    .lt('stock', 10)
    .order('stock', { ascending: true })
    .limit(5)

  // ============================================
  // FINANCIAL CALCULATIONS
  // ============================================

  const completedOrders = deliveredOrders || []
  const totalOrders = completedOrders.length

  // Sum of original totals
  const totalOriginal = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0)

  // Sum of ultimate totals (adjusted amounts)
  const totalUltimate = completedOrders.reduce((sum, order) => sum + (order.ultimate_total || order.total || 0), 0)

  // Sum of delivery fees
  const totalDeliveryFees = completedOrders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0)

  // Sum of subtotals (without delivery fee)
  const totalSubtotal = completedOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0)

  // Total adjustments (missing items deductions)
  const totalAdjustments = totalOriginal - totalUltimate

  // Orders with missing items
  const ordersWithMissing = completedOrders.filter(order => order.has_missing_items === true)
  const missingItemsCount = ordersWithMissing.length
  const missingItemsPercentage = totalOrders > 0 ? (missingItemsCount / totalOrders) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tableau de bord</h1>
        <p className="text-text-secondary">Bienvenue sur votre espace d'administration</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Produits"
          value={productsCount.count || 0}
          icon={Package}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Commandes totales"
          value={ordersCount.count || 0}
          icon={ShoppingBag}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Clients"
          value={usersCount.count || 0}
          icon={Users}
          trend="+15%"
          trendUp={true}
        />
        <StatCard
          title="Commandes terminées"
          value={totalOrders}
          icon={CheckCircle}
          subtitle={`${totalOrders} commandes livrées`}
        />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Subtotal (without delivery) */}
        <FinancialCard
          title="Sous-total (Hors livraison)"
          value={`${totalSubtotal.toLocaleString()} DH`}
          subtitle={`${totalOrders} commandes`}
          icon={Package}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />

        {/* Delivery Fees */}
        <FinancialCard
          title="Frais de livraison"
          value={`${totalDeliveryFees.toLocaleString()} DH`}
          subtitle={`${totalOrders} livraisons`}
          icon={Truck}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />

        {/* Ultimate Total (what was actually paid) */}
        <FinancialCard
          title="Total collecté"
          value={`${totalUltimate.toLocaleString()} DH`}
          subtitle={`${totalUltimate > 0 ? '💰 Montant réel' : 'Aucune commande'}`}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-50"
        />

        {/* Adjustments (missing items deductions) */}
        <FinancialCard
          title="Ajustements (manquants)"
          value={`-${totalAdjustments.toLocaleString()} DH`}
          subtitle={`${ordersWithMissing.length} commandes avec manquants`}
          icon={AlertTriangle}
          color={totalAdjustments > 0 ? "text-red-600" : "text-gray-400"}
          bgColor={totalAdjustments > 0 ? "bg-red-50" : "bg-gray-50"}
        />
      </div>

      {/* Detailed Financial Breakdown */}
      {totalOrders > 0 && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Receipt size={20} />
            Détail des revenus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-text-secondary">Sous-total (Hors livraison)</p>
              <p className="text-2xl font-bold text-blue-600">{totalSubtotal.toLocaleString()} DH</p>
              <p className="text-xs text-text-secondary mt-1">Total des produits vendus</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-text-secondary">+ Frais de livraison</p>
              <p className="text-2xl font-bold text-orange-600">+{totalDeliveryFees.toLocaleString()} DH</p>
              <p className="text-xs text-text-secondary mt-1">Frais de livraison collectés</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-text-secondary">- Ajustements (manquants)</p>
              <p className="text-2xl font-bold text-red-600">-{totalAdjustments.toLocaleString()} DH</p>
              <p className="text-xs text-text-secondary mt-1">Déductions pour articles manquants</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-text-primary">Total collecté</p>
                <p className="text-sm text-text-secondary">Montant réel perçu</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{totalUltimate.toLocaleString()} DH</p>
                {totalAdjustments > 0 && (
                  <p className="text-xs text-red-500">
                    (Réduction de {(totalAdjustments / totalOriginal * 100).toFixed(1)}% vs total initial)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Missing Items Summary */}
      {ordersWithMissing.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  {ordersWithMissing.length} commandes avec articles manquants
                </p>
                <p className="text-sm text-red-600">
                  {missingItemsPercentage.toFixed(1)}% des commandes terminées
                </p>
              </div>
            </div>
            <Link href="/dashboard/orders?missing=true">
              <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                Voir les commandes
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Commandes récentes</h2>
            <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-text-primary text-sm">
                      #{order.order_number?.slice(-6) || 'N/A'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(order.created_at).toLocaleDateString('fr-MA')}
                    </p>
                    {order.has_missing_items && (
                      <span className="text-xs text-red-600 flex items-center gap-0.5">
                        <AlertTriangle size={10} />
                        Manquants
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {order.ultimate_total && order.ultimate_total !== order.total && (
                      <span className="text-xs text-yellow-600 line-through">
                        {order.total?.toFixed(2)} DH
                      </span>
                    )}
                    <span className="font-semibold text-primary">
                      {(order.ultimate_total || order.total)?.toFixed(2) || '0'} DH
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      order.status === 'delivered' ? "bg-green-100 text-green-700" :
                      order.status === 'in_transit' ? "bg-orange-100 text-orange-700" :
                      order.status === 'ready' ? "bg-purple-100 text-purple-700" :
                      order.status === 'preparing' ? "bg-indigo-100 text-indigo-700" :
                      order.status === 'assigned' ? "bg-blue-100 text-blue-700" :
                      order.status === 'confirmed' ? "bg-teal-100 text-teal-700" :
                      order.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                      order.status === 'cancelled' ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-6">Aucune commande récente</p>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Stock critique</h2>
            <Link href="/dashboard/products" className="text-sm text-primary hover:underline">
              Gérer
            </Link>
          </div>
          
          {lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-text-primary text-sm">{product.name}</p>
                    <p className="text-xs text-text-secondary">SKU: {product.sku || 'N/A'}</p>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    product.stock <= 0 ? "text-red-600" :
                    product.stock <= 5 ? "text-orange-500" :
                    "text-yellow-600"
                  )}>
                    {product.stock} en stock
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-text-secondary">Tous les produits sont bien approvisionnés</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}