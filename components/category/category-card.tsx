'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getOptimizedImage } from '@/lib/cloudinary'

interface CategoryCardProps {
  id: string
  name: string
  slug: string
  image?: string | null
  productCount?: number
}

export default function CategoryCard({
  id,
  name,
  slug,
  image,
  productCount,
}: CategoryCardProps) {
  const hasImage = image && image.length > 0

  return (
    <Link href={`/categories/${slug}`} className="group block">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
        {/* Image or fallback */}
        {hasImage ? (
          <Image
            src={getOptimizedImage(image, { width: 400, height: 400 })}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="text-5xl">📦</span>
          </div>
        )}

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
          <h3 className="font-bold text-base md:text-lg leading-tight line-clamp-2 group-hover:text-primary-100 transition-colors">
            {name}
          </h3>
          {productCount !== undefined && (
            <p className="text-xs md:text-sm text-white/80 mt-1">
              {productCount} produit{productCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Optional badge for count */}
        {productCount !== undefined && productCount > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-primary text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            {productCount}
          </div>
        )}
      </div>
    </Link>
  )
}