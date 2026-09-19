// File: app/(dashboard)/reports/page.tsx
// Path: /app/(dashboard)/reports/page.tsx
// Description: Reports page with quick date presets

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Filter,
  Download,
  Printer,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Truck,
  Package,
  DollarSign,
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
  FileText,
  Clock,
  Search,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Order,
  hasMissingItems,
  getMissingItemsCount
} from '@/types/order.types'

interface OrderWithRelations extends Order {
  employee_name?: string | null
  driver_name?: string | null
  partner_name?: string | null
}

interface ReportSummary {
  totalOrders: number
  totalRevenue: number
  totalAdjustments: number
  totalDeliveryFees: number
  totalSubtotal: number
  totalOriginal: number
  ordersWithMissing: number
  missingPercentage: number
  averageOrderValue: number
  partners: string[]
}

export default function ReportsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [selectedPreset, setSelectedPreset] = useState('')


  // Filter state
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    orderFrom: '',
    orderTo: '',
    partner: '',
    status: ''
  })

  const [availablePartners, setAvailablePartners] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  // Set default date to today
  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setFilters(prev => ({
      ...prev,
      dateFrom: formattedDate,
      dateTo: formattedDate
    }))
  }, [])

  // Fetch orders with filters
  const fetchOrders = async () => {
    setGenerating(true)
    try {
      const params = new URLSearchParams()

      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      if (filters.orderFrom) params.append('orderFrom', filters.orderFrom)
      if (filters.orderTo) params.append('orderTo', filters.orderTo)
      if (filters.partner) params.append('partner', filters.partner)
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`/api/reports?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        calculateSummary(data.orders || [])
        
        // Extract unique partners
        const partners = [...new Set(data.orders?.map((o: OrderWithRelations) => o.partner_name).filter(Boolean))] as string[]
        setAvailablePartners(partners)
        setLastRefreshed(new Date())
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setGenerating(false)
      setLoading(false)
    }
  }

  // Calculate report summary
  const calculateSummary = (ordersData: OrderWithRelations[]) => {
    const completed = ordersData.filter(o => o.status === 'delivered')
    const totalOrders = completed.length

    const totalOriginal = completed.reduce((sum, o) => sum + (o.total || 0), 0)
    const totalUltimate = completed.reduce((sum, o) => sum + (o.ultimate_total || o.total || 0), 0)
    const totalAdjustments = totalOriginal - totalUltimate
    const totalDeliveryFees = completed.reduce((sum, o) => sum + (o.delivery_fee || 0), 0)
    const totalSubtotal = completed.reduce((sum, o) => sum + (o.subtotal || 0), 0)
    
    const ordersWithMissing = completed.filter(o => hasMissingItems(o))
    const missingCount = ordersWithMissing.length
    const missingPercentage = totalOrders > 0 ? (missingCount / totalOrders) * 100 : 0
    
    const averageOrderValue = totalOrders > 0 ? totalUltimate / totalOrders : 0

    // Extract unique partners
    const partners = [...new Set(ordersData.map(o => o.partner_name).filter(Boolean))] as string[]

    setSummary({
      totalOrders,
      totalRevenue: totalUltimate,
      totalAdjustments,
      totalDeliveryFees,
      totalSubtotal,
      totalOriginal,
      ordersWithMissing: missingCount,
      missingPercentage,
      averageOrderValue,
      partners
    })
  }

  // Quick date presets
  const setDatePreset = (preset: string) => {
  setSelectedPreset(preset)  // ✅ Track the selected preset
  const today = new Date()
  const formattedToday = today.toISOString().split('T')[0]
  let dateFrom = ''
  let dateTo = formattedToday

  switch (preset) {
    case 'today':
      dateFrom = formattedToday
      dateTo = formattedToday
      break
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const formattedYesterday = yesterday.toISOString().split('T')[0]
      dateFrom = formattedYesterday
      dateTo = formattedYesterday
      break
    }
    case 'last7days': {
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(today.getDate() - 7)
      dateFrom = sevenDaysAgo.toISOString().split('T')[0]
      dateTo = formattedToday
      break
    }
    case 'lastMonth': {
      const oneMonthAgo = new Date(today)
      oneMonthAgo.setMonth(today.getMonth() - 1)
      dateFrom = oneMonthAgo.toISOString().split('T')[0]
      dateTo = formattedToday
      break
    }
    case 'last3Months': {
      const threeMonthsAgo = new Date(today)
      threeMonthsAgo.setMonth(today.getMonth() - 3)
      dateFrom = threeMonthsAgo.toISOString().split('T')[0]
      dateTo = formattedToday
      break
    }
    case 'lastYear': {
      const oneYearAgo = new Date(today)
      oneYearAgo.setFullYear(today.getFullYear() - 1)
      dateFrom = oneYearAgo.toISOString().split('T')[0]
      dateTo = formattedToday
      break
    }
    default:
      dateFrom = formattedToday
      dateTo = formattedToday
  }

  setFilters(prev => ({
    ...prev,
    dateFrom,
    dateTo,
    orderFrom: '',
    orderTo: '',
    partner: '',
    status: ''
  }))
}

// resetFilters to clear the preset
const resetFilters = () => {
  setSelectedPreset('')  // ✅ Clear preset selection
  const today = new Date().toISOString().split('T')[0]
  setFilters({
    dateFrom: today,
    dateTo: today,
    orderFrom: '',
    orderTo: '',
    partner: '',
    status: ''
  })
}

//  clearFilters
const clearFilters = () => {
  setSelectedPreset('')  // ✅ Clear preset selection
  setFilters({
    dateFrom: '',
    dateTo: '',
    orderFrom: '',
    orderTo: '',
    partner: '',
    status: ''
  })
}

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }



  // Export to CSV
  const exportCSV = () => {
    if (orders.length === 0) {
      alert('Aucune donnée à exporter')
      return
    }

    const headers = ['Order #', 'Date', 'Customer', 'Total', 'Ultimate Total', 'Adjustments', 'Status', 'Partner']
    const rows = orders.map(o => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString('fr-MA'),
      o.guest_name || 'Client',
      o.total.toFixed(2),
      (o.ultimate_total || o.total).toFixed(2),
      ((o.total || 0) - (o.ultimate_total || o.total || 0)).toFixed(2),
      o.status,
      o.partner_name || ''
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Load data on mount and filter change
  useEffect(() => {
    if (filters.dateFrom && filters.dateTo) {
      fetchOrders()
    }
  }, [filters.dateFrom, filters.dateTo, filters.orderFrom, filters.orderTo, filters.partner, filters.status])

  // Helper function to format date range display
  const getDateRangeDisplay = () => {
    if (filters.dateFrom && filters.dateTo) {
      if (filters.dateFrom === filters.dateTo) {
        return new Date(filters.dateFrom).toLocaleDateString('fr-MA', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }
      return `${new Date(filters.dateFrom).toLocaleDateString('fr-MA')} - ${new Date(filters.dateTo).toLocaleDateString('fr-MA')}`
    }
    return 'Toutes les commandes'
  }

  const hasActiveFilters = filters.orderFrom || filters.orderTo || filters.partner || filters.status
  const hasDateFilter = filters.dateFrom && filters.dateTo

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Rapports</h1>
          <p className="text-text-secondary text-sm">
            {orders.length} commande{orders.length > 1 ? 's' : ''}
            {summary && ` · ${summary.totalOrders} commande${summary.totalOrders > 1 ? 's' : ''} terminée${summary.totalOrders > 1 ? 's' : ''}`}
            {lastRefreshed && (
              <span className="text-xs text-text-secondary ml-2">
                · Dernière mise à jour: {lastRefreshed.toLocaleTimeString('fr-MA')}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={exportCSV}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Exporter CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Printer size={16} />
            Imprimer
          </Button>
          <Button
            onClick={fetchOrders}
            disabled={generating}
            className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
          >
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Chargement...' : 'Actualiser'}
          </Button>
        </div>
      </div>

      {/* Period Display */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-text-secondary" />
          <span className="font-medium text-text-primary">
            {getDateRangeDisplay()}
          </span>
          {!hasDateFilter && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              Toutes les commandes
            </span>
          )}
          {hasActiveFilters && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Filtres actifs
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Quick Date Presets */}
        <select
  onChange={(e) => {
    if (e.target.value) {
      setDatePreset(e.target.value)
    }
  }}
  value={selectedPreset}  // ✅ Shows selected value
  className="px-3 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
>
  <option value="">📅 Période</option>
  <option value="today">📅 Aujourd'hui</option>
  <option value="yesterday">📅 Hier</option>
  <option value="last7days">📅 7 derniers jours</option>
  <option value="lastMonth">📅 30 derniers jours</option>
  <option value="last3Months">📅 3 derniers mois</option>
  <option value="lastYear">📅 12 derniers mois</option>
</select>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-blue-600"
          >
            Aujourd'hui
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-border p-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Filter size={18} />
          <span className="font-medium">Filtres avancés</span>
          <span className={cn(
            "text-xs",
            hasActiveFilters ? "text-blue-600" : "text-text-secondary"
          )}>
            {hasActiveFilters ? '(Actifs)' : ''}
          </span>
          <ChevronRight
            size={18}
            className={cn(
              "ml-auto transition-transform",
              showFilters && "rotate-90"
            )}
          />
        </button>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date From */}
              <div>
                <label className="text-sm font-medium block mb-1">Date de</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="text-sm font-medium block mb-1">Date à</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Order From */}
              <div>
                <label className="text-sm font-medium block mb-1">Commande de</label>
                <input
                  type="text"
                  placeholder="#ORD-2026-0010"
                  value={filters.orderFrom}
                  onChange={(e) => handleFilterChange('orderFrom', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Order To */}
              <div>
                <label className="text-sm font-medium block mb-1">Commande à</label>
                <input
                  type="text"
                  placeholder="#ORD-2026-0020"
                  value={filters.orderTo}
                  onChange={(e) => handleFilterChange('orderTo', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Partner Filter */}
              <div>
                <label className="text-sm font-medium block mb-1">Partenaire</label>
                <select
                  value={filters.partner}
                  onChange={(e) => handleFilterChange('partner', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Tous</option>
                  {availablePartners.map((partner) => (
                    <option key={partner} value={partner}>{partner}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium block mb-1">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="assigned">Assignée</option>
                  <option value="preparing">En préparation</option>
                  <option value="ready">Prête</option>
                  <option value="in_transit">En livraison</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={fetchOrders}
                disabled={generating}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {generating ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Search size={16} className="mr-2" />
                )}
                Appliquer les filtres
              </Button>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X size={16} className="mr-2" />
                Effacer les filtres
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-sm text-text-secondary">Commandes</p>
            <p className="text-2xl font-bold text-text-primary">{summary.totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-sm text-text-secondary">Chiffre d'affaires</p>
            <p className="text-2xl font-bold text-green-600">{summary.totalRevenue.toFixed(2)} DH</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-sm text-text-secondary">Ajustements</p>
            <p className={cn(
              "text-2xl font-bold",
              summary.totalAdjustments > 0 ? "text-red-600" : "text-text-secondary"
            )}>
              {summary.totalAdjustments > 0 ? `-${summary.totalAdjustments.toFixed(2)}` : '0'} DH
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-sm text-text-secondary">Frais de livraison</p>
            <p className="text-2xl font-bold text-orange-600">{summary.totalDeliveryFees.toFixed(2)} DH</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-sm text-text-secondary">Manquants</p>
            <p className="text-2xl font-bold text-red-600">
              {summary.ordersWithMissing}
              <span className="text-sm font-normal text-text-secondary ml-1">
                ({summary.missingPercentage.toFixed(1)}%)
              </span>
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-sm text-text-secondary">Panier moyen</p>
            <p className="text-2xl font-bold text-primary">{summary.averageOrderValue.toFixed(2)} DH</p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Commande</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Client</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Total</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Ultimate</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Ajustement</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Partenaire</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-secondary">
                    <FileText size={48} className="mx-auto text-text-secondary/30 mb-3" />
                    <p>Aucune commande trouvée</p>
                    <p className="text-sm">Ajustez les filtres pour voir plus de résultats</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const hasMissing = hasMissingItems(order)
                  const ultimateTotal = order.ultimate_total || order.total
                  const adjustment = order.total - ultimateTotal
                  
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-text-primary">{order.order_number}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {new Date(order.created_at).toLocaleDateString('fr-MA')}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-text-primary">{order.guest_name || 'Client'}</p>
                        <p className="text-xs text-text-secondary">{order.guest_phone || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-text-secondary line-through">
                        {order.total.toFixed(2)} DH
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary">
                        {ultimateTotal.toFixed(2)} DH
                      </td>
                      <td className="px-4 py-3 text-right">
                        {adjustment > 0 ? (
                          <span className="text-sm text-red-600">-{adjustment.toFixed(2)} DH</span>
                        ) : (
                          <span className="text-sm text-text-secondary">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
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
                          {hasMissing && (
                            <AlertTriangle size={12} className="text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {order.partner_name || '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}