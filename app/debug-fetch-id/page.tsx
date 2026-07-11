// File: app/debug-fetch-id/page.tsx
// Path: /app/debug-fetch-id/page.tsx
// Description: Debug fetch product by specific ID with rendered data

'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function DebugFetchIdPage() {
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiUsed, setApiUsed] = useState<string>('')

  const testId = '542c8d66-8dec-4abd-815d-d2583322c211'

  const testApi = async (endpoint: string) => {
    setLoading(true)
    setError(null)
    setProduct(null)
    setApiUsed(endpoint)

    try {
      const url = endpoint.replace('{id}', testId)
      console.log('🔍 Testing:', url)
      
      const response = await fetch(url)
      

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`)
      }

      const data = await response.json()
      setProduct(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-custom py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">🔍 Debug Fetch by ID</h1>
      <p className="text-sm text-text-secondary mb-6">
        Testing ID: <code className="bg-muted px-2 py-0.5 rounded font-mono">{testId}</code>
      </p>

      {/* Test Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
onClick={() => testApi('/api/products?id={id}')}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
  Test /api/products?id={'{id}'}
        </button>
        <button
          onClick={() => testApi('/api/dashboard/products?id={id}')}
          disabled={loading}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50"
        >
          Test /api/dashboard/products/{'{id}'}
        </button>
        <button
          onClick={() => testApi('/api/debug-product?id={id}')}
          disabled={loading}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
        >
          Test /api/debug-product?id={'{id}'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          <p className="font-semibold">❌ Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Product Display */}
      {product && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-green-50 border-b border-green-200 px-6 py-3">
            <p className="text-green-700 font-semibold">
              ✅ Product fetched from: <span className="font-mono text-sm">{apiUsed}</span>
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Images */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img: string, i: number) => (
                  <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <Image
                      src={img}
                      alt={`Product image ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Name</p>
                <p className="font-medium text-text-primary">{product.name}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Slug</p>
                <p className="font-mono text-sm text-text-primary">{product.slug}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Price</p>
                <p className="font-bold text-primary">{product.price} DH</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Stock</p>
                <p className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.stock} units
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Barcode</p>
                <p className="font-mono text-sm">{product.barcode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">SKU</p>
                <p className="font-mono text-sm">{product.sku || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Category</p>
                <p className="text-sm">{product.category?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Brand</p>
                <p className="text-sm">{product.brand || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Status</p>
                <span className={product.is_active ? 'text-green-600' : 'text-red-600'}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Featured</p>
                <span>{product.is_featured ? '⭐ Yes' : 'No'}</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-sm text-text-secondary mb-1">Description</p>
                <p className="text-sm text-text-primary bg-muted p-3 rounded-lg">
                  {product.description}
                </p>
              </div>
            )}

            {/* Full JSON */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-primary hover:underline">
                View Full JSON
              </summary>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs mt-2 max-h-96">
                {JSON.stringify(product, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}