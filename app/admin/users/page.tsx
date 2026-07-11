// File: app/(dashboard)/dashboard/users/page.tsx
// Path: /app/(dashboard)/dashboard/users/page.tsx
// Description: User management for admin

'use client'

import { useState, useEffect } from 'react'
import { Search, UserPlus, Edit, Trash2, Loader2, Shield, User, Truck, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  is_active: boolean
  points: number
  created_at: string
  employee_shop_id: string | null
  driver_zone: string | null
}

interface Shop {
  id: string
  name: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
  try {
    // Fetch users
    const usersRes = await fetch('/api/dashboard/users')
    if (usersRes.ok) {
      const data = await usersRes.json()
      setUsers(data.users || [])
    }

    // Fetch shops (optional - handle 404 gracefully)
    try {
      const shopsRes = await fetch('/api/shops')
      if (shopsRes.ok) {
        const data = await shopsRes.json()
        setShops(data.shops || [])
      }
    } catch (error) {
      console.log('Shops not available yet')
      setShops([])
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    setLoading(false)
  }
}
    fetchData()
  }, [])

  const updateRole = async (userId: string, newRole: string) => {
  try {
    console.log('🔧 Updating role:', { userId, newRole })
    
    const response = await fetch(`/api/dashboard/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ))
      console.log('✅ Role updated successfully')
    } else {
      console.error('❌ Error updating role:', data.error)
      alert(data.error || 'Failed to update role')
    }
  } catch (error) {
    console.error('❌ Error updating role:', error)
    alert('Failed to update role')
  }
}

  const toggleActive = async (userId: string, currentStatus: boolean) => {
  try {
    console.log('🔧 Toggling user:', { userId, currentStatus })
    
    const newStatus = !currentStatus
    
    const response = await fetch(`/api/dashboard/users/${userId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: newStatus })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: newStatus } : u
      ))
      console.log('✅ User toggled successfully')
    } else {
      console.error('❌ Error toggling user:', data.error)
      alert(data.error || 'Failed to toggle user')
    }
  } catch (error) {
    console.error('❌ Error toggling user:', error)
    alert('Failed to toggle user')
  }
}

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      superadmin: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      manager: 'bg-green-100 text-green-700',
      employee: 'bg-orange-100 text-orange-700',
      driver: 'bg-cyan-100 text-cyan-700',
      client: 'bg-gray-100 text-gray-700'
    }
    return styles[role] || styles.client
  }

  const getRoleIcon = (role: string) => {
    const icons: Record<string, any> = {
      superadmin: Shield,
      admin: Shield,
      manager: Shield,
      employee: Package,
      driver: Truck,
      client: User
    }
    const Icon = icons[role] || User
    return <Icon size={14} />
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Utilisateurs</h1>
          <p className="text-text-secondary text-sm">
            {users.length} utilisateur{users.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <UserPlus size={18} className="mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <User size={48} className="mx-auto text-text-secondary/30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary">Aucun utilisateur</h3>
            <p className="text-text-secondary">Commencez par ajouter votre premier utilisateur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Rôle</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Points</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Statut</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-text-primary">{user.full_name || 'Sans nom'}</p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                        {user.phone && <p className="text-xs text-text-secondary">{user.phone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full inline-flex items-center gap-1",
                        getRoleBadge(user.role)
                      )}>
                        {getRoleIcon(user.role)}
                        {user.role || 'client'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-primary">
                      {user.points || 0} pts
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="client">Client</option>
                          <option value="employee">Employé</option>
                          <option value="driver">Livreur</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                        <button
                          onClick={() => toggleActive(user.id, user.is_active)}
                          className={cn(
                            "text-xs px-2 py-1 rounded border",
                            user.is_active ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"
                          )}
                        >
                          {user.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}