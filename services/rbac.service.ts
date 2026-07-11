// File: services/rbac.service.ts
// Path: /services/rbac.service.ts
// Description: Role-Based Access Control - WORKING VERSION

import { createClient } from '@/lib/supabase/server'

export type Role = 'superadmin' | 'admin' | 'manager' | 'user'

// ============================================
// GET USER ROLE - DIRECT FROM SERVER
// ============================================

export async function getCurrentUserRole(): Promise<Role> {
  try {
    const supabase = await createClient()
    
    // Get current user from server
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('No user logged in (server)')
      return 'user'
    }
    
    // Get user's role using the working query
    const { data: userRoleData, error: roleError } = await supabase
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
    
    if (roleError || !userRoleData) {
      console.log('No role found for user:', user.id)
      return 'user'
    }
    
    // Extract role name
    const role = (userRoleData as any).roles?.name || 'user'
    console.log('✅ Found role:', role, 'for user:', user.email)
    return role as Role
  } catch (error) {
    console.error('Error getting current user role:', error)
    return 'user'
  }
}

// ============================================
// ROLE CHECKS
// ============================================

export async function requireManager() {
  const role = await getCurrentUserRole()
  console.log('🔒 requireManager - User role:', role)
  const allowedRoles = ['superadmin', 'admin', 'manager']
  if (!allowedRoles.includes(role)) {
    throw new Error(`Access denied. User role "${role}" not in allowed roles: ${allowedRoles.join(', ')}`)
  }
  console.log('✅ Access granted for role:', role)
  return true
}

export async function requireAdmin() {
  const role = await getCurrentUserRole()
  const allowedRoles = ['superadmin', 'admin']
  if (!allowedRoles.includes(role)) {
    throw new Error(`Access denied. User role "${role}" not in allowed roles: ${allowedRoles.join(', ')}`)
  }
  return true
}

export async function requireSuperAdmin() {
  const role = await getCurrentUserRole()
  if (role !== 'superadmin') {
    throw new Error(`Access denied. User role "${role}" is not superadmin`)
  }
  return true
}

// ============================================
// PERMISSION CHECKS
// ============================================

export async function hasDashboardAccess(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return ['superadmin', 'admin', 'manager'].includes(role)
}

export async function canManageProducts(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return ['superadmin', 'admin', 'manager'].includes(role)
}

export async function canManageOrders(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return ['superadmin', 'admin', 'manager'].includes(role)
}

export async function canManageUsers(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return ['superadmin', 'admin'].includes(role)
}

export async function canViewAnalytics(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return ['superadmin', 'admin'].includes(role)
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'superadmin'
}

export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'admin' || role === 'superadmin'
}

export async function isManager(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'manager' || role === 'admin' || role === 'superadmin'
}