// File: components/category/category-pagination.tsx
// Path: /components/category/category-pagination.tsx
// Description: Client component for category pagination

'use client'

import Link from 'next/link'

interface CategoryPaginationProps {
  slug: string
  currentPage: number
  totalPages: number
  sort: string
}

export function CategoryPagination({ slug, currentPage, totalPages, sort }: CategoryPaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Link
        href={`/categories/${slug}?page=${Math.max(0, currentPage - 1)}&sort=${sort}`}
        className={`px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors ${
          currentPage === 0 ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        Précédent
      </Link>
      <span className="px-4 py-2 text-sm text-text-secondary">
        Page {currentPage + 1} sur {totalPages}
      </span>
      <Link
        href={`/categories/${slug}?page=${Math.min(totalPages - 1, currentPage + 1)}&sort=${sort}`}
        className={`px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors ${
          currentPage >= totalPages - 1 ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        Suivant
      </Link>
    </div>
  )
}