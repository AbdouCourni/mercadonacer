// File: app/(admin)/layout.tsx
// Path: /app/(admin)/layout.tsx
// Description: Admin layout

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { getUser } from '@/services/auth.service'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [userRole, setUserRole] = useState('user')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getUser()
        if (!user) {
          router.push('/login')
          setLoading(false)
          return
        }

        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur')

        const response = await fetch('/api/user/role')
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.role || 'user')
        }
        
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <DashboardSidebar userRole={userRole} userName={userName} />
      <div className="flex-1 min-w-0">
        <main className="pt-16 lg:pt-0">

          {children}
        </main>
      </div>
    </div>
  )
}