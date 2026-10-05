// File: app/api/dashboard/categories/reorder/route.ts
// Path: /app/api/dashboard/categories/reorder/route.ts
// Description: Bulk update display_order and display_in_home

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

interface CategoryUpdate {
  id: string
  display_order: number
  display_in_home: boolean
}

export async function POST(request: NextRequest) {
  try {
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()
    const updates: CategoryUpdate[] = body.updates || []

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      )
    }

    // Update each category (Supabase doesn't support bulk update with different values in one call)
    const results = await Promise.all(
      updates.map((u) =>
        supabase
          .from('categories')
          .update({
            display_order: u.display_order,
            display_in_home: u.display_in_home,
            updated_at: new Date().toISOString(),
          })
          .eq('id', u.id)
      )
    )

    const failed = results.filter((r) => r.error)
    if (failed.length > 0) {
      console.error('Some updates failed:', failed)
      return NextResponse.json(
        { error: `Failed to update ${failed.length} categories` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, updated: updates.length })
  } catch (error) {
    console.error('Reorder error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    )
  }
}