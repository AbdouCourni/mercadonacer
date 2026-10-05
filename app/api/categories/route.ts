// File: app/api/categories/route.ts
// Path: /app/api/categories/route.ts
// Description: Categories API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const homeOnly = searchParams.get('home') === 'true'
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : null

    let query = supabase
      .from('categories')
      .select(`
        *,
        products:products (count)
      `)

    if (homeOnly) {
      query = query
        .eq('display_in_home', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true })
    } else {
      query = query
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true })
    }

    if (limit && limit > 0) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ categories: data || [] })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}