// File: app/(shop)/categories/page.tsx
// Path: /app/(shop)/categories/page.tsx
// Description: All categories page - Gallery Grid

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FolderOpen } from 'lucide-react'
import CategoryCard from '@/components/category/category-card'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Get all categories with product counts
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      products:products (count)
    `)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name')

  if (error) {
    console.error('Categories error:', error)
  }

  return (
    <div className="container-custom py-8 md:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Acheter par catégorie
        </h1>
        <p className="text-gray-500 text-base">
          Trouvez rapidement ce que vous cherchez parmi nos différentes catégories.
        </p>
      </div>

      {/* Gallery Grid */}
      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category: any) => {
            const productCount = category.products?.[0]?.count || 0
            
            return (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                slug={category.slug}
                image={category.image_url}
                productCount={productCount}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucune catégorie</h3>
          <p className="text-gray-500">Les catégories apparaîtront ici une fois ajoutées.</p>
        </div>
      )}
    </div>
  )
}