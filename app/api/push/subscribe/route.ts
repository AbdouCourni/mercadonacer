// File: app/api/push/subscribe/route.ts
// Path: /app/api/push/subscribe/route.ts
// Description: Save push subscription to database

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse subscription
    const body = await request.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // 3. Upsert subscription (update if endpoint exists)
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: request.headers.get('user-agent') || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'endpoint',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Failed to save subscription:', error)
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      )
    }

    console.log('✅ Push subscription saved for user:', user.id)

    return NextResponse.json({
      success: true,
      subscription: {
        id: data.id,
        endpoint: data.endpoint,
      },
    })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}