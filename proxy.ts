// File: proxy.ts
// Path: /proxy.ts
// Description: Working proxy with correct role fetching

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  console.log('🚪 [PROXY] Request received:', request.nextUrl.pathname)
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('👤 [PROXY] User:', user?.email || 'Not logged in')

  // ============================================
  // 🟢 PUBLIC ROUTES
  // ============================================
  const publicRoutes = [
    '/',
    '/products',
    '/categories',
    '/about',
    '/contact',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/cart',
    '/wishlist',
    '/test-page',
    '/api/auth',
    '/api/products',
    '/api/categories',
    '/api/cart',
    '/api/user/role',
    '/auth/callback',
    '/order/[id]',
    '/privacy',
    '/terms',
    '/legal',
    '/refund',
    '/delivery',
  ]
  
  const isPublic = publicRoutes.some((route) => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/products/') ||
    request.nextUrl.pathname.startsWith('/categories/') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  )

  if (isPublic) {
    console.log('✅ [PROXY] Public route, allowing access')
    return supabaseResponse
  }

  // ============================================
  // 🔴 PROTECTED ROUTES
  // ============================================
  
  if (!user) {
    console.log('❌ [PROXY] No user, redirecting to login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ============================================
  // 🟠 ADMIN ROUTES - CORRECT ROLE FETCHING
  // ============================================
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔍 [PROXY] Admin access check for:', request.nextUrl.pathname)
    
    try {
      // ✅ Step 1: Get role_id
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .maybeSingle()

      let role = 'user'
      
      if (userRoleData?.role_id) {
        // ✅ Step 2: Get role name
        const { data: roleData } = await supabase
          .from('roles')
          .select('name')
          .eq('id', userRoleData.role_id)
          .maybeSingle()

        if (roleData?.name) {
          role = roleData.name
        }
      }

      console.log('👤 [PROXY] User role:', role)

      const allowedRoles = ['superadmin', 'admin', 'manager', 'employee','driver']
      
      if (!allowedRoles.includes(role)) {
        console.log('❌ [PROXY] Access denied for role:', role)
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }

      console.log('✅ [PROXY] Admin access granted for role:', role)
      
    } catch (error) {
      console.error('❌ [PROXY] Error checking role:', error)
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  console.log('✅ [PROXY] Allowing access to:', request.nextUrl.pathname)
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}