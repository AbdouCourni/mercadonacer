// File: services/user-role.service.ts
// Path: /services/user-role.service.ts
// Description: User role management service (Admin only)

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from './rbac.service'

export interface UserWithRole {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  last_sign_in_at: string
}

// ============================================
// GET ALL USERS WITH ROLES
// ============================================

export async function getUsersWithRoles(): Promise<UserWithRole[]> {
  await requireAdmin()
  
  const supabase = createClient()

  // Get all users from auth
  const { data: users, error } = await (await supabase).auth.admin.listUsers()

  if (error) throw error

  // Get all user roles
  const { data: userRoles, error: roleError } = await (await supabase)
    .from('user_roles')
    .select('user_id, roles(name)')

  if (roleError) throw roleError

  // Create a map of user_id -> role
  const roleMap = new Map()
  userRoles.forEach((ur: any) => {
    roleMap.set(ur.user_id, ur.roles?.name || 'user')
  })

  // Combine data
  return users.users.map((user) => ({
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    role: roleMap.get(user.id) || 'user',
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at || ''
  }))
}

// ============================================
// ASSIGN ROLE TO USER
// ============================================

export async function assignRole(userId: string, roleName: string): Promise<void> {
  await requireAdmin()

  const supabase = createClient()

  // Get role id
  const { data: role, error: roleError } = await (await supabase)
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single()

  if (roleError) throw new Error('Role not found')

  // Delete existing role assignments
  await (await supabase)
    .from('user_roles')
    .delete()
    .eq('user_id', userId)

  // Assign new role
  const { error } = await (await supabase)
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: role.id
    })

  if (error) throw error
}

// ============================================
// REMOVE USER (Admin only)
// ============================================

export async function deleteUser(userId: string): Promise<void> {
  await requireAdmin()

  const supabase = createClient()

  // Delete from auth (cascades to profiles)
  const { error } = await (await supabase).auth.admin.deleteUser(userId)

  if (error) throw error
}