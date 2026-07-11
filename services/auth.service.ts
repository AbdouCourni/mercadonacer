// File: services/auth.service.ts
// Path: /services/auth.service.ts
// Description: Authentication service - FIXED

import { createClient as createBrowserClient, createClient } from '@/lib/supabase/client'

// Create a single instance for browser
const supabase = createBrowserClient()

// ============================================
// GET USER - Graceful error handling
// ============================================

export async function getUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    
    // If there's an error (like no session), just return null
    if (error) {
      // This is expected for guest users, don't log as error
      if (error.message?.includes('Auth session missing')) {
        return null
      }
      console.warn('getUser warning:', error.message)
      return null
    }
    
    return data.user
  } catch (error) {
    // Catch any unexpected errors
    console.warn('getUser unexpected error:', error)
    return null
  }
}

// ============================================
// GET SESSION - Graceful error handling
// ============================================

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      if (error.message?.includes('Auth session missing')) {
        return null
      }
      console.warn('getSession warning:', error.message)
      return null
    }
    
    return data.session
  } catch (error) {
    console.warn('getSession unexpected error:', error)
    return null
  }
}

// ============================================
// CHECK IF USER IS AUTHENTICATED
// ============================================

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return !!user
}

// ============================================
// SIGN UP - FIXED
// ============================================

// ============================================
// SIGN UP - FIXED
// ============================================

export async function signUp(email: string, password: string, fullName?: string) {
  try {
    const supabase = createClient()

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`

    console.log('📝 Signup data:', { email, fullName })
    console.log('🔗 Redirect URL:', redirectUrl)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      console.error('❌ Supabase error:', error)
      throw new Error(error.message)
    }

    console.log('✅ Signup success:', data)
    return data

  } catch (error: any) {
    console.error('❌ Signup failed:', error)
    throw error
  }
}

// ============================================
// SIGN IN - FIXED
// ============================================

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Signin error:', error)
    throw error
  }
}

// ============================================
// SIGN OUT
// ============================================

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Signout error:', error)
    throw error
  }
}

// ============================================
// PROFILE MANAGEMENT
// ============================================

export async function updateProfile(profileData: {
  full_name?: string
  phone?: string
  address?: string
  city?: string
}) {
  try {
    const user = await getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Update profile error:', error)
    throw error
  }
}

export async function getProfile() {
  try {
    const user = await getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Get profile error:', error)
    return null
  }
}

// ============================================
// GOOGLE OAUTH
// ============================================

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Google signin error:', error)
    throw error
  }
}