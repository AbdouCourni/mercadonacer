// File: app/(dashboard)/dashboard/categories/page.tsx
// Path: /app/(dashboard)/dashboard/categories/page.tsx
// Description: Categories management with reorder + home display control

'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Check,
  Home,
  ArrowUp,
  ArrowDown,
  Save,
  EyeOff,
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
  display_order: number | null
  display_in_home: boolean
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
    image_url: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Category | null>(null)

  // 🆕 Reorder mode
  const [reorderMode, setReorderMode] = useState(false)
  const [draftOrder, setDraftOrder] = useState<Record<string, { display_order: number; display_in_home: boolean }>>({})
  const [savingOrder, setSavingOrder] = useState(false)

  // ============================================
  // FETCH
  // ============================================
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dashboard/categories')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch categories')
      }
      const data = await response.json()

      // Sort by display_order, then name
      const sorted = (data.categories || []).sort((a: Category, b: Category) => {
        const aOrder = a.display_order ?? 999
        const bOrder = b.display_order ?? 999
        if (aOrder !== bOrder) return aOrder - bOrder
        return a.name.localeCompare(b.name)
      })

      setCategories(sorted)
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

  // ============================================
  // REORDER HANDLERS
  // ============================================
  const startReorderMode = () => {
    const draft: Record<string, { display_order: number; display_in_home: boolean }> = {}
    categories.forEach((cat, idx) => {
      draft[cat.id] = {
        display_order: cat.display_order ?? idx + 1,
        display_in_home: cat.display_in_home ?? false,
      }
    })
    setDraftOrder(draft)
    setReorderMode(true)
  }

  const cancelReorder = () => {
    setDraftOrder({})
    setReorderMode(false)
  }

  const moveUp = (id: string) => {
    const sorted = [...categories].sort((a, b) => {
      const aOrder = draftOrder[a.id]?.display_order ?? a.display_order ?? 999
      const bOrder = draftOrder[b.id]?.display_order ?? b.display_order ?? 999
      return aOrder - bOrder
    })
    const idx = sorted.findIndex((c) => c.id === id)
    if (idx <= 0) return

    // Swap display_order values
    const prevId = sorted[idx - 1].id
    const currOrder = draftOrder[id]?.display_order ?? 0
    const prevOrder = draftOrder[prevId]?.display_order ?? 0

    setDraftOrder({
      ...draftOrder,
      [id]: { ...draftOrder[id], display_order: prevOrder },
      [prevId]: { ...draftOrder[prevId], display_order: currOrder },
    })
  }

  const moveDown = (id: string) => {
    const sorted = [...categories].sort((a, b) => {
      const aOrder = draftOrder[a.id]?.display_order ?? a.display_order ?? 999
      const bOrder = draftOrder[b.id]?.display_order ?? b.display_order ?? 999
      return aOrder - bOrder
    })
    const idx = sorted.findIndex((c) => c.id === id)
    if (idx < 0 || idx >= sorted.length - 1) return

    const nextId = sorted[idx + 1].id
    const currOrder = draftOrder[id]?.display_order ?? 0
    const nextOrder = draftOrder[nextId]?.display_order ?? 0

    setDraftOrder({
      ...draftOrder,
      [id]: { ...draftOrder[id], display_order: nextOrder },
      [nextId]: { ...draftOrder[nextId], display_order: currOrder },
    })
  }

  const toggleHomeDisplay = (id: string) => {
    setDraftOrder({
      ...draftOrder,
      [id]: {
        ...draftOrder[id],
        display_in_home: !draftOrder[id]?.display_in_home,
      },
    })
  }

  const updateOrderInput = (id: string, value: number) => {
    setDraftOrder({
      ...draftOrder,
      [id]: { ...draftOrder[id], display_order: value },
    })
  }

  const saveReorder = async () => {
    setSavingOrder(true)
    try {
      const updates = Object.entries(draftOrder).map(([id, data]) => ({
        id,
        display_order: data.display_order,
        display_in_home: data.display_in_home,
      }))

      const response = await fetch('/api/dashboard/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      await fetchCategories()
      setReorderMode(false)
      setDraftOrder({})
      router.refresh()
    } catch (error) {
      console.error('Save reorder error:', error)
      alert(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setSavingOrder(false)
    }
  }

  // ============================================
  // CRUD HANDLERS
  // ============================================
  const handleDelete = async (id: string, name: string) => {
    if (!id || id === 'undefined') {
      alert('Invalid category ID')
      return
    }
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?`)) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/dashboard/categories?id=${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setCategories(categories.filter((c) => c.id !== id))
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
          image_url: newCategory.image_url || null,
        }),
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

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditData(category)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData(null)
  }

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
          image_url: editData.image_url || null,
        }),
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

  // ============================================
  // FILTER
  // ============================================
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  )

  const sortedForReorder = useMemo(() => {
    if (!reorderMode) return filteredCategories
    return [...filteredCategories].sort((a, b) => {
      const aOrder = draftOrder[a.id]?.display_order ?? a.display_order ?? 999
      const bOrder = draftOrder[b.id]?.display_order ?? b.display_order ?? 999
      return aOrder - bOrder
    })
  }, [reorderMode, filteredCategories, draftOrder])

  const homeCount = useMemo(() => {
    if (reorderMode) {
      return Object.values(draftOrder).filter((d) => d.display_in_home).length
    }
    return categories.filter((c) => c.display_in_home).length
  }, [reorderMode, draftOrder, categories])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Catégories</h1>
          <p className="text-text-secondary text-sm">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''} ·{' '}
            <span className="text-primary font-medium">{homeCount} sur la page d'accueil</span>
          </p>
        </div>
        <div className="flex gap-2">
          {reorderMode ? (
            <>
              <Button
                variant="outline"
                onClick={cancelReorder}
                disabled={savingOrder}
              >
                Annuler
              </Button>
              <Button
                onClick={saveReorder}
                disabled={savingOrder}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {savingOrder ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {savingOrder ? 'Enregistrement...' : 'Sauvegarder'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={startReorderMode}
                className="flex items-center gap-2"
              >
                <Home size={16} />
                Réorganiser pour l'accueil
              </Button>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Plus size={18} className="mr-2" />
                Ajouter
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Reorder Mode Banner */}
      {reorderMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Home size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Mode réorganisation</p>
            <p>
              Utilisez les flèches ↑ ↓ pour changer l'ordre, cochez 🏠 pour afficher sur la page d'accueil.
              Seules les catégories avec 🏠 coché apparaîtront sur l'accueil.
            </p>
          </div>
        </div>
      )}

      {/* Add Category Form */}
      {showAddForm && !reorderMode && (
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
              <Button type="submit" disabled={submitting} className="bg-primary text-white">
                {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
                {submitting ? 'Création...' : 'Créer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
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

      {/* Categories List */}
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
        </div>
      ) : reorderMode ? (
        // ============================================
        // REORDER MODE
        // ============================================
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {sortedForReorder.map((category, idx) => {
              const draft = draftOrder[category.id] || {
                display_order: category.display_order ?? idx + 1,
                display_in_home: category.display_in_home ?? false,
              }
              return (
                <div
                  key={category.id}
                  className={cn(
                    'flex items-center gap-3 p-3 transition-colors',
                    draft.display_in_home && 'bg-green-50/50'
                  )}
                >
                  {/* Order Number Input */}
                  <input
                    type="number"
                    min={1}
                    value={draft.display_order}
                    onChange={(e) => updateOrderInput(category.id, parseInt(e.target.value, 10) || 0)}
                    className="w-16 px-2 py-1 text-center rounded border border-border text-sm"
                  />

                  {/* Up/Down Arrows */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveUp(category.id)}
                      disabled={idx === 0}
                      className="p-1 hover:bg-muted rounded disabled:opacity-30"
                      title="Monter"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveDown(category.id)}
                      disabled={idx === sortedForReorder.length - 1}
                      className="p-1 hover:bg-muted rounded disabled:opacity-30"
                      title="Descendre"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Image */}
                  {category.image_url ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image src={category.image_url} alt={category.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                      📂
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{category.name}</p>
                    <p className="text-xs text-text-secondary truncate">{category.slug}</p>
                  </div>

                  {/* Home Toggle */}
                  <button
                    onClick={() => toggleHomeDisplay(category.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium',
                      draft.display_in_home
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-muted text-text-secondary hover:bg-muted/80'
                    )}
                    title={draft.display_in_home ? 'Sur l\'accueil' : 'Masquée de l\'accueil'}
                  >
                    <Home size={14} />
                    {draft.display_in_home ? 'Accueil' : 'Masquée'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        // ============================================
        // VIEW MODE
        // ============================================
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className={cn(
                'bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow relative',
                category.display_in_home ? 'border-green-300' : 'border-border'
              )}
            >
              {/* Home badge */}
              {category.display_in_home && (
                <div className="absolute top-2 right-2 z-10 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
                  <Home size={12} />
                  Accueil
                </div>
              )}

              {category.image_url && (
                <div className="relative h-40 bg-muted">
                  <Image src={category.image_url} alt={category.name} fill className="object-cover" />
                </div>
              )}

              <div className="p-4">
                {editingId === category.id ? (
                  <form onSubmit={handleEditSave} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom *</label>
                      <input
                        type="text"
                        value={editData?.name || ''}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full px-3 py-2 rounded-lg border border-border"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={editData?.description || ''}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="w-full px-3 py-2 rounded-lg border border-border resize-none"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Image</label>
                      <SingleImageUpload
                        value={editData?.image_url || null}
                        onChange={(url) => setEditData(prev => prev ? { ...prev, image_url: url } : null)}
                        label="Catégorie"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={submitting} size="sm" className="bg-primary text-white">
                        {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={14} className="mr-1" />}
                        Enregistrer
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">📂</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-text-primary truncate">{category.name}</h3>
                            <p className="text-xs text-text-secondary">slug: {category.slug}</p>
                            <p className="text-xs text-text-secondary">
                              Ordre: {category.display_order ?? '—'}
                            </p>
                          </div>
                        </div>
                        {category.description && (
                          <p className="text-sm text-text-secondary mt-2 line-clamp-2">{category.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-1.5 hover:bg-muted rounded"
                          title="Modifier"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          disabled={deleting === category.id}
                          className="p-1.5 hover:bg-red-50 rounded disabled:opacity-50"
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