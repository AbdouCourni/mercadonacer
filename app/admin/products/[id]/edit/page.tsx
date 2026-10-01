// File: app/(admin)/admin/products/[id]/edit/page.tsx
// Path: /app/(admin)/admin/products/[id]/edit/page.tsx
// Description: Edit product with promotion, delete, and Cloudinary cleanup

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Save, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MultiImageUpload } from '@/components/dashboard/multi-image-upload'

// ============================================
// TYPES
// ============================================

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

// ✅ Local form state — all inputs hold strings
interface ProductFormState {
  id: string
  name: string
  description: string
  slug: string

  price: string
  achat_price: string
  compare_price: string

  stock: string
  unit: string
  weight: string

  category_id: string
  brand: string

  barcode: string
  sku: string

  is_active: boolean
  is_featured: boolean

  // Promotion
  is_in_promotion: boolean
  promotion_price: string
  promotion_start: string
  promotion_end: string
}

// ============================================
// COMPONENT
// ============================================

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const searchParams = useSearchParams()
  const fromPage = searchParams.get('fromPage') || '1'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [error, setError] = useState<string | null>(null)
  

  const [formData, setFormData] = useState<ProductFormState>({
    id: '',
    name: '',
    description: '',
    slug: '',
    price: '',
    achat_price: '',
    compare_price: '',
    stock: '',
    unit: '',
    weight: '',
    category_id: '',
    brand: '',
    barcode: '',
    sku: '',
    is_active: true,
    is_featured: false,
    is_in_promotion: false,
    promotion_price: '',
    promotion_start: '',
    promotion_end: '',
  })

  // ============================================
  // HELPERS
  // ============================================

  const extractPublicId = (url: string): string | null => {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  const deleteImageFromCloudinary = async (publicId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error)
      return false
    }
  }

  const deleteProductImages = async (imageUrls: string[]) => {
    const deletePromises = imageUrls
      .map(extractPublicId)
      .filter((id): id is string => id !== null)
      .map((publicId) => deleteImageFromCloudinary(publicId))

    await Promise.all(deletePromises)
  }

  // Convert datetime-local value "2026-10-01T14:30" to ISO string
  const toISOString = (localDatetime: string): string | null => {
    if (!localDatetime) return null
    try {
      return new Date(localDatetime).toISOString()
    } catch {
      return null
    }
  }

  // Convert ISO string to datetime-local value
  const toLocalDatetime = (isoString: string | null): string => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      // Format: YYYY-MM-DDTHH:mm
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch {
      return ''
    }
  }

  // ============================================
  // FETCH PRODUCT + CATEGORIES
  // ============================================

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setError('No product ID provided')
        setLoading(false)
        return
      }

      try {
        // Fetch categories
        const categoriesRes = await fetch('/api/categories')
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])

        // Fetch product (include inactive so admin can edit)
        const productRes = await fetch(`/api/products?id=${productId}&includeInactive=true`)

        if (!productRes.ok) {
          throw new Error(`Failed to fetch product: ${productRes.status}`)
        }

        const product = await productRes.json()

        console.log('🔍 [EditPage] Product response:', product)
