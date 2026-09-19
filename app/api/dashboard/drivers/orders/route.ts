// File: app/api/dashboard/driver/orders/route.ts
// Path: /app/api/dashboard/driver/orders/route.ts
// Description: Get orders assigned to driver

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔍 [Driver Orders API] Called')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('👤 [Driver Orders API] Driver ID:', user.id)

    // Get orders assigned to this driver
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          product_name,
          quantity
        )
      `)
      .eq('delivery_id', user.id)
      .in('status', ['in_transit', 'delivered'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [Driver Orders API] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    console.log(`📦 [Driver Orders API] Found ${data?.length || 0} orders`)
    return NextResponse.json({ orders: data || [] })
  } catch (error) {
    console.error('❌ [Driver Orders API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}