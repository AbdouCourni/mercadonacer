// File: app/api/wishlist/check/route.ts
// Path: /app/api/wishlist/check/route.ts
// Description: Check if product is in wishlist

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options: any) {
          (await cookieStore).set({ name, value, ...options })
        },
        async remove(name: string, options: any) {
          (await cookieStore).set({ name, value: '', ...options })
        },
      },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        inWishlist: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      inWishlist: !!data,
      wishlistId: data?.id || null
    })
  } catch (error) {
    console.error('GET /api/wishlist/check error:', error)
    return NextResponse.json(
      { error: 'Failed to check wishlist' },
      { status: 500 }
    )
  }
}