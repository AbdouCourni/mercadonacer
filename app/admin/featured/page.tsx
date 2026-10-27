// File: app/(dashboard)/dashboard/featured/page.tsx
// Path: /app/(dashboard)/dashboard/featured/page.tsx
// Description: Manage Featured Products for the homepage

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Plus, Loader2, ArrowUp, ArrowDown, Trash2, Save, Search, ImageIcon, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeaturedProduct {
  id: string
  name: string
  slug: string
  image_url: string | null
}

export default function FeaturedPage() {
  const router = useRouter()
  const [products, setProducts] = useState<FeaturedProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FeaturedProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch current featured products
  const fetchFeatured = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?featured=true')
      const data = await res.json()
      setProducts((data.products || []).map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug, image_url: p.images?.[0] || null
      })))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFeatured() }, [])

  // Search logic
  useEffect(() => {
    const delayFn = setTimeout(async () => {
      if (searchQuery.length < 2) { setSearchResults([]); return }
      setIsSearching(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          const existingIds = products.map(p => p.id)
          setSearchResults((data.products || [])
            .filter((p: any) => !existingIds.includes(p.id))
            .map((p: any) => ({ id: p.id, name: p.name, slug: p.slug, image_url: p.images?.[0] || null })))
        }
      } finally { setIsSearching(false) }
    }, 400)
    return () => clearTimeout(delayFn)
  }, [searchQuery, products])

  const addProduct = (product: FeaturedProduct) => {
    setProducts([...products, product])
    setSearchQuery(''); setSearchResults([])
  }

  const removeProduct = (id: string) => setProducts(products.filter(p => p.id !== id))

  const moveUp = (idx: number) => {
    if (idx === 0) return
    const newP = [...products]; [newP[idx - 1], newP[idx]] = [newP[idx], newP[idx - 1]]; setProducts(newP)
  }

  const moveDown = (idx: number) => {
    if (idx === products.length - 1) return
    const newP = [...products]; [newP[idx], newP[idx + 1]] = [newP[idx + 1], newP[idx]]; setProducts(newP)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Set current list to featured
      const addPromises = products.map(p => fetch(`/api/products?id=${p.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: true })
      }))
      
      // (Optional: fetch DB to find removed ones and set is_featured: false)
      
      await Promise.all(addPromises)
      router.refresh()
      alert('Produits en vedette sauvegardés !')
    } catch (error) {
      alert('Erreur de sauvegarde')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="text-amber-500 fill-amber-500" /> Produits en vedette
          </h1>
          <p className="text-text-secondary text-sm">Gérez les produits affichés dans la section "Nouveaux Produits" de l'accueil.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-primary text-white">
          {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
          Sauvegarder
        </Button>
      </div>

      {/* Search Box */}
      <div className="bg-white p-6 rounded-xl border border-border relative">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Search size={18} /> Ajouter des produits</h2>
        <input
          type="text" placeholder="Rechercher un produit..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/50"
        />
        {isSearching && <Loader2 className="absolute right-10 top-20 animate-spin text-primary" size={20} />}
        
        {searchResults.length > 0 && searchQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border shadow-xl max-h-80 overflow-y-auto z-50">
            {searchResults.map(p => (
              <button key={p.id} onClick={() => addProduct(p)} className="w-full flex items-center gap-4 p-3 hover:bg-muted text-left border-b last:border-0">
                <div className="w-12 h-12 relative bg-gray-100 rounded"><Image src={p.image_url || ''} alt="" fill className="object-cover" unoptimized /></div>
                <span className="flex-1 font-medium">{p.name}</span>
                <Plus size={18} className="text-primary" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white p-6 rounded-xl border min-h-[300px]">
        <h2 className="font-semibold mb-4">Sélection ({products.length})</h2>
        {loading ? <Loader2 className="animate-spin mx-auto my-10" /> : products.length === 0 ? (
          <p className="text-center text-text-secondary py-10">Aucun produit sélectionné.</p>
        ) : (
          <div className="space-y-2">
            {products.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-4 p-3 border rounded-xl hover:shadow-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{idx + 1}</div>
                <div className="w-14 h-14 relative bg-gray-100 rounded-lg"><Image src={p.image_url || ''} alt="" fill className="object-cover" unoptimized /></div>
                <div className="flex-1 font-medium">{p.name}</div>
                <div className="flex gap-1">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-2 hover:bg-muted rounded disabled:opacity-30"><ArrowUp size={18} /></button>
                  <button onClick={() => moveDown(idx)} disabled={idx === products.length - 1} className="p-2 hover:bg-muted rounded disabled:opacity-30"><ArrowDown size={18} /></button>
                  <button onClick={() => removeProduct(p.id)} className="p-2 hover:bg-red-50 text-red-600 rounded"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}