'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Filter, Grid, List, ChevronDown, Loader2 } from 'lucide-react'

// Get category slug from URL param
const getCategorySlug = (categoryName: string) => {
  const map: Record<string, string> = {
    'Fruits et Légumes Frais': 'fruits-et-legumes',
    'Viandes et Poissons': 'viandes-et-poissons',
    'Épicerie': 'epicerie',
    'Boissons': 'boissons',
    'Maison et Cuisine': 'maison-et-cuisine',
    'Électroménager': 'electromenager',
    'Jeux et Jouets': 'jeux-et-jouets',
    'Cosmétique et Beauté': 'cosmetique-et-beaute'
  }
  return map[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-')
}

export default function ProductsContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'created_at-desc',
    page: 0,
    limit: 20
  })

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        
        // Convert category name to slug if needed
        let categoryValue = filters.category
        if (categoryValue && !categoryValue.includes('-')) {
          categoryValue = getCategorySlug(categoryValue)
        }
        
        if (categoryValue) params.append('category', categoryValue)
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
          Tous nos <span className="text-gradient">Produits</span>
        </h1>
        <p className="text-text-secondary mt-2">
          {loading ? 'Chargement...' : `Découvrez notre sélection de ${totalCount} produits frais et de qualité`}
        </p>
      </div>

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
              className={`p-2 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-text-secondary hover:bg-muted'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`p-2 transition-colors ${
                viewMode === 'list' 
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
              <option value="">Toutes</option>
              <option value="fruits-et-legumes">Fruits et Légumes</option>
              <option value="viandes-et-poissons">Viandes et Poissons</option>
              <option value="epicerie">Épicerie</option>
              <option value="boissons">Boissons</option>
              <option value="maison-et-cuisine">Maison et Cuisine</option>
              <option value="electromenager">Électroménager</option>
              <option value="jeux-et-jouets">Jeux et Jouets</option>
              <option value="cosmetique-et-beaute">Cosmétique et Beauté</option>
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
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
          <Button 
            variant="outline" 
            disabled={filters.page === 0}
            onClick={() => handlePageChange(filters.page - 1)}
          >
            Précédent
          </Button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) {
              pageNum = i
            } else if (filters.page < 3) {
              pageNum = i
            } else if (filters.page > totalPages - 3) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = filters.page - 1 + i
            }
            
            return (
              <Button
                key={pageNum}
                variant={filters.page === pageNum ? 'primary' : 'outline'}
                className={filters.page === pageNum ? 'bg-primary text-white hover:bg-primary/90' : ''}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum + 1}
              </Button>
            )
          })}

          <Button 
            variant="outline"
            disabled={filters.page >= totalPages - 1}
            onClick={() => handlePageChange(filters.page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}