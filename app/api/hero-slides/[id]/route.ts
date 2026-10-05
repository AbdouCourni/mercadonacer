// File: app/api/hero-slides/[id]/route.ts
// Path: /app/api/hero-slides/[id]/route.ts
// Description: Single hero slide — PATCH/DELETE

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

// ============================================
// PATCH — update
// ============================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()

    const update: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.title !== undefined) update.title = body.title.trim()
    if (body.subtitle !== undefined) update.subtitle = body.subtitle?.trim() || null
    if (body.description !== undefined) update.description = body.description?.trim() || null
    if (body.cta !== undefined) update.cta = body.cta?.trim() || null
    if (body.link !== undefined) update.link = body.link?.trim() || null
    if (body.image_url !== undefined) update.image_url = body.image_url.trim()
    if (body.icon !== undefined) update.icon = body.icon?.trim() || null
    if (body.alt_text !== undefined) update.alt_text = body.alt_text?.trim() || null
    if (body.display_order !== undefined) update.display_order = body.display_order
    if (body.is_active !== undefined) update.is_active = body.is_active

    const { data, error } = await supabase
      .from('hero_slides')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Hero slide update error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Hero slide PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update slide' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireManager()

    const supabase = await createClient()

    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Hero slide delete error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hero slide DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete slide' },
      { status: 500 }
    )
  }
}