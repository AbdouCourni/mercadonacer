// File: components/admin/sidebar.tsx
// Path: /components/admin/sidebar.tsx
// Description: admin sidebar navigation - Fixed active state

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  BarChart3,
  FolderOpen,
  Truck,
  ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/services/auth.service'

interface SidebarProps {
  userRole: string
  userName: string
}

const navItems = [
  {
    name: 'Tableau de bord',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['superadmin', 'admin', 'manager', 'employee']
  },
  {
    name: 'Produits',
    href: '/admin/products',
    icon: Package,
    roles: ['superadmin', 'admin', 'manager']
  },
  {
    name: 'Catégories',
    href: '/admin/categories',
    icon: FolderOpen,
    roles: ['superadmin', 'admin', 'manager']
  },
  {
    name: 'Commandes',
    href: '/admin/orders',
    icon: ShoppingBag,
    roles: ['superadmin', 'admin', 'manager']
  },
  {
    name: 'Mes Commandes',
    href: '/admin/employee/orders',
    icon: ClipboardList,
    roles: ['employee']
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    roles: ['superadmin', 'admin']
  },
  {
    name: 'Livreurs',
    href: '/admin/delivery',
    icon: Truck,
    roles: ['superadmin', 'admin', 'manager']
  },
  {
    name: 'Analyses',
    href: '/admin/analytics',
    icon: BarChart3,
    roles: ['superadmin', 'admin']
  },
  {
    name: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
    roles: ['superadmin', 'admin', 'manager']
  }
]

export function DashboardSidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsOpen(true)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // 🔥 FIX: Check if the current path exactly matches or is a child
  const isActive = (href: string) => {
    if (href === '/admin') {
      // Dashboard is only active when exactly on /dashboard
      return pathname === '/admin'
    }
    // Other pages are active when they start with the href
    return pathname?.startsWith(href)
  }

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole as any)
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] bg-white border-r border-border flex flex-col transition-transform duration-300",
          isMobile && !isOpen && "-translate-x-full",
          isMobile && isOpen && "translate-x-0",
          !isMobile && "translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-bold text-primary">
              Mercado<span className="text-accent">....</span>
            </span>
          </Link>
          
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-muted rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center text-white font-bold text-sm">
              {getInitials(userName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">{userName}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary capitalize">{userRole}</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full",
                  userRole === 'superadmin' && "bg-purple-100 text-purple-700",
                  userRole === 'admin' && "bg-blue-100 text-blue-700",
                  userRole === 'manager' && "bg-green-100 text-green-700",
                  userRole === 'employee' && "bg-orange-100 text-orange-700"
                )}>
                  {userRole === 'superadmin' ? '👑' : 
                   userRole === 'admin' ? '⚡' : 
                   userRole === 'manager' ? '📋' : 
                   userRole === 'employee' ? '🛠️' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-muted transition-colors mb-2"
          >
            <Home size={18} />
            <span className="text-sm">Retour à la boutique</span>
          </Link>

          <div className="h-px bg-border my-2" />

          {filteredNavItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  active
                    ? "bg-primary text-white font-medium"
                    : "text-text-secondary hover:bg-muted hover:text-text-primary"
                )}
              >
                <Icon size={18} className={active ? "text-white" : ""} />
                <span className="text-sm flex-1">{item.name}</span>
                {active && <ChevronRight size={16} className="text-white" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Se déconnecter</span>
          </button>
          
          <div className="text-xs text-text-secondary text-center">
            v1.0.0 · {userRole}
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      {isMobile && (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border px-4 h-16 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>
          
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-bold text-primary">
              Mercado<span className="text-accent">....</span>
            </span>
          </Link>

          <div className="w-10" />
        </header>
      )}
    </>
  )
}