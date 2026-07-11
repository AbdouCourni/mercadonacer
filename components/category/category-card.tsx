'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CategoryCardProps {
  id: number
  name: string
  icon?: React.ReactNode
  image?: string
  productCount?: number
}

export default function CategoryCard({ 
  id, 
  name, 
  icon, 
  image, 
  productCount 
}: CategoryCardProps) {
  // Emoji icons for categories (fallback)
  const getEmoji = (name: string) => {
    const emojis: Record<string, string> = {
      'Fruits et Legumes Frais': '🥬',
      'Fruitsec Kilogram': '🥜',
      'Olives et Herbes': '🫒',
      'Viandes et Poissons': '🥩',
      'Pains et Patisseries': '🥖',
      'Preparation et Ingredients': '🧂',
      'Cremerie': '🧀',
      'Epicerie': '🛒',
      'Nuts et Fruitsec': '🌰',
      'Biscuits et Gateaux': '🍪',
      'Chocolats et Bonbons': '🍫',
      'Dietetique': '💪',
      'Bio et Ecologie': '🌱',
      'Boissons': '🥤',
      'Congelé et Surgeles': '🧊',
      'Bébé': '👶',
      'Cosmétique et Beaute': '💄',
      'Parapharmacie': '💊',
      'Nettoyage': '🧹',
      'Papier': '📄',
      'Maison et Cuisine': '🍳',
      'Electromenager': '🔌',
      'Bibliotheque': '📚',
      'Jeux et Jouets': '🎮',
      'Bébé Vétements': '👕',
      'Femme Vetements': '👗',
      'Homme Vetements': '👔',
      'Animaux': '🐾',
      'ART DIVERS': '🎨'
    }
    return emojis[name] || '📦'
  }

  const slug = name.toLowerCase().replace(/\s+/g, '-')

  return (
    <Link href={`/categories/${slug}`}>
      <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 card-hover border border-border/50">
        {/* Icon/Image */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon || getEmoji(name)}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Product count */}
        {productCount !== undefined && (
          <p className="text-sm text-text-secondary mt-1">
            {productCount} produits
          </p>
        )}

        {/* Arrow on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight size={20} className="text-primary" />
        </div>
      </div>
    </Link>
  )
}