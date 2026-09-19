// File: app/api/dashboard/employee/orders/route.ts
// Path: /app/api/dashboard/employee/orders/route.ts
// Description: Get orders assigned to current employee

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔍 Employee orders API called')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('👤 Employee ID:', user.id)

    // Get orders assigned to this employee
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          product_name,
          quantity
        )
      `)
      .eq('assigned_to', user.id)
      .in('status', ['assigned', 'preparing', 'ready'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Employee orders error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    console.log(`📦 Found ${data?.length || 0} orders for employee`)
    return NextResponse.json({ orders: data || [] })
  } catch (error) {
    console.error('❌ Employee order s API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}