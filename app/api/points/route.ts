// File: app/api/points/route.ts
// Path: /app/api/points/route.ts
// Description: Points system API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/services/auth.server'

// GET - Get user points and history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile with points
    const { data: profile } = await supabase
      .from('profiles')
      .select('points, total_points_earned, points_last_reset')
      .eq('id', user.id)
      .single()

    // Get points history
    const { data: history } = await supabase
      .from('points_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get available rewards
    const { data: rewards } = await supabase
      .from('points_rewards')
      .select('*')
      .eq('is_active', true)

    return NextResponse.json({
      points: profile?.points || 0,
      total_earned: profile?.total_points_earned || 0,
      history: history || [],
      rewards: rewards || []
    })
  } catch (error) {
    console.error('Points API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points' },
      { status: 500 }
    )
  }
}

// POST - Add points to user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { userId, points, description, orderId } = body

    // Get current points
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single()

    const newPoints = (profile?.points || 0) + points

    // Update profile
    await supabase
      .from('profiles')
      .update({ 
        points: newPoints,
        total_points_earned: supabase.rpc('increment', { 
          column: 'total_points_earned', 
          amount: points > 0 ? points : 0 
        })
      })
      .eq('id', userId)

    // Add to history
    await supabase
      .from('points_history')
      .insert({
        user_id: userId,
        points: points,
        type: points > 0 ? 'earned' : 'used',
        description: description || (points > 0 ? 'Points gagnés' : 'Points utilisés'),
        order_id: orderId || null
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Add points error:', error)
    return NextResponse.json(
      { error: 'Failed to add points' },
      { status: 500 }
    )
  }
}