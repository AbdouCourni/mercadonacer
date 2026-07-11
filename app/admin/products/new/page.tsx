// File: app/(dashboard)/dashboard/products/new/page.tsx
// Path: /app/(dashboard)/dashboard/products/new/page.tsx
// Description: Create new product with proper submit button

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MultiImageUpload } from '@/components/dashboard/multi-image-upload'

interface ProductImage {
  id: string
  url: string
  publicId: string
  isPrimary: boolean
}

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    achat_price: '',
    stock: '',
    category_id: '',
    brand: '',
    barcode: '',
    sku: '',
    unit: '',
    weight: '',
    is_active: true,
    is_featured: false
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Le nom du produit est requis')
      setLoading(false)
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Le prix est requis et doit être supérieur à 0')
      setLoading(false)
      return
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Le stock est requis et doit être un nombre valide')
      setLoading(false)
      return
    }

    try {
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        slug: slug,
        price: parseFloat(formData.price),
        achat_price: parseFloat(formData.achat_price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        stock: parseInt(formData.stock),
        category_id: formData.category_id || null,
        brand: formData.brand?.trim() || null,
        barcode: formData.barcode?.trim() || null,
        sku: formData.sku?.trim() || null,
        unit: formData.unit?.trim() || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        images: images.map(img => img.url),
        is_active: formData.is_active,
        is_featured: formData.is_featured
      }

      console.log('Sending product data:', productData)

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Server error:', result)
        throw new Error(result.error || 'Erreur lors de la création du produit')
      }

      router.push('/admin/products')
    } catch (error) {
      console.error('Error creating product:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la création du produit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Nouveau produit</h1>
            <p className="text-text-secondary text-sm">Ajoutez un nouveau produit à votre catalogue</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-text-primary">Informations générales</h2>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  placeholder="Ex: Tomates Fraîches"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Description détaillée du produit..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Nom de la marque"
                  />
                </div>
              </div>
            </div>

          {/* Pricing & Stock */}
<div className="bg-white rounded-xl border border-border p-6 space-y-4">
  <h2 className="font-semibold text-text-primary">Prix et stock</h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">
        Prix de vente (DH) *
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        required
        placeholder="0.00"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">
        Prix d'achat (DH)
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={formData.achat_price}
        onChange={(e) => setFormData({ ...formData, achat_price: e.target.value })}
        className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder="0.00"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">
        Prix comparatif
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={formData.compare_price}
        onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
        className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder="0.00"
      />
    </div>
  </div>

  {/* 🔥 ADD STOCK FIELD */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">
        Stock * (quantité disponible)
      </label>
      <input
        type="number"
        min="0"
        value={formData.stock}
        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
        className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        required
        placeholder="0"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">
        Unité
      </label>
      <input
        type="text"
        value={formData.unit}
        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder="kg, L, pièce..."
      />
    </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">
        Poids (kg)
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={formData.weight}
        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
        className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder="0.00"
      />
    </div>
  </div>
</div>

            {/* Codes */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-text-primary">Codes et références</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Code-barres (EAN)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="611110000001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="FRUIT-TOM-001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-text-primary">Images</h2>
              <MultiImageUpload
                images={images}
                onChange={setImages}
                maxImages={5}
              />
              <p className="text-xs text-text-secondary">
                Recommandé: 800x800px, format JPG ou PNG. Max 5 images.
              </p>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-text-primary">Statut</h2>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Produit actif</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Produit en vedette</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button - Bottom */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-white hover:bg-primary/90 min-w-[150px]"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Création...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Créer le produit
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}