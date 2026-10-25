// File: components/category/category-grid.tsx
// Path: /components/category/category-grid.tsx
// Description: Light square-ish category cards for the homepage grid

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getOptimizedImage } from '@/lib/cloudinary'
import { Grid2X2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  image_url?: string | null
}

interface CategoryGridProps {
  categories: Category[]
  /** Show a "Tous les produits" card at the end */
  showAllCard?: boolean
}

export default function CategoryGrid({
  categories,
  showAllCard = true,
}: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
        Les catégories seront bientôt disponibles.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {categories.map((category) => {
        const hasImage = category.image_url && category.image_url.length > 0
        return (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex flex-col items-center overflow-hidden rounded-2xl border border-gray-100 bg-emerald-50/40 p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
              {hasImage ? (
                <Image
                  src={getOptimizedImage(category.image_url!, {
                    width: 300,
                    height: 300,
                  })}
                  alt={category.name}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">
                  🛒
                </div>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-semibold leading-tight text-emerald-950 sm:text-[13px]">
              {category.name}
            </p>
          </Link>
        )
      })}

      {showAllCard && (
        <Link
          href="/categories"
          className="group flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-emerald-50/40 p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
        >
          <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-white text-emerald-700">
            <Grid2X2 size={32} />
          </div>
          <p className="mt-2 text-xs font-semibold text-emerald-950 sm:text-[13px]">
            Tous les produits
          </p>
        </Link>
      )}
    </div>
  )
}