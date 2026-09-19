// File: app/auth/callback/route.ts
// Path: /app/auth/callback/route.ts
// Description: Auth callback for OAuth providers

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mergeGuestCart } from '@/services/cart.client.service'
import { getUser } from '@/services/auth.service'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    
    // 🔥 After successful OAuth login, merge guest cart
    const user = await getUser()
    if (user) {
      await mergeGuestCart(user.id)
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}