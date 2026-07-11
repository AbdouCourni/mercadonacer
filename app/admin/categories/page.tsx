// File: app/(dashboard)/dashboard/categories/page.tsx
// Path: /app/(dashboard)/dashboard/categories/page.tsx
// Description: Categories management page with image upload

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
  Loader2,
  FolderOpen,
  X,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SingleImageUpload } from '@/components/dashboard/single-image-upload'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  created_at: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image_url: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Category | null>(null)

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dashboard/categories')
      
      if (!response.ok) {
        const error = await response.json()
        console.error('API Error:', error)
        throw new Error(error.error || 'Failed to fetch categories')
      }
      
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
  if (!id || id === 'undefined') {
    console.error('❌ Invalid category ID:', id)
    alert('Invalid category ID')
    return
  }

  if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?`)) return

  setDeleting(id)
  try {
    console.log('🗑️ Deleting category:', { id, name })
    
   const response = await fetch(`/api/dashboard/categories?id=${id}`, {
  method: 'DELETE'
})

    if (response.ok) {
      setCategories(categories.filter(c => c.id !== id))
      router.refresh()
    } else {
      const error = await response.json()
      alert(error.error || 'Failed to delete category')
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    alert('Failed to delete category')
  } finally {
    setDeleting(null)
  }
}

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) {
      alert('Le nom de la catégorie est requis')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/dashboard/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          image_url: newCategory.image_url || null
        })
      })

      if (response.ok) {
        setNewCategory({ name: '', description: '', image_url: '' })
        setShowAddForm(false)
        await fetchCategories()
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Failed to create category')
    } finally {
      setSubmitting(false)
    }
  }

  // Start editing
  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditData(category)
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setEditData(null)
  }

  // Handle edit save
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editData || !editData.name.trim()) {
      alert('Le nom de la catégorie est requis')
      return
    }

    setSubmitting(true)
    try {
    const response = await fetch(`/api/dashboard/categories?id=${editData.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: editData.id,
    name: editData.name,
    description: editData.description,
    image_url: editData.image_url || null
  })
})

      if (response.ok) {
        await fetchCategories()
        cancelEdit()
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Failed to update category')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter categories
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Catégories</h1>
          <p className="text-text-secondary text-sm">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Plus size={18} className="mr-2" />
          Ajouter une catégorie
        </Button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-border p-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">Nouvelle catégorie</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Nom de la catégorie *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ex: Fruits et Légumes"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Description de la catégorie..."
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Image de la catégorie
                </label>
                <SingleImageUpload
                  value={newCategory.image_url || null}
                  onChange={(url) => setNewCategory({ ...newCategory, image_url: url || '' })}
                  label="Catégorie"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Check size={16} className="mr-2" />
                )}
                {submitting ? 'Création...' : 'Créer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <FolderOpen size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <h3 className="text-lg font-medium text-text-primary">
            {search ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}
          </h3>
          <p className="text-text-secondary">
            {search ? 'Essayez une autre recherche' : 'Commencez par ajouter votre première catégorie'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              {category.image_url && (
                <div className="relative h-40 bg-muted">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                {editingId === category.id ? (
                  // Edit form
                  <form onSubmit={handleEditSave} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={editData?.name || ''}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={editData?.description || ''}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Image
                      </label>
                      <SingleImageUpload
                        value={editData?.image_url || null}
                        onChange={(url) => setEditData(prev => prev ? { ...prev, image_url: url } : null)}
                        label="Catégorie"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        size="sm"
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        {submitting ? (
                          <Loader2 size={14} className="animate-spin mr-1" />
                        ) : (
                          <Check size={14} className="mr-1" />
                        )}
                        {submitting ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        disabled={submitting}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">📂</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-text-primary truncate">
                              {category.name}
                            </h3>
                            <p className="text-xs text-text-secondary">slug: {category.slug}</p>
                          </div>
                        </div>
                        {category.description && (
                          <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          disabled={deleting === category.id}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deleting === category.id ? (
                            <Loader2 size={16} className="animate-spin text-red-600" />
                          ) : (
                            <Trash2 size={16} className="text-red-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}