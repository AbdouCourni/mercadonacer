// File: app/api/hero-slides/route.ts
// Path: /app/api/hero-slides/route.ts
// Description: Hero slides API — public GET, admin POST

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

// ============================================
// GET — public list of active slides
// ============================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let query = supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Hero slides fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch slides' },
        { status: 500 }
      )
    }

    return NextResponse.json({ slides: data || [] })
  } catch (error) {
    console.error('Hero slides API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// POST — admin create
// ============================================
export async function POST(request: NextRequest) {
  try {
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()

    if (!body.title?.trim() || !body.image_url?.trim()) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      )
    }

    // Auto-assign display_order if not provided (max + 1)
    let displayOrder = body.display_order
    if (displayOrder === undefined || displayOrder === null) {
      const { data: maxSlide } = await supabase
        .from('hero_slides')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle()
      displayOrder = (maxSlide?.display_order ?? 0) + 1
    }

    const { data, error } = await supabase
      .from('hero_slides')
      .insert([{
        title: body.title.trim(),
        subtitle: body.subtitle?.trim() || null,
        description: body.description?.trim() || null,
        cta: body.cta?.trim() || null,
        link: body.link?.trim() || null,
        image_url: body.image_url.trim(),
        icon: body.icon?.trim() || null,
        alt_text: body.alt_text?.trim() || body.title.trim(),
        display_order: displayOrder,
        is_active: body.is_active ?? true,
      }])
      .select()
      .single()

    if (error) {
      console.error('Hero slide create error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Hero slide POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create slide' },
      { status: 500 }
    )
  }
}