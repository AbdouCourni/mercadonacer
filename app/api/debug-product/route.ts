// File: app/api/debug-product/route.ts
// Path: /app/api/debug-product/route.ts
// Description: Test different methods to fetch a single product

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 }
    )
  }

  const results: any = {
    id: id,
    methods: {}
  }

  try {
    const supabase = await createClient()

    // METHOD 1: .single() - Most common, throws error if no rows
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      results.methods.single = {
        success: !error,
        data: data || null,
        error: error?.message || null
      }
    } catch (err: any) {
      results.methods.single = {
        success: false,
        data: null,
        error: err.message
      }
    }

    // METHOD 2: .maybeSingle() - Returns null if no rows, no error
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      results.methods.maybeSingle = {
        success: !error,
        data: data || null,
        error: error?.message || null
      }
    } catch (err: any) {
      results.methods.maybeSingle = {
        success: false,
        data: null,
        error: err.message
      }
    }

    // METHOD 3: .select() without single - returns array
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
      
      results.methods.select = {
        success: !error,
        count: data?.length || 0,
        data: data || [],
        error: error?.message || null
      }
    } catch (err: any) {
      results.methods.select = {
        success: false,
        count: 0,
        data: [],
        error: err.message
      }
    }

    // METHOD 4: .select() with limit 1
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .limit(1)
      
      results.methods.limit = {
        success: !error,
        data: data?.[0] || null,
        error: error?.message || null
      }
    } catch (err: any) {
      results.methods.limit = {
        success: false,
        data: null,
        error: err.message
      }
    }

    // METHOD 5: Check if the product exists at all
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('id', id)
      
      results.methods.exists = {
        success: !error,
        count: count || 0,
        error: error?.message || null
      }
    } catch (err: any) {
      results.methods.exists = {
        success: false,
        count: 0,
        error: err.message
      }
    }

    // Also get a sample product to verify the ID format
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug')
        .limit(3)
      
      results.sampleProducts = data || []
    } catch (err: any) {
      results.sampleProducts = []
      results.sampleError = err.message
    }

    return NextResponse.json(results)

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}