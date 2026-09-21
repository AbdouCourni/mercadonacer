// File: app/(admin)/admin/products/page.tsx
// Path: /app/(admin)/admin/products/page.tsx
// Description: Product management list with filters - FIXED

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  stock: number
  images: string[]
  category_id: string
  sku?: string
  is_active: boolean
  is_featured: boolean
  created_at: string
  categories?: {
    id: string
    name: string
    slug: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    stock: '',
    status: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  })
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (filters.category) params.append('category', filters.category)
        if (filters.stock) params.append('stock', filters.stock)
        if (filters.status) params.append('status', filters.status)
        params.append('page', String(pagination.page))
        params.append('limit', String(pagination.limit))

        params.append('includeInactive', 'true')


        const response = await fetch(`/api/products?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        
        if (data.products) {
          setProducts(data.products)
          setPagination(prev => ({ ...prev, total: data.count || 0 }))
        } else {
          setProducts([])
          setPagination(prev => ({ ...prev, total: 0 }))
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setPagination(prev => ({ ...prev, total: 0 }))
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timer)
  }, [search, filters, pagination.page, pagination.limit])

  // Delete single product
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id))
        setPagination(prev => ({ ...prev, total: prev.total - 1 }))
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  // Delete multiple products
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    if (!confirm(`Supprimer ${selectedProducts.length} produits ?`)) return

    setDeletingMultiple(true)
    try {
      const deletePromises = selectedProducts.map(id =>
        fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      )
      
      const results = await Promise.all(deletePromises)
      const allSucceeded = results.every(res => res.ok)

      if (allSucceeded) {
        setProducts(products.filter(p => !selectedProducts.includes(p.id)))
        setPagination(prev => ({ ...prev, total: prev.total - selectedProducts.length }))
        setSelectedProducts([])
        router.refresh()
      } else {
        alert('Some products could not be deleted')
      }
    } catch (error) {
      console.error('Error deleting products:', error)
      alert('Failed to delete products')
    } finally {
      setDeletingMultiple(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length && products.length > 0) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Produits</h1>
          <p className="text-text-secondary text-sm">
            {pagination.total} produit{pagination.total > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-primary text-white hover:bg-primary/90">
            <Plus size={18} className="mr-2" />
            Ajouter un produit
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filter toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Filter size={18} />
            Filtres
            <span className={cn(
              "w-2 h-2 rounded-full",
              Object.values(filters).some(v => v) ? 'bg-primary' : 'bg-transparent'
            )} />
          </Button>

          {/* Bulk actions */}
          {selectedProducts.length > 0 && (
            <Button
              variant="outline"
              onClick={handleBulkDelete}
              disabled={deletingMultiple}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {deletingMultiple ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
              Supprimer ({selectedProducts.length})
            </Button>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
            <div>
              <label className="text-sm font-medium block mb-1">Catégorie</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border"
              >
                <option value="">Toutes</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Stock</label>
              <select
                value={filters.stock}
                onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border"
              >
                <option value="">Tous</option>
                <option value="low">Stock faible (&lt; 10)</option>
                <option value="out">Rupture de stock</option>
                <option value="in">En stock</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border"
              >
                <option value="">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-text-secondary/30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary">Aucun produit</h3>
            <p className="text-text-secondary">Commencez par ajouter votre premier produit</p>
            <Link href="/admin/products/new">
              <Button className="mt-4 bg-primary text-white hover:bg-primary/90">
                <Plus size={18} className="mr-2" />
                Ajouter un produit
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Table - Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-border"
                        disabled={loading}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Produit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Catégorie</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Prix</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Statut</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => {
                            setSelectedProducts(prev =>
                              prev.includes(product.id)
                                ? prev.filter(id => id !== product.id)
                                : [...prev, product.id]
                            )
                          }}
                          className="rounded border-border"
                          disabled={loading || deleting === product.id}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-secondary/30">
                                <Package size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{product.name}</p>
                            <p className="text-xs text-text-secondary">SKU: {product.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {product.categories?.name || 'Non catégorisé'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-primary">{product.price.toFixed(2)} DH</span>
                        {product.compare_price && (
                          <span className="text-xs text-text-secondary line-through ml-1">
                            {product.compare_price.toFixed(2)} DH
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-sm font-medium",
                          product.stock <= 0 ? "text-red-600" :
                          product.stock <= 5 ? "text-orange-500" :
                          "text-green-600"
                        )}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                          product.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        )}>
                          {product.is_active ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {product.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/products/${product.slug}`} target="_blank">
                            <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Voir">
                              <Eye size={16} className="text-text-secondary" />
                            </button>
                          </Link>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Modifier">
                              <Edit size={16} className="text-blue-600" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deleting === product.id ? (
                              <Loader2 size={16} className="animate-spin text-red-600" />
                            ) : (
                              <Trash2 size={16} className="text-red-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {products.map((product) => (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => {
                        setSelectedProducts(prev =>
                          prev.includes(product.id)
                            ? prev.filter(id => id !== product.id)
                            : [...prev, product.id]
                        )
                      }}
                      className="rounded border-border"
                      disabled={loading || deleting === product.id}
                    />
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-secondary/30">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{product.name}</p>
                      <p className="text-sm text-primary font-medium">{product.price.toFixed(2)} DH</p>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/admin/products/${product.id}/edit`}>

                        <button className="p-2 hover:bg-muted rounded transition-colors">
                          <Edit size={16} className="text-blue-600" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        {deleting === product.id ? (
                          <Loader2 size={16} className="animate-spin text-red-600" />
                        ) : (
                          <Trash2 size={16} className="text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-muted rounded">
                      {product.categories?.name || 'Non catégorisé'}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded",
                      product.stock <= 0 ? "bg-red-100 text-red-700" :
                      product.stock <= 5 ? "bg-orange-100 text-orange-700" :
                      "bg-green-100 text-green-700"
                    )}>
                      Stock: {product.stock}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded",
                      product.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    )}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-border gap-3">
                <p className="text-sm text-text-secondary order-2 sm:order-1">
                  {pagination.page * pagination.limit + 1} - {Math.min((pagination.page + 1) * pagination.limit, pagination.total)} sur {pagination.total}
                </p>
                <div className="flex gap-1 order-1 sm:order-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 0 || loading}
                    className="p-2 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="flex items-center px-3 text-sm text-text-secondary">
                    {pagination.page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= totalPages - 1 || loading}
                    className="p-2 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}