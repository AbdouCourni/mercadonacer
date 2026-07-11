// File: app/(shop)/categories/[slug]/page.tsx
// Path: /app/(shop)/categories/[slug]/page.tsx
// Description: Category page - FIXED with client components

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { CategorySort } from '@/components/category/category-sort'
import { CategoryPagination } from '@/components/category/category-pagination'

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams?: {
    sort?: string
    page?: string
  }
}

// Disable static generation - always fetch at request time
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const page = searchParams?.page ? parseInt(searchParams.page) : 0
  const limit = 20
  const sort = searchParams?.sort || 'created_at-desc'

  const supabase = await createClient()

  // 1. Get category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // 2. Get products in this category
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('category_id', category.id)
    .eq('is_active', true)

  // Apply sorting
  if (sort === 'price-asc') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price-desc') {
    query = query.order('price', { ascending: false })
  } else if (sort === 'rating-desc') {
    query = query.order('rating', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Pagination
  const from = page * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data: products, error: productsError, count } = await query

  if (productsError) {
    console.error('Products error:', productsError)
  }

  const totalProducts = count || 0
  const totalPages = Math.ceil(totalProducts / limit)

  // 3. Get subcategories (if any)
  const { data: subcategories } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', category.id)
    .order('name')

  // 4. Get parent category
  let parentCategory = null
  if (category.parent_id) {
    const { data: parent } = await supabase
      .from('categories')
      .select('*')
      .eq('id', category.parent_id)
      .single()
    parentCategory = parent
  }

  const displayFrom = totalProducts > 0 ? from + 1 : 0
  const displayTo = Math.min(from + limit, totalProducts)

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-primary transition-colors">
          Accueil
        </Link>
        <span>/</span>
        {parentCategory && (
          <>
            <Link href={`/categories/${parentCategory.slug}`} className="hover:text-primary transition-colors">
              {parentCategory.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-text-primary font-medium">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-text-secondary mt-2 max-w-2xl">
              {category.description}
            </p>
          )}
          <p className="text-sm text-text-secondary mt-1">
            {totalProducts} produit{totalProducts > 1 ? 's' : ''}
          </p>
        </div>

        {category.image_url && (
          <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Subcategories */}
      {subcategories && subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-text-secondary mb-3">Sous-catégories</h2>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="px-4 py-2 bg-muted rounded-full text-sm hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sort Component - Client Component */}
      <CategorySort
        currentSort={sort}
        totalProducts={totalProducts}
        from={displayFrom}
        to={displayTo}
      />

      {/* Products */}
      {products && products.length > 0 ? (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                comparePrice={product.compare_price}
                image={product.images?.[0] || '/images/placeholder.jpg'}
                barcode={product.barcode}
                sku={product.sku}
                rating={product.rating || 0}
                reviewsCount={product.reviews_count || 0}
                stock={product.stock || 0}
                isNew={product.is_new || false}
                isSale={product.compare_price ? product.compare_price > product.price : false}
              />
            ))}
          </div>

          {/* Pagination - Client Component */}
          {totalPages > 1 && (
            <CategoryPagination
              slug={slug}
              currentPage={page}
              totalPages={totalPages}
              sort={sort}
            />
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <Package size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <h3 className="text-lg font-medium text-text-primary">Aucun produit</h3>
          <p className="text-text-secondary">
            Cette catégorie ne contient pas encore de produits.
          </p>
          <Link href="/products" className="mt-4 inline-block">
            <Button className="bg-primary text-white hover:bg-primary/90">
              Voir tous les produits
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}