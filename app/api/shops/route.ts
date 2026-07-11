// File: app/api/shops/route.ts
// Path: /app/api/shops/route.ts
// Description: Get all shops

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('name')

    if (error) {
      console.error('Shops error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shops' },
        { status: 500 }
      )
    }

    return NextResponse.json({ shops: data || [] })
  } catch (error) {
    console.error('Shops API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 }
    )
  }
}