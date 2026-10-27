// File: app/(dashboard)/dashboard/hero-slides/page.tsx
// Path: /app/(dashboard)/dashboard/hero-slides/page.tsx
// Description: Manage Hero Products via Search and Drag-sort

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Loader2,
  ArrowUp,
  ArrowDown,
  Trash2,
  Save,
  Search,
  ImageIcon,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeroProduct {
  id: string
  name: string
  slug: string
  image_url: string | null
}

export default function HeroSlidesPage() {
  const router = useRouter()
  
  // State for the current list of selected products
  const [heroProducts, setHeroProducts] = useState<HeroProduct[]>([])
  
  // State for the search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<HeroProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // State for loading/saving
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ============================================
  // FETCH CURRENT HERO PRODUCTS
  // ============================================
  const fetchHeroProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?show_in_hero=true')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      
      const products = (data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image_url: p.images?.[0] || null,
      }))
      
      setHeroProducts(products)
    } catch (error) {
      console.error('Fetch error:', error)
      alert('Failed to load hero products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHeroProducts()
  }, [])

  // ============================================
  // SEARCH PRODUCTS
  // ============================================
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          // Filter out products already in the hero list
          const existingIds = heroProducts.map(p => p.id)
          const results = (data.products || [])
            .filter((p: any) => !existingIds.includes(p.id))
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              image_url: p.images?.[0] || null,
            }))
          setSearchResults(results)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, heroProducts])

  // ============================================
  // HANDLERS
  // ============================================
  const addProduct = (product: HeroProduct) => {
    setHeroProducts([...heroProducts, product])
    setSearchQuery('')
    setSearchResults([])
  }

  const removeProduct = (id: string) => {
    setHeroProducts(heroProducts.filter(p => p.id !== id))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newProducts = [...heroProducts]
    ;[newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]]
    setHeroProducts(newProducts)
  }

  const moveDown = (index: number) => {
    if (index === heroProducts.length - 1) return
    const newProducts = [...heroProducts]
    ;[newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]]
    setHeroProducts(newProducts)
  }

  // ============================================
  // SAVE CHANGES (Batch PATCH)
  // ============================================
    const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Get the list of IDs currently in the selection
      const currentIds = heroProducts.map(p => p.id)

      // 2. Update the ones in the list (set show_in_hero = true and assign order)
      const addPromises = heroProducts.map((product, index) => 
        fetch(`/api/products?id=${product.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            show_in_hero: true,
            hero_order: index + 1,
          }),
        })
      )

      // 3. (Optional but recommended) Hide products that were previously in hero but got removed
      // To do this perfectly, we fetch all current hero products from the DB first.
      const res = await fetch('/api/products?show_in_hero=true')
      const dbData = await res.json()
      const dbHeroIds = (dbData.products || []).map((p: any) => p.id)

      // Find IDs that are in DB but NOT in our current list
      const removedIds = dbHeroIds.filter((id: string) => !currentIds.includes(id))

      // Create promises to hide them
      const removePromises = removedIds.map((id: string) => 
        fetch(`/api/products?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            show_in_hero: false,
          }),
        })
      )

      // 4. Run all updates at the same time
      await Promise.all([...addPromises, ...removePromises])
      
      router.refresh()
      alert('Sélection sauvegardée avec succès !')
    } catch (error) {
      console.error('Save error:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Gestion du Hero (Accueil)
          </h1>
          <p className="text-text-secondary text-sm">
            Sélectionnez les produits qui défileront dans la bannière principale.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-primary text-white hover:bg-primary/90 min-w-[150px]"
        >
          {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
          Sauvegarder la sélection
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Search size={18} />
          Ajouter des produits
        </h2>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un produit par nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {isSearching && (
            <Loader2 size={20} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" />
          )}

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-xl max-h-80 overflow-y-auto z-50">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addProduct(product)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-muted transition-colors border-b border-border last:border-0 text-left"
                >
                  <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {product.image_url && (
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{product.name}</p>
                  </div>
                  <Plus size={18} className="text-primary" />
                </button>
              ))}
            </div>
          )}
          
          {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-xl p-4 text-center text-text-secondary z-50">
              Aucun produit trouvé.
            </div>
          )}
        </div>
      </div>

      {/* Current Selection List */}
      <div className="bg-white rounded-xl border border-border p-6 min-h-[300px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">
            Produits sélectionnés ({heroProducts.length})
          </h2>
          <p className="text-xs text-text-secondary">
            L'ordre ici est l'ordre d'affichage sur la page d'accueil.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : heroProducts.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
            <ImageIcon size={48} className="mx-auto text-text-secondary/30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary">Aucun produit</h3>
            <p className="text-text-secondary">Utilisez la barre de recherche ci-dessus pour ajouter des produits.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {heroProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="flex items-center gap-4 p-3 bg-white border border-border rounded-xl hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                
                <div className="relative w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-border/50">
                  {product.image_url && (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{product.name}</p>
                  <p className="text-xs text-text-secondary truncate">/{product.slug}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2 hover:bg-muted rounded-lg text-text-secondary disabled:opacity-30 transition-colors"
                    title="Monter"
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === heroProducts.length - 1}
                    className="p-2 hover:bg-muted rounded-lg text-text-secondary disabled:opacity-30 transition-colors"
                    title="Descendre"
                  >
                    <ArrowDown size={18} />
                  </button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Retirer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}