console.log('🔍 [EditPage] Keys:', Object.keys(product))
console.log('🔍 [EditPage] name:', product.name)
console.log('🔍 [EditPage] price:', product.price)
console.log('🔍 [EditPage] images:', product.images)

        // ✅ Convert DB shape → form shape (everything as strings for inputs)
        setFormData({
          id: product.id || '',
          name: product.name || '',
          description: product.description || '',
          slug: product.slug || '',
          price: product.price !== null && product.price !== undefined ? String(product.price) : '',
          achat_price: product.achat_price !== null && product.achat_price !== undefined
            ? String(product.achat_price)
            : '',
          compare_price: product.compare_price !== null && product.compare_price !== undefined
            ? String(product.compare_price)
            : '',
          stock: product.stock !== null && product.stock !== undefined ? String(product.stock) : '0',
          unit: product.unit || '',
          weight: product.weight !== null && product.weight !== undefined
            ? String(product.weight)
            : '',
          category_id: product.category_id || '',
          brand: product.brand || '',
          barcode: product.barcode || '',
          sku: product.sku || '',
          is_active: product.is_active ?? true,
          is_featured: product.is_featured ?? false,
          is_in_promotion: product.is_in_promotion ?? false,
          promotion_price:
            product.promotion_price !== null && product.promotion_price !== undefined
              ? String(product.promotion_price)
              : '',
          promotion_start: toLocalDatetime(product.promotion_start),
          promotion_end: toLocalDatetime(product.promotion_end),
        })

        // Load images
        if (product.images && product.images.length > 0) {
          const formattedImages = product.images.map((url: string, index: number) => ({
            id: crypto.randomUUID(),
            url,
            publicId: extractPublicId(url) || '',
            isPrimary: index === 0,
          }))
          setImages(formattedImages)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load product data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // ✅ Validation with parsed numbers
    const priceNum = parseFloat(formData.price)
    const stockNum = parseInt(formData.stock, 10)
    const promoPriceNum = formData.promotion_price ? parseFloat(formData.promotion_price) : null

    if (!formData.name.trim()) {
      setError('Le nom du produit est requis')
      return
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Le prix doit être supérieur à 0')
      return
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setError('Le stock doit être un nombre valide')
      return
    }

    // Promotion validation
    if (formData.is_in_promotion) {
      if (promoPriceNum === null || promoPriceNum <= 0) {
        setError('Le prix promotionnel est requis quand la promotion est active')
        return
      }
      if (promoPriceNum >= priceNum) {
        setError('Le prix promotionnel doit être inférieur au prix normal')
        return
      }
    }

    setSaving(true)

    try {
      // Build slug from name
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')

      // Sort images so primary is first, then send URLs only
      const sortedImages = [...images].sort((a, b) => {
        if (a.isPrimary) return -1
        if (b.isPrimary) return 1
        return 0
      })

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        slug,
        price: priceNum,
        achat_price: formData.achat_price ? parseFloat(formData.achat_price) : null,
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        stock: stockNum,
        unit: formData.unit.trim() || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        category_id: formData.category_id || null,
        brand: formData.brand.trim() || null,
        barcode: formData.barcode.trim() || null,
        sku: formData.sku.trim() || null,
        images: sortedImages.map((img) => img.url), // ✅ Send URLs only
        is_active: formData.is_active,
        is_featured: formData.is_featured,

        // Promotion
        is_in_promotion: formData.is_in_promotion,
        promotion_price: formData.is_in_promotion ? promoPriceNum : null,
        promotion_start: formData.is_in_promotion
          ? toISOString(formData.promotion_start)
          : null,
        promotion_end: formData.is_in_promotion
          ? toISOString(formData.promotion_end)
          : null,
      }

      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      // Return to previous page
      router.push(
        parseInt(fromPage) > 1
          ? `/admin/products?page=${fromPage}`
          : '/admin/products'
      )
    } catch (error) {
      console.error('Error updating product:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  // ============================================
  // DELETE
  // ============================================

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${formData.name}" ?`)) return

    setDeleting(true)
    setError(null)

    try {
      // Delete images from Cloudinary first
      if (images.length > 0) {
        await deleteProductImages(images.map((img) => img.url))
      }

      // Delete product from DB
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete product')
      }

      router.push(
        parseInt(fromPage) > 1
          ? `/admin/products?page=${fromPage}`
          : '/admin/products'
      )
    } catch (error) {
      console.error('Error deleting product:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete product')
      setDeleting(false)
    }
  }

  // ============================================
  // RENDER
  // ============================================

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

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
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
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Stock *
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

            {/* 🔥 Promotion */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-text-primary flex items-center gap-2">
                <Tag size={18} className="text-red-500" />
                Promotion
              </h2>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_in_promotion}
                  onChange={(e) =>
                    setFormData({ ...formData, is_in_promotion: e.target.checked })
                  }
                  className="rounded border-border"
                />
                <span className="text-sm font-medium">Activer la promotion</span>
              </label>

              {formData.is_in_promotion && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Prix promotionnel (DH) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.promotion_price}
                      onChange={(e) =>
                        setFormData({ ...formData, promotion_price: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="0.00"
                    />
                    {formData.price && formData.promotion_price && (
                      <p className="text-xs text-green-600 mt-1">
                        Réduction:{' '}
                        {Math.round(
                          ((parseFloat(formData.price) - parseFloat(formData.promotion_price)) /
                            parseFloat(formData.price)) *
                            100
                        )}
                        %
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Début
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.promotion_start}
                        onChange={(e) =>
                          setFormData({ ...formData, promotion_start: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Fin
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.promotion_end}
                        onChange={(e) =>
                          setFormData({ ...formData, promotion_end: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary">
                    Laissez les dates vides pour une promotion permanente.
                  </p>
                </>
              )}
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
              <MultiImageUpload images={images} onChange={setImages} maxImages={5} />
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
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                  className="rounded border-border"
                />
                <span className="text-sm">Produit en vedette</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
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