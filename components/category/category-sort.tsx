// File: components/category/category-sort.tsx
// Path: /components/category/category-sort.tsx
// Description: Client component for category sorting

'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

interface CategorySortProps {
  currentSort: string
  totalProducts: number
  from: number
  to: number
}

export function CategorySort({ currentSort, totalProducts, from, to }: CategorySortProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sort, setSort] = useState(currentSort)

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value
    setSort(newSort)
    
    // Update URL with new sort parameter
    const url = new URL(window.location.href)
    url.searchParams.set('sort', newSort)
    url.searchParams.set('page', '0') // Reset to first page
    router.push(url.toString())
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">
          Affichage de {from} - {to} sur {totalProducts}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-text-secondary">Trier par:</label>
        <select
          className="px-3 py-1.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={sort}
          onChange={handleSortChange}
        >
          <option value="created_at-desc">Nouveautés</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="rating-desc">Meilleures notes</option>
        </select>
      </div>
    </div>
  )
}