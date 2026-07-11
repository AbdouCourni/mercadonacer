import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    // Get user's role
    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles!inner (
          id,
          name,
          description
        )
      `)
      .eq('user_id', user.id)
      .maybeSingle()

    // Get all roles for debugging
    const { data: allRoles } = await supabase
      .from('roles')
      .select('*')

    // Get all user_roles for debugging
    const { data: allUserRoles } = await supabase
      .from('user_roles')
      .select('*')

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      userRoleData: userRoleData,
      allRoles: allRoles,
      allUserRoles: allUserRoles,
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}