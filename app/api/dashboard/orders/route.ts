// File: app/api/dashboard/orders/route.ts
// Path: /app/api/dashboard/orders/route.ts
// Description: Dashboard orders API with assigned employee info

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/services/rbac.service'

export async function GET(request: NextRequest) {
  try {
    console.log('📡 Dashboard orders API called')
    
    await requireManager()
    console.log('✅ Auth passed')

    const supabase = await createClient()
    console.log('✅ Supabase client created')

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const city = searchParams.get('city') || ''
    const date = searchParams.get('date') || ''
    const assigned = searchParams.get('assigned') === 'true'
    const unassigned = searchParams.get('unassigned') === 'true'

    // 🔥 Get orders with items
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          product_name,
          quantity
        )
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,` +
        `guest_name.ilike.%${search}%,` +
        `guest_email.ilike.%${search}%,` +
        `city.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (city) {
      query = query.eq('city', city)
    }

    if (date) {
      query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`)
    }

    if (assigned) {
      query = query.not('assigned_to', 'is', null)
    } else if (unassigned) {
      query = query.is('assigned_to', null)
    }

    // Pagination
    const from = page * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    console.log('🔍 Executing query...')
    const { data, error, count } = await query

    if (error) {
      console.error('❌ Query error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log(`📦 Found ${count || 0} orders`)

    // 🔥 Get assigned employee names separately (if needed)
    const employeeIds = data?.filter(o => o.assigned_to).map(o => o.assigned_to) || []
    let employeeMap: Record<string, string> = {}

    if (employeeIds.length > 0) {
      const { data: employees } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', employeeIds)

      if (employees) {
        employeeMap = employees.reduce((acc, emp) => {
          acc[emp.id] = emp.full_name || emp.id
          return acc
        }, {} as Record<string, string>)
      }
    }

    // Format the data
    const formattedData = data?.map((order: any) => ({
      ...order,
      assigned_to_name: order.assigned_to ? employeeMap[order.assigned_to] || null : null
    }))

    return NextResponse.json({
      orders: formattedData || [],
      count: count || 0,
      page,
      limit
    })
  } catch (error) {
    console.error('❌ Dashboard orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}