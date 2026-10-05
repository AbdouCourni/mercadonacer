'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Filter, Grid, List, ChevronDown, Loader2, X } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'

// Get category slug from URL param


export default function ProductsContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const initialPage = searchParams.get('page')
    ? Math.max(0, parseInt(searchParams.get('page')!) - 1)
    : 0

 const [filters, setFilters] = useState({
  search: searchParams.get('search') || '',      // 🆕
  category: searchParams.get('category') || '',
  minPrice: searchParams.get('minPrice') || '',
  maxPrice: searchParams.get('maxPrice') || '',
  sort: searchParams.get('sort') || 'created_at-desc',
  page: initialPage,
  limit: 25
})

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
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

        // Convert category name to slug if needed
        if (filters.search) params.append('search', filters.search)          // 🆕

       if (filters.category) params.append('category', filters.category)


        if (filters.minPrice) params.append('minPrice', filters.minPrice)
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
        if (filters.sort) params.append('sort', filters.sort)
        params.append('page', String(filters.page))
        params.append('limit', String(filters.limit))

        const response = await fetch(`/api/products?${params.toString()}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data && data.products) {
          setProducts(data.products)
          setTotalCount(data.count || 0)
        } else {
          setProducts([])
          setTotalCount(0)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  // Sync URL when filters change (for shareable links + back button)
  useEffect(() => {
    const params = new URLSearchParams()

      if (filters.search) params.set('search', filters.search)              // 🆕

    if (filters.category) params.set('category', filters.category)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.sort && filters.sort !== 'created_at-desc') params.set('sort', filters.sort)
    if (filters.page > 0) params.set('page', String(filters.page + 1))

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [filters])

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }))
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(totalCount / filters.limit)

  return (
    <div className="container-custom py-8">
      {/* Page Header */}
     <div className="mb-8">
  <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
    {filters.search ? (
      <>
        Résultats pour <span className="text-gradient">"{filters.search}"</span>
      </>
    ) : (
      <>
        Tous nos <span className="text-gradient">Produits</span>
      </>
    )}
  </h1>
  <p className="text-text-secondary mt-2">
    {loading
      ? 'Chargement...'
      : filters.search
        ? `${totalCount} résultat${totalCount !== 1 ? 's' : ''} trouvé${totalCount !== 1 ? 's' : ''}`
        : `Découvrez notre sélection de ${totalCount} produits frais et de qualité`}
  </p>
</div>
{/* 🆕 Search chip */}
{filters.search && (
  <div className="flex items-center gap-2 mb-4 flex-wrap">
    <span className="text-sm text-text-secondary">Recherche :</span>
    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
      "{filters.search}"
      <button
        onClick={() => setFilters(prev => ({ ...prev, search: '', page: 0 }))}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
        aria-label="Effacer la recherche"
      >
        <X size={14} />
      </button>
    </span>
  </div>
)}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filtres
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          {(filters.category || filters.minPrice || filters.maxPrice) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({
                  search: '',
                  category: '',
                  minPrice: '',
                  maxPrice: '',
                  sort: 'created_at-desc',
                  page: 0,
                  limit: 20
                })
              }}
              className="text-text-secondary hover:text-primary"
            >
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">
            {loading ? 'Chargement...' : `${products.length} produits affichés`}
          </span>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              className={`p-2 transition-colors ${viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-secondary hover:bg-muted'
                }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`p-2 transition-colors ${viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-secondary hover:bg-muted'
                }`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Sidebar */}
      {showFilters && (
        <div className="mb-6 p-4 bg-muted rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Catégorie</label>
            <select
  className="w-full px-3 py-2 rounded-lg border border-border bg-white"
  value={filters.category}
  onChange={(e) => handleFilterChange('category', e.target.value)}
>
  <option value="">Toutes les catégories</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.slug}>
      {cat.name}
    </option>
  ))}
</select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Prix min</label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-border bg-white"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Prix max</label>
            <input
              type="number"
              placeholder="1000"
              className="w-full px-3 py-2 rounded-lg border border-border bg-white"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Trier par</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-border bg-white"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="created_at-desc">Nouveautés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating-desc">Meilleures notes</option>
            </select>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-muted rounded-2xl">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">Aucun produit trouvé</h3>
          <p className="text-text-secondary">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'} gap-4`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              comparePrice={product.compare_price}
              image={product.images?.[0] || '/images/placeholder.jpg'}
              barcode={product.barcode}
              sku={product.sku}
              rating={product.rating || 0}
              reviewsCount={product.reviews_count || 0}
              stock={product.stock || 0}
              isInPromotion={product.is_in_promotion}
              promotionPrice={product.promotion_price}
              promotionStart={product.promotion_start}
              promotionEnd={product.promotion_end}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div className="mt-8 bg-white rounded-xl border border-border overflow-hidden">
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disabled={loading}
            totalItems={totalCount}
            itemsPerPage={filters.limit}
            showPageSize={false}
          />
        </div>
      )}
    </div>
  )
}