// File: app/api/delivery-zones/route.ts
// Path: /app/api/delivery-zones/route.ts
// Description: Get delivery zones

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return NextResponse.json({ zones: data || [] })
  } catch (error) {
    console.error('Delivery zones error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch delivery zones' },
      { status: 500 }
    )
  }
}