// File: app/api/reports/route.ts
// Path: /app/api/reports/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Reports API called')
    
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const orderFrom = searchParams.get('orderFrom')
    const orderTo = searchParams.get('orderTo')
    const partner = searchParams.get('partner')
    const status = searchParams.get('status')

    console.log('📋 Filters:', { dateFrom, dateTo, orderFrom, orderTo, partner, status })

    // Start with base query
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply date filters
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      fromDate.setHours(0, 0, 0, 0)
      query = query.gte('created_at', fromDate.toISOString())
      console.log('📅 Date from:', fromDate.toISOString())
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      query = query.lte('created_at', toDate.toISOString())
      console.log('📅 Date to:', toDate.toISOString())
    }

    // Apply order number range filters
    if (orderFrom) {
      query = query.gte('order_number', orderFrom)
    }
    if (orderTo) {
      query = query.lte('order_number', orderTo)
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    console.log('🔍 Executing query...')
    
    const { data: orders, error } = await query

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${orders?.length || 0} orders`)
    
    return NextResponse.json({
      orders: orders || [],
      count: orders?.length || 0
    })

  } catch (error) {
    console.error('❌ Reports API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}