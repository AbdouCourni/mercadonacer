// File: app/(shop)/categories/page.tsx
// Path: /app/(shop)/categories/page.tsx
// Description: All categories page

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { FolderOpen } from 'lucide-react'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Get all categories with product counts
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      products:products (count)
    `)
    .order('name')

  if (error) {
    console.error('Categories error:', error)
  }

  // Group categories by first letter
  const groupedCategories = (categories || []).reduce((acc: any, cat: any) => {
    const firstLetter = cat.name.charAt(0).toUpperCase()
    if (!acc[firstLetter]) acc[firstLetter] = []
    acc[firstLetter].push(cat)
    return acc
  }, {})

  const letters = Object.keys(groupedCategories).sort()

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Toutes les catégories</h1>
      <p className="text-text-secondary mb-8">
        Explorez notre large gamme de produits par catégorie
      </p>

      {/* Alphabetical Index */}
      <div className="flex flex-wrap gap-2 mb-8">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#section-${letter}`}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border hover:bg-primary hover:text-white hover:border-primary transition-colors text-sm"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="space-y-10">
        {letters.map((letter) => (
          <div key={letter} id={`section-${letter}`}>
            <h2 className="text-2xl font-bold text-primary border-b border-border pb-3 mb-4">
              {letter}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {groupedCategories[letter].map((category: any) => {
                const productCount = category.products?.[0]?.count || 0
                
                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group bg-white rounded-xl border border-border p-4 hover:shadow-md transition-all hover:border-primary/50"
                  >
                    <div className="flex flex-col items-center text-center">
                      {category.image_url ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted mb-3">
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                          <FolderOpen size={28} className="text-primary" />
                        </div>
                      )}
                      <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors text-sm">
                        {category.name}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {productCount} produit{productCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}