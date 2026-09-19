// File: app/api/shop/location/route.ts
// Path: /app/api/shop/location/route.ts
// Description: Get shop location from database

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the first active shop (or your main shop)
    const { data, error } = await supabase
      .from('shops')
      .select('id, name, address, city, latitude, longitude')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (error || !data) {
      // Fallback to Nador coordinates if no shop found
      return NextResponse.json({
        id: 'fallback',
        name: 'MercadoNacer',
        address: 'Nador, Maroc',
        city: 'Nador',
        latitude: 35.1684,
        longitude: -2.9287
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching shop location:', error)
    // Fallback to Nador
    return NextResponse.json({
      id: 'fallback',
      name: 'MercadoNacer',
      address: 'Nador, Maroc',
      city: 'Nador',
      latitude: 35.169829836951294,
      longitude: -2.933249645530903
    })
  }
}