// File: app/api/test-signup/route.ts
// Path: /app/api/test-signup/route.ts
// Description: Test signup directly

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    console.log('🧪 Test signup:', { email, fullName })

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
      },
    })

    if (error) {
      console.error('❌ Test signup error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 400 })
    }

    console.log('✅ Test signup success:', data)
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error: any) {
    console.error('❌ Test signup exception:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 })
  }
}

// Add GET method to test if route exists
export async function GET() {
  return NextResponse.json({
    message: 'Test signup API is working',
    method: 'POST with email, password, fullName'
  })
}