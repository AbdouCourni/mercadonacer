// File: app/(dashboard)/dashboard/hero-slides/page.tsx
// Path: /app/(dashboard)/dashboard/hero-slides/page.tsx
// Description: Manage hero slider slides

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Link as LinkIcon,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SingleImageUpload } from '@/components/dashboard/single-image-upload'

interface HeroSlide {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  cta: string | null
  link: string | null
  image_url: string
  icon: string | null
  alt_text: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface FormState {
  title: string
  subtitle: string
  description: string
  cta: string
  link: string
  image_url: string
  icon: string
  alt_text: string
  display_order: number
  is_active: boolean
}

const EMPTY_FORM: FormState = {
  title: '',
  subtitle: '',
  description: '',
  cta: '',
  link: '',
  image_url: '',
  icon: '',
  alt_text: '',
  display_order: 999,
  is_active: true,
}

export default function HeroSlidesPage() {
  const router = useRouter()
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  // ============================================
  // FETCH
  // ============================================
  const fetchSlides = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/hero-slides?includeInactive=true')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setSlides(
        (data.slides || []).sort(
          (a: HeroSlide, b: HeroSlide) => a.display_order - b.display_order
        )
      )
    } catch (error) {
      console.error('Fetch error:', error)
      alert('Failed to load slides')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  // ============================================
  // FORM HANDLERS
  // ============================================
  const openCreateForm = () => {
    setForm({ ...EMPTY_FORM, display_order: (slides.length || 0) + 1 })
    setEditingId(null)
    setShowForm(true)
  }

  const openEditForm = (slide: HeroSlide) => {
    setForm({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      cta: slide.cta || '',
      link: slide.link || '',
      image_url: slide.image_url,
      icon: slide.icon || '',
      alt_text: slide.alt_text || '',
      display_order: slide.display_order,
      is_active: slide.is_active,
    })
    setEditingId(slide.id)
    setShowForm(true)
  }

  const closeForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim()) {
      alert('Le titre est requis')
      return
    }
    if (!form.image_url.trim()) {
      alert('L\'image est requise')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId
        ? `/api/hero-slides/${editingId}`
        : '/api/hero-slides'
      const method = editingId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      await fetchSlides()
      closeForm()
      router.refresh()
    } catch (error) {
      console.error('Save error:', error)
      alert(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer la slide "${title}" ?`)) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete')
      }
      setSlides(slides.filter((s) => s.id !== id))
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (slide: HeroSlide) => {
    try {
      const response = await fetch(`/api/hero-slides/${slide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !slide.is_active }),
      })
      if (response.ok) {
        setSlides(
          slides.map((s) =>
            s.id === slide.id ? { ...s, is_active: !s.is_active } : s
          )
        )
        router.refresh()
      }
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  const moveSlide = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...slides].sort((a, b) => a.display_order - b.display_order)
    const idx = sorted.findIndex((s) => s.id === id)
    if (idx < 0) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const current = sorted[idx]
    const target = sorted[swapIdx]

    // Swap display_order
    try {
      await Promise.all([
        fetch(`/api/hero-slides/${current.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: target.display_order }),
        }),
        fetch(`/api/hero-slides/${target.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: current.display_order }),
        }),
      ])
      await fetchSlides()
      router.refresh()
    } catch (error) {
      console.error('Move error:', error)
    }
  }

  const sortedSlides = [...slides].sort(
    (a, b) => a.display_order - b.display_order
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Bannière d'accueil
          </h1>
          <p className="text-text-secondary text-sm">
            {slides.length} slide{slides.length > 1 ? 's' : ''} ·{' '}
            {slides.filter((s) => s.is_active).length} active
            {slides.filter((s) => s.is_active).length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={openCreateForm}
          disabled={showForm}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Plus size={18} className="mr-2" />
          Ajouter une slide
        </Button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <ImageIcon size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">À propos des slides</p>
          <p>
            Les slides actives apparaissent dans le carrousel de la page
            d'accueil, dans l'ordre défini. Recommandation : 3 à 5 slides avec
            des images de <strong>1600×900px minimum</strong>.
          </p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">
                {editingId ? 'Modifier la slide' : 'Nouvelle slide'}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className="p-1 hover:bg-muted rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: image */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image *
                </label>
                <SingleImageUpload
                  value={form.image_url || null}
                  onChange={(url) =>
                    setForm({ ...form, image_url: url || '' })
                  }
                  label="Slide"
                />
                <p className="text-xs text-text-secondary mt-2">
                  Recommandé : 1600×900px, format paysage
                </p>
              </div>

              {/* Right: fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ex: Des Produits Frais"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) =>
                      setForm({ ...form, subtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ex: Directement du marché à votre porte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Description courte..."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Texte du bouton
                </label>
                <input
                  type="text"
                  value={form.cta}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border"
                  placeholder="Ex: Découvrir"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Lien
                </label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border"
                  placeholder="Ex: /products"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Icône (emoji)
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-center text-xl"
                  placeholder="🥬"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      display_order: parseInt(e.target.value, 10) || 999,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="rounded border-border"
                  />
                  <span className="text-sm">Active (visible sur l'accueil)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {editingId ? 'Enregistrer' : 'Créer'}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Slides List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <ImageIcon size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <h3 className="text-lg font-medium text-text-primary">
            Aucune slide
          </h3>
          <p className="text-text-secondary mb-6">
            Ajoutez votre première slide pour la bannière d'accueil
          </p>
          <Button
            onClick={openCreateForm}
            className="bg-primary text-white"
          >
            <Plus size={18} className="mr-2" />
            Ajouter une slide
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={cn(
                'bg-white rounded-xl border overflow-hidden transition-all',
                slide.is_active ? 'border-border' : 'border-border/50 opacity-60'
              )}
            >
              <div className="flex flex-col md:flex-row">
                {/* Preview Image */}
                <div className="relative w-full md:w-80 h-40 md:h-auto md:aspect-video bg-muted flex-shrink-0">
                  {slide.image_url && (
                    <Image
                      src={slide.image_url}
                      alt={slide.alt_text || slide.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  )}
                  {!slide.is_active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium px-3 py-1 bg-black/60 rounded-full">
                        Désactivée
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                          #{slide.display_order}
                        </span>
                        {slide.icon && (
                          <span className="text-xl">{slide.icon}</span>
                        )}
                        <h3 className="font-semibold text-text-primary truncate">
                          {slide.title}
                        </h3>
                      </div>
                      {slide.subtitle && (
                        <p className="text-sm text-text-secondary">
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.cta && slide.link && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          <LinkIcon size={12} />
                          {slide.cta} → {slide.link}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto flex-wrap">
                    <button
                      onClick={() => moveSlide(slide.id, 'up')}
                      disabled={idx === 0}
                      className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-30"
                      title="Monter"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => moveSlide(slide.id, 'down')}
                      disabled={idx === sortedSlides.length - 1}
                      className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-30"
                      title="Descendre"
                    >
                      <ArrowDown size={16} />
                    </button>

                    <button
                      onClick={() => toggleActive(slide)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        slide.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                      title={slide.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {slide.is_active ? (
                        <>
                          <Eye size={14} /> Active
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} /> Inactive
                        </>
                      )}
                    </button>

                    <div className="flex-1" />

                    <button
                      onClick={() => openEditForm(slide)}
                      className="p-2 hover:bg-muted rounded transition-colors"
                      title="Modifier"
                    >
                      <Edit size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id, slide.title)}
                      disabled={deleting === slide.id}
                      className="p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deleting === slide.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-red-600"
                        />
                      ) : (
                        <Trash2 size={16} className="text-red-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}