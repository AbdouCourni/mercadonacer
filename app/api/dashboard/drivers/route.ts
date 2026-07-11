// File: app/api/dashboard/drivers/route.ts
// Path: /app/api/dashboard/drivers/route.ts
// Description: Delivery drivers management API (admin only)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

// GET - List all delivery drivers
export async function GET() {
  try {
    await requireManager()

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('delivery_drivers')
      .select('*')
      .order('full_name')

    if (error) throw error

    return NextResponse.json({ drivers: data || [] })
  } catch (error) {
    console.error('Drivers fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    )
  }
}

// POST - Create a new delivery driver
export async function POST(request: NextRequest) {
  try {
    await requireManager()

    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    if (!body.full_name || !body.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('delivery_drivers')
      .insert([{
        full_name: body.full_name,
        phone: body.phone,
        vehicle_type: body.vehicle_type || 'car',
        license_plate: body.license_plate || null,
        max_deliveries_per_day: body.max_deliveries_per_day || 10,
        is_available: body.is_available !== undefined ? body.is_available : true,
        rating: body.rating || 0,
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Driver creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    )
  }
}