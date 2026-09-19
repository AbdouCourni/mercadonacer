// File: app/api/dashboard/drivers/[id]/route.ts
// Path: /app/api/dashboard/drivers/[id]/route.ts
// Description: Get driver info from profiles

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15, params is a Promise that needs to be awaited
    const { id } = await params
    
    console.log('🔍 [API] Fetch driver ID:', id)
    
    const supabase = await createClient()
    console.log('✅ [API] Supabase client created')

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        address,
        city,
        driver_zone,
        is_active,
        preferred_language
      `)
      .eq('id', id)
      .maybeSingle()

    console.log('📦 [API] Query result:', { data, error })

    if (error) {
      console.error('❌ [API] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.log('⚠️ [API] No driver found for ID:', id)
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    console.log('✅ [API] Driver found:', data.full_name)
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ [API] Driver fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch driver' },
      { status: 500 }
    )
  }
}