// File: components/ui/pagination.tsx
// Path: /components/ui/pagination.tsx
// Description: Compact pagination with page select dropdown

'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number           // 0-indexed
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
  totalItems?: number
  itemsPerPage?: number
  showPageSize?: boolean
  onPageSizeChange?: (size: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  totalItems = 0,
  itemsPerPage = 25,
  showPageSize = false,
  onPageSizeChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const start = currentPage * itemsPerPage + 1
  const end = Math.min((currentPage + 1) * itemsPerPage, totalItems)

  // Build the list of pages for the dropdown
  const allPages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border">
      {/* Count */}
      <p className="text-sm text-text-secondary order-2 sm:order-1">
        <span className="font-medium text-text-primary">{start} - {end}</span> sur {totalItems} produits
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* First */}
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0 || disabled}
          className="p-2 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Première page"
          title="Première page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || disabled}
          className="p-2 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Page précédente"
          title="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page selector dropdown */}
        <div className="flex items-center gap-1.5 text-sm mx-1">
          <span className="text-text-secondary hidden sm:inline">Page</span>
          <select
            value={currentPage + 1}
            onChange={(e) => onPageChange(parseInt(e.target.value) - 1)}
            disabled={disabled}
            className="px-2 py-1 rounded border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 cursor-pointer min-w-[70px]"
            aria-label="Choisir une page"
          >
            {allPages.map((pageNum) => (
              <option key={pageNum} value={pageNum}>
                {pageNum}
              </option>
            ))}
          </select>
          <span className="text-text-secondary whitespace-nowrap">/ {totalPages}</span>
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || disabled}
          className="p-2 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Page suivante"
          title="Page suivante"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1 || disabled}
          className="p-2 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Dernière page"
          title="Dernière page"
        >
          <ChevronsRight size={16} />
        </button>

        {/* Page size selector */}
        {showPageSize && onPageSizeChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            disabled={disabled}
            className="ml-2 px-2 py-1 text-sm rounded border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 cursor-pointer"
            aria-label="Produits par page"
            title="Produits par page"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        )}
      </div>
    </div>
  )
}