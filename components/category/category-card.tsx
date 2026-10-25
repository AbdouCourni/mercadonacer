// File: components/category/category-card.tsx
// Path: /components/category/category-card.tsx

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
  name,
  slug,
  image,
  productCount,
}: CategoryCardProps) {
  return (
    <Link 
      href={`/categories/${slug}`} 
      className="group flex flex-col items-center justify-center bg-[#F8F9FA] rounded-2xl p-4 md:p-6 transition-all duration-300 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100"
    >
      {/* Image */}
      <div className="relative w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4">
        {image ? (
          <Image
            src={getOptimizedImage(image, { width: 200, height: 200 })}
            alt={name}
            fill
            className="object-contain group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 64px, 96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            📦
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-medium text-gray-900 text-xs md:text-sm text-center group-hover:text-primary transition-colors leading-tight">
        {name}
      </h3>

      {/* Optional: Show product count if you want, but the image hides it for a cleaner look */}
      {productCount !== undefined && productCount > 0 && (
        <p className="text-[10px] md:text-xs text-gray-500 mt-1">
          {productCount} article{productCount > 1 ? 's' : ''}
        </p>
      )}
    </Link>
  )
}