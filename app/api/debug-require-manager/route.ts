// import { NextResponse } from 'next/server'
// import { requireManager, getCurrentUserRole } from '@/services/rbac.service'
// import { getUser } from '@/services/auth.service'

// export async function GET() {
//   try {
//     // Check user first
//     const user = await getUser()
//     console.log('👤 User from auth:', user?.email || 'Not logged in')
    
//     // Get role
//     const role = await getCurrentUserRole()
//     console.log('🔑 Role from service:', role)
    
//     // Try requireManager
//     await requireManager()
    
//     return NextResponse.json({
//       success: true,
//       user: user?.email || null,
//       role: role,
//       message: 'User has manager access'
//     })
//   } catch (error) {
//     console.error('Debug error:', error)
//     const role = await getCurrentUserRole().catch(() => 'unknown')
//     return NextResponse.json({
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error',
//       role: role
//     }, { status: 403 })
//   }
// }