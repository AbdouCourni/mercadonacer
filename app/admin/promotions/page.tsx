// File: app/(dashboard)/dashboard/promotions/page.tsx
// Path: /app/(dashboard)/dashboard/promotions/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Plus, Loader2, Trash2, Save, Search, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PromoProduct {
  id: string
  name: string
  slug: string
  image_url: string | null
  price: number
  promotion_price: string | number // Using string for the input field
}

export default function PromotionsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<PromoProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchPromos = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?promo=true')
      const data = await res.json()
      setProducts((data.products || []).map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug, image_url: p.images?.[0] || null,
        price: p.price, promotion_price: p.promotion_price || ''
      })))
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  useEffect(() => { fetchPromos() }, [])

  useEffect(() => {
    const delayFn = setTimeout(async () => {
      if (searchQuery.length < 2) { setSearchResults([]); return }
      setIsSearching(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          const existingIds = products.map(p => p.id)
          setSearchResults((data.products || []).filter((p: any) => !existingIds.includes(p.id)))
        }
      } finally { setIsSearching(false) }
    }, 400)
    return () => clearTimeout(delayFn)
  }, [searchQuery, products])

  const addProduct = (p: any) => {
    setProducts([...products, {
      id: p.id, name: p.name, slug: p.slug, image_url: p.images?.[0] || null,
      price: p.price, promotion_price: '' // Start empty for admin to fill
    }])
    setSearchQuery(''); setSearchResults([])
  }

  const removeProduct = (id: string) => setProducts(products.filter(p => p.id !== id))

  const updatePromoPrice = (id: string, val: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, promotion_price: val } : p))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const promises = products.map(p => fetch(`/api/products?id=${p.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_in_promotion: true,
          promotion_price: p.promotion_price ? parseFloat(p.promotion_price as string) : null
        })
      }))
      await Promise.all(promises)
      router.refresh()
      alert('Promotions sauvegardées !')
    } catch (error) { alert('Erreur') } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="text-red-500" /> Gestion des Promotions
          </h1>
          <p className="text-text-secondary text-sm">Sélectionnez les produits à mettre en promotion.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-primary text-white">
          {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
          Sauvegarder
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border relative">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Search size={18} /> Ajouter à la promotion</h2>
        <input
          type="text" placeholder="Rechercher un produit..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50"
        />
        {isSearching && <Loader2 className="absolute right-10 top-20 animate-spin text-primary" size={20} />}
        {searchResults.length > 0 && searchQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border shadow-xl max-h-80 overflow-y-auto z-50">
            {searchResults.map(p => (
              <button key={p.id} onClick={() => addProduct(p)} className="w-full flex items-center gap-4 p-3 hover:bg-muted text-left border-b last:border-0">
                <div className="w-12 h-12 relative bg-gray-100 rounded"><Image src={p.images?.[0] || ''} alt="" fill className="object-cover" unoptimized /></div>
                <div className="flex-1"><div className="font-medium">{p.name}</div><div className="text-sm text-gray-500">{p.price} DH</div></div>
                <Plus size={18} className="text-primary" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border min-h-[300px]">
        <h2 className="font-semibold mb-4">Produits en promotion ({products.length})</h2>
        {loading ? <Loader2 className="animate-spin mx-auto my-10" /> : products.length === 0 ? (
          <p className="text-center text-text-secondary py-10">Aucun produit sélectionné.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-4 p-3 border rounded-xl hover:shadow-sm">
                <div className="w-14 h-14 relative bg-gray-100 rounded-lg"><Image src={p.image_url || ''} alt="" fill className="object-cover" unoptimized /></div>
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">Prix normal: {p.price} DH</div>
                </div>
                <div>
                   <label className="text-xs font-semibold text-red-500 block mb-1">Prix Promo (DH)</label>
                   <input 
                     type="number" 
                     value={p.promotion_price}
                     onChange={(e) => updatePromoPrice(p.id, e.target.value)}
                     className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 font-bold text-red-600"
                     placeholder="Ex: 19.99"
                   />
                </div>
                <button onClick={() => removeProduct(p.id)} className="p-2 hover:bg-red-50 text-red-600 rounded"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}