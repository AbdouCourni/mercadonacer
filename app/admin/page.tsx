// File: app/(dashboard)/page.tsx
// Path: /app/(dashboard)/page.tsx
// Description: Dashboard home with stats - FIXED

import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Link
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

// Stats card component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp 
}: { 
  title: string
  value: string | number
  icon: any
  trend?: string
  trendUp?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
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

export default async function AdminPage() {
  const supabase = await createClient()

  // Get counts
  const [productsCount, ordersCount, usersCount] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
  ])

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

  // Get total revenue from orders
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .eq('status', 'delivered')

  const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

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
          title="Commandes"
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
          title="Chiffre d'affaires"
          value={`${totalRevenue.toLocaleString()} DH`}
          icon={DollarSign}
          trend="+22%"
          trendUp={true}
        />
      </div>

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
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      order.status === 'delivered' ? "bg-green-100 text-green-700" :
                      order.status === 'processing' ? "bg-blue-100 text-blue-700" :
                      order.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                      order.status === 'cancelled' ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {order.status || 'pending'}
                    </span>
                    <span className="font-semibold text-primary">
                      {order.total?.toFixed(2) || '0'} DH
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