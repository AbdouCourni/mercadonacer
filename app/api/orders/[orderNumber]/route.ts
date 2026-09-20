// File: app/api/orders/[orderNumber]/route.ts
// Path: /app/api/orders/[orderNumber]/route.ts
// Description: Get order by order number

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
    { params }: { params: Promise<{ orderNumber: string }> }  // ✅ Promise
  
) {
  try {
    const { orderNumber } = await params

    const supabase = await createClient()
const cleanOrderNumber = decodeURIComponent(orderNumber).trim()

const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    items:order_items (
      id,
      product_name,
      quantity,
      unit_price,
      total_price
    )
  `)
  .eq('order_number', cleanOrderNumber)
  .maybeSingle()

if (!data) {
  console.error('❌ Not found for:', cleanOrderNumber)
  return NextResponse.json(
    { error: 'Order not found' },
    { status: 404 }
  )
}

return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error fetching order:', error)
    return NextResponse.json(
      { error: 'Error fetching order' },
      { status: 500 }
    )
  } }