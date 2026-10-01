// File: components/category/category-pagination-client.tsx
// Path: /components/category/category-pagination-client.tsx
// Description: Client-side pagination wrapper for category pages

'use client'

import { useRouter } from 'next/navigation'
import { Pagination } from '@/components/ui/pagination'

interface CategoryPaginationClientProps {
  slug: string
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  sort?: string
}

export function CategoryPaginationClient({
  slug,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  sort,
}: CategoryPaginationClientProps) {
  const router = useRouter()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (sort && sort !== 'created_at-desc') params.set('sort', sort)
    if (newPage > 0) params.set('page', String(newPage + 1))
    
    const url = params.toString()
      ? `/categories/${slug}?${params.toString()}`
      : `/categories/${slug}`
    
    router.push(url)
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      showPageSize={false}
    />
  )
}