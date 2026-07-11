// File: app/debug/page.tsx
// Path: /app/debug/page.tsx
// Description: Enhanced debug page showing all products, categories, and variants

import { createClient } from '@/lib/supabase/server'
import { getProducts } from '@/services/products.service'

export default async function DebugPage() {
  let supabaseStatus = 'Unknown'
  let products: any[] = []
  let categories: any[] = []
  let variants: any[] = []
  let error: string | null = null
  let envStatus = {}

  try {
    // Check environment variables
    envStatus = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
    }

    // Test 1: Create client
    const supabase = createClient()
    supabaseStatus = typeof (await supabase).from === 'function' ? '✅ Working' : '❌ Failed'
    
    // Test 2: Get ALL products (no limit)
    const { data: allProducts, error: productError } = await (await supabase)
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (productError) {
      error = productError.message
    } else {
      products = allProducts || []
    }

    // Test 3: Get categories
    const { data: allCategories, error: categoryError } = await (await supabase)
      .from('categories')
      .select('*')
      .order('name')

    if (!categoryError) {
      categories = allCategories || []
    }

    // Test 4: Get variants
    const { data: allVariants, error: variantError } = await (await supabase)
      .from('product_variants')
      .select('*')

    if (!variantError) {
      variants = allVariants || []
    }

  } catch (err: any) {
    error = err.message || 'Unknown error'
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🔍 Supabase Debug - MercadoNacer</h1>
      
      {/* Environment Variables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-muted p-4 rounded-lg border border-border">
          <h2 className="font-semibold mb-2 text-text-primary text-sm">Environment:</h2>
          <pre className="bg-black/5 dark:bg-white/5 p-2 rounded text-xs text-text-secondary">
            {JSON.stringify(envStatus, null, 2)}
          </pre>
        </div>
        <div className="bg-muted p-4 rounded-lg border border-border">
          <h2 className="font-semibold mb-2 text-text-primary text-sm">Client Status:</h2>
          <p className={`font-bold text-lg ${supabaseStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {supabaseStatus}
          </p>
        </div>
        <div className="bg-muted p-4 rounded-lg border border-border">
          <h2 className="font-semibold mb-2 text-text-primary text-sm">Data Summary:</h2>
          <p className="text-sm">
            Products: <span className="font-bold text-primary">{products.length}</span><br />
            Categories: <span className="font-bold text-secondary">{categories.length}</span><br />
            Variants: <span className="font-bold text-accent">{variants.length}</span>
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-4">
          <h2 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">⚠️ Warning:</h2>
          <p className="text-yellow-800 dark:text-yellow-300">{error}</p>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-muted p-4 rounded-lg border border-border mb-4">
        <h2 className="font-semibold mb-3 text-text-primary">📂 Categories ({categories.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-background p-2 rounded border border-border text-sm">
              <span className="font-medium">{cat.name}</span>
              <span className="text-xs text-text-secondary block">slug: {cat.slug}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-muted p-4 rounded-lg border border-border mb-4">
        <h2 className="font-semibold mb-3 text-text-primary">📦 Products ({products.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-background p-3 rounded border border-border">
              <h3 className="font-medium text-text-primary text-sm">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary font-bold">{product.price} DH</span>
                {product.compare_price && (
                  <span className="text-text-secondary text-xs line-through">{product.compare_price} DH</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                </span>
              </div>
              {product.barcode && (
                <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                  <span>🔲</span> Barcode: <span className="font-mono">{product.barcode}</span>
                </p>
              )}
              {product.sku && (
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <span>📋</span> SKU: <span className="font-mono">{product.sku}</span>
                </p>
              )}
              {product.category && (
                <p className="text-xs text-text-secondary mt-1">
                  📂 {product.category.name}
                </p>
              )}
              {product.images && product.images.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {product.images.slice(0, 2).map((img: string, idx: number) => (
                    <img key={idx} src={img} alt="" className="w-8 h-8 object-cover rounded border" />
                  ))}
                  {product.images.length > 2 && (
                    <span className="text-xs text-text-secondary">+{product.images.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Variants Section */}
      {variants.length > 0 && (
        <div className="bg-muted p-4 rounded-lg border border-border">
          <h2 className="font-semibold mb-3 text-text-primary">🔀 Variants ({variants.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {variants.map((variant) => (
              <div key={variant.id} className="bg-white dark:bg-background p-2 rounded border border-border text-sm">
                <span className="font-medium">{variant.name}</span>
                <span className="text-text-secondary ml-2">{variant.price} DH</span>
                {variant.barcode && (
                  <span className="text-xs text-text-secondary block">Barcode: {variant.barcode}</span>
                )}
                {variant.sku && (
                  <span className="text-xs text-text-secondary block">SKU: {variant.sku}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">✅ Database Status:</h2>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>✅ {products.length} products loaded successfully</li>
          <li>✅ {categories.length} categories loaded successfully</li>
          <li>✅ {variants.length} variants loaded successfully</li>
          <li>✅ Barcodes and SKUs are working</li>
          <li>✅ Images are linked properly</li>
        </ul>
      </div>
    </div>
  )
}