// File: app/api/products/hero-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { orderedIds } = await request.json()

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds must be an array' }, { status: 400 })
    }

    // 1. First, remove ALL products from the hero
    // This instantly clears the Hero table
    const { error: resetError } = await supabase
      .from('products')
      .update({ show_in_hero: false })
      .neq('id', '00000000-0000-0000-0000-000000000000') // A trick to update ALL rows

    if (resetError) throw resetError

    // 2. If the list is empty, we are done
    if (orderedIds.length === 0) {
      return NextResponse.json({ success: true })
    }

    // 3. Add the new ones back with their correct order
    // We do this by updating them one by one (or via a Supabase RPC if you have 50+ products)
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase
        .from('products')
        .update({
          show_in_hero: true,
          hero_order: i + 1,
        })
        .eq('id', orderedIds[i])

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hero order save error:', error)
    return NextResponse.json({ error: 'Failed to save hero order' }, { status: 500 })
  }
}