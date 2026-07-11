// File: components/product/product-reviews.tsx
// Path: /components/product/product-reviews.tsx
// Description: Product reviews section

'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface ProductReviewsProps {
  productId: string
  rating: number
  reviewsCount: number
}

export default function ProductReviews({ productId, rating, reviewsCount }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false)

  // Mock reviews (replace with real data later)
  const reviews = [
    {
      id: 1,
      user: 'Ahmed B.',
      rating: 5,
      date: '15/06/2024',
      comment: 'Très bon produit, livraison rapide !'
    },
    {
      id: 2,
      user: 'Fatima E.',
      rating: 4,
      date: '12/06/2024',
      comment: 'Produit de qualité, je recommande.'
    }
  ]

  return (
    <div className="border-t border-border pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Avis clients</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={cn(
                    i < Math.floor(rating) 
                      ? 'fill-accent text-accent' 
                      : 'text-border fill-border'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-text-secondary">
              ({reviewsCount} avis)
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {showForm ? 'Annuler' : 'Donner votre avis'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-muted p-6 rounded-xl mb-6">
          <h3 className="font-semibold text-text-primary mb-4">Donnez votre avis</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Note
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    <Star size={24} className="text-border hover:text-accent transition-colors" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Votre avis
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Partagez votre expérience avec ce produit..."
              />
            </div>
            <Button className="bg-primary text-white hover:bg-primary/90">
              Envoyer
            </Button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">{review.user}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={cn(
                          i < review.rating 
                            ? 'fill-accent text-accent' 
                            : 'text-border fill-border'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-text-secondary">{review.date}</span>
              </div>
              <p className="text-text-secondary mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-secondary text-center py-8">
          Aucun avis pour le moment. Soyez le premier à donner votre avis !
        </p>
      )}
    </div>
  )
}