// File: app/(admin)/admin/products/[slug]/edit/page.tsx
// Path: /app/(admin)/admin/products/[slug]/edit/page.tsx
// Description: Edit product with delete and Cloudinary image cleanup

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'
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

interface Product {
  id: string
  name: string
  description: string
  slug: string
  price: number
  achat_price: number
  compare_price: number | null
  stock: number
  category_id: string | null
  brand: string | null
  barcode: string | null
  sku: string | null
  unit: string | null
  weight: number | null
  images: string[]
  is_active: boolean
  is_featured: boolean
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.slug as string

  console.log('📝 [EditProductPage] Full params:', params)
  console.log('📝 [EditProductPage] Product ID from params:', productId)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    description: '',
    slug: '',
    price: 0,
    achat_price: 0,
    compare_price: null,
    stock: 0,
    category_id: null,
    brand: null,
    barcode: null,
    sku: null,
    unit: null,
    weight: null,
    images: [],
    is_active: true,
    is_featured: false
  })

  // Extract publicId from Cloudinary URL
  const extractPublicId = (url: string): string | null => {
    try {
      // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.jpg
      const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  // Delete image from Cloudinary
  const deleteImageFromCloudinary = async (publicId: string) => {
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      })

      if (!response.ok) {
        console.error('Failed to delete image from Cloudinary:', publicId)
      }
      return response.ok
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error)
      return false
    }
  }

  // Delete all product images from Cloudinary
  const deleteProductImages = async (imageUrls: string[]) => {
    const deletePromises = imageUrls
      .map(extractPublicId)
      .filter((id): id is string => id !== null)
      .map(publicId => deleteImageFromCloudinary(publicId))

    await Promise.all(deletePromises)
  }

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        console.error('❌ No product ID provided - params:', params)
        setError('No product ID provided')
        setLoading(false)
        return
      }

      try {
        // Fetch categories
        console.log('📝 [EditProductPage] Fetching categories...')
        const categoriesRes = await fetch('/api/categories')
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])

        // Fetch product
        console.log('📝 [EditProductPage] Fetching product with ID:', productId)
        const productRes = await fetch(`/api/products?id=${productId}`)
        
        if (!productRes.ok) {
          console.error('❌ Failed to fetch product, status:', productRes.status)
          throw new Error(`Failed to fetch product: ${productRes.status}`)
        }

        const productData = await productRes.json()
        console.log('✅ Product data received:', productData.name)
        setFormData(productData)
        
        // Convert images to ProductImage format
        if (productData.images && productData.images.length > 0) {
          const formattedImages = productData.images.map((url: string, index: number) => ({
            id: crypto.randomUUID(),
            url: url,
            publicId: extractPublicId(url) || '',
            isPrimary: index === 0
          }))
          setImages(formattedImages)
          console.log('✅ Images loaded:', formattedImages.length)
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load product data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    if (!formData.name.trim()) {
      setError('Le nom du produit est requis')
      setSaving(false)
      return
    }

    if (formData.price <= 0) {
      setError('Le prix doit être supérieur à 0')
      setSaving(false)
      return
    }

    if (formData.stock < 0) {
      setError('Le stock doit être un nombre valide')
      setSaving(false)
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
  price: formData.price,
  compare_price: formData.compare_price,
  stock: formData.stock,
  category_id: formData.category_id || null,
  brand: formData.brand?.trim() || null,
  barcode: formData.barcode?.trim() || null,
  sku: formData.sku?.trim() || null,
  unit: formData.unit?.trim() || null,
  weight: formData.weight || null,
  // Send the full image objects with isPrimary flag
  images: images,  // ← Send full objects, not just URLs
  is_active: formData.is_active,
  is_featured: formData.is_featured
}

      console.log('📝 [EditProductPage] Updating product with ID:', productId)
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      router.push('/admin/products')
    } catch (error) {
      console.error('Error updating product:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  // Handle delete with Cloudinary cleanup
  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${formData.name}" ?`)) return

    setDeleting(true)
    setError(null)

    try {
      // 1. Delete product images from Cloudinary
      if (images.length > 0) {
        console.log('🗑️ Deleting images from Cloudinary...')
        await deleteProductImages(images.map(img => img.url))
        console.log('✅ Images deleted from Cloudinary')
      }

      // 2. Delete product from database
      console.log('🗑️ Deleting product from database...')
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete product')
      }

      console.log('✅ Product deleted successfully')
      router.push('/admin/products')
    } catch (error) {
      console.error('❌ Error deleting product:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete product')
      setDeleting(false)
    }
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Modifier le produit</h1>
            <p className="text-text-secondary text-sm">{formData.name}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2"
        >
          {deleting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Suppression...
            </>
          ) : (
            <>
              <Trash2 size={18} />
              Supprimer
            </>
          )}
        </Button>
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
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
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
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
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value || null })}
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
      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value)  })}
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
      onChange={(e) => setFormData({ ...formData, achat_price: parseFloat(e.target.value) })} 
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
      value={formData.compare_price ?? ''}
      onChange={(e) => setFormData({ ...formData, compare_price: e.target.value === '' ? null : parseFloat(e.target.value) })}
      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
      placeholder="0.00"
    />
  </div>
</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Unité
                  </label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value || null })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="kg, L, pièce..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : null })}
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
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value || null })}
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
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value || null })}
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
            disabled={saving || deleting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={saving || deleting}
            className="bg-primary text-white hover:bg-primary/90 min-w-[150px]"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}