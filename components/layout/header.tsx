'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  LogOut,
  UserCircle,
  ChevronDown,
  Package,
  LayoutDashboard,
  Heart as HeartIcon,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUser, signOut } from '@/services/auth.service'
import { getGuestCartCount, getGuestCart } from '@/services/cart.client.service'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [userRole, setUserRole] = useState('')


  // ============================================
  // FETCH CATEGORIES
  // ============================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name')

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([
          { id: '1', name: 'Fruits & Légumes', slug: 'fruits-et-legumes' },
          { id: '2', name: 'Viandes & Poissons', slug: 'viandes-et-poissons' },
          { id: '3', name: 'Épicerie', slug: 'epicerie' },
          { id: '4', name: 'Boissons', slug: 'boissons' },
          { id: '5', name: 'Maison & Cuisine', slug: 'maison-et-cuisine' },
          { id: '6', name: 'Électroménager', slug: 'electromenager' },
          { id: '7', name: 'Jeux & Jouets', slug: 'jeux-et-jouets' },
          { id: '8', name: 'Cosmétique & Beauté', slug: 'cosmetique-et-beaute' },
        ])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // ============================================
  // AUTH & CART - FIXED
  // ============================================

  const debugUserRole = async () => {
    try {
      console.log('🔍 [DEBUG] Starting role check...')

      // 1. Check if user is logged in
      const user = await getUser()
      console.log('👤 [DEBUG] User:', user?.email || 'Not logged in')

      if (!user) {
        console.log('❌ [DEBUG] No user found')
        return
      }

      // 2. Try to fetch role from API
      console.log('🔍 [DEBUG] Fetching role from /api/user/role...')
      try {
        const response = await fetch('/api/user/role')
        console.log('📡 [DEBUG] Role API status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('✅ [DEBUG] Role from API:', data.role)
          setUserRole(data.role)
          return
        } else {
          const errorText = await response.text()
          console.error('❌ [DEBUG] Role API error:', response.status, errorText)
        }
      } catch (err) {
        console.error('❌ [DEBUG] Role API fetch error:', err)
      }

      // 3. Fallback: Get role directly from Supabase
      console.log('🔍 [DEBUG] Fallback: Getting role directly from Supabase...')
      try {
        const supabase = createClient()
        const { data: userRoleData } = await supabase
          .from('user_roles')
          .select(`
          role_id,
          roles!inner (
            name
          )
        `)
          .eq('user_id', user.id)
          .maybeSingle()

        console.log('📊 [DEBUG] Direct role data:', JSON.stringify(userRoleData, null, 2))

        let role = 'user'
        if (userRoleData) {
          const rolesArray = userRoleData.roles as { name: string }[]
          if (rolesArray && rolesArray.length > 0) {
            role = rolesArray[0].name
          }
        }
        console.log('✅ [DEBUG] Role from direct query:', role)
        setUserRole(role)
      } catch (err) {
        console.error('❌ [DEBUG] Direct query error:', err)
      }
    } catch (error) {
      console.error('❌ [DEBUG] Debug function error:', error)
    }
  }

  // 🔥 Function to fetch cart count
  const fetchCartCount = async () => {
    try {
      const user = await getUser()
      let count = 0

      if (user) {
        // Logged in user - fetch from API
        const response = await fetch('/api/cart')
        if (response.ok) {
          const data = await response.json()
          count = data.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0
          console.log('📦 Cart count from API:', count)
        }
      } else {
        // 🔥 Guest user - get from localStorage
        count = getGuestCartCount()
        console.log('📦 Guest cart count from localStorage:', count)
        console.log('📦 Guest cart items:', getGuestCart())
      }

      console.log('📦 Setting cart count to:', count)
      setCartCount(count)
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

  // 🔥 Log when cartCount actually changes (this will show the updated value)
  useEffect(() => {
    console.log('🛒 cartCount state changed to:', cartCount)
  }, [cartCount])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getUser()
        setIsLoggedIn(!!user)
        if (user) {
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur')
          setUserEmail(user.email || '')
          await debugUserRole()
        }
      } catch (error) {
        console.error('Auth error:', error)
        setIsLoggedIn(false)
      }
    }

    checkAuth()
    fetchCartCount() // ✅ This runs on mount

    // Listen for cart updates
    const handleCartUpdate = () => {
      console.log('🔄 Cart update event received in header')
      fetchCartCount()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, []) // ✅ Empty dependency array - runs once on mount

  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('🔄 Cart update event received in header')
      fetchCartCount() // This should fetch the new count
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  // ============================================
  // SCROLL EFFECT
  // ============================================
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ============================================
  // CLOSE MOBILE MENU ON RESIZE
  // ============================================
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ============================================
  // HANDLERS
  // ============================================

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  const isCategoryActive = (slug: string) => {
    return pathname === `/categories/${slug}`
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-border/50'
          : 'bg-white border-b border-border/30'
        }`}
    >
      {/* Top bar */}
      <div className="hidden lg:block bg-gradient-to-r from-primary to-primary/90 text-white text-xs py-1.5">
        <div className="container-custom flex justify-between items-center">
         
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:underline hover:opacity-80 transition-opacity">
              À propos
            </Link>
            <span className="w-px h-4 bg-white/30" />
            <Link href="/contact" className="hover:underline hover:opacity-80 transition-opacity">
              Contact
            </Link>
            {isLoggedIn && (
              <>
                <span className="w-px h-4 bg-white/30" />
                <span className="opacity-80">👋 {userName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom py-2 md:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <span className="text-white font-bold text-lg md:text-xl">M</span>
            </div>
            <div>
              <span className="text-xl md:text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                Mercado<span className="text-accent">Nacer</span>
              </span>
              <span className="text-[10px] md:text-xs block text-text-secondary leading-tight">
                Votre supermarché en ligne
              </span>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-2.5 rounded-full border border-border bg-muted/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full p-2.5 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile search */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded-full transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} className="text-text-secondary" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist">
              <button className="hidden sm:block p-2 hover:bg-muted rounded-full transition-colors">
                <Heart size={20} className="text-text-secondary hover:text-primary transition-colors" />
              </button>
            </Link>

            {/* Auth / User */}
            {isLoggedIn ? (
              <div className="relative group">
                <button className="p-1.5 hover:bg-muted rounded-full transition-colors flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials(userName)}
                  </div>
                  <span className="text-sm hidden lg:inline text-text-primary max-w-[80px] truncate">
                    {userName}
                  </span>
                  <ChevronDown size={14} className="text-text-secondary hidden lg:block" />
                </button>

                {/* Dropdown */}
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
                    <p className="text-xs text-text-secondary truncate">{userEmail}</p>
                  </div>

                  {/* 🔥 Dashboard Link - For superadmin, admin, manager, employee */}
                  {['superadmin', 'admin', 'manager', 'employee'].includes(userRole) && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-sm font-medium text-primary">
                      <LayoutDashboard size={16} />
                      Tableau de bord
                    </Link>
                  )}

                  {/* 🔥 Driver Dashboard Link - For driver role only */}
                  {userRole === 'driver' && (
                    <Link href="/admin/driver/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-sm font-medium text-primary">
                      <Truck size={16} />
                      Mes livraisons
                    </Link>
                  )}

                  <Link href="/account" className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-sm">
                    <UserCircle size={16} />
                    Mon compte
                  </Link>
                  <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-sm">
                    <Package size={16} />
                    Mes commandes
                  </Link>
                  <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-sm">
                    <HeartIcon size={16} />
                    Ma liste d'envies
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm text-red-600 border-t border-border mt-1 pt-2"
                  >
                    <LogOut size={16} />
                    Se déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <User size={20} className="text-text-secondary hover:text-primary transition-colors" />
                </button>
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative inline-flex items-center p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ShoppingCart size={20} className="text-text-secondary hover:text-primary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md px-1.5 z-10">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden mt-3 animate-slideDown">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-2.5 rounded-full border border-border bg-muted/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full p-2.5 hover:scale-105 transition-all duration-300 shadow-md"
              >
                <Search size={18} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Category Navigation */}
      <nav className="hidden lg:block border-t border-border/50 bg-muted/20">
        <div className="container-custom">
          <ul className="flex items-center gap-1 text-sm py-2 overflow-x-auto">
            <li>
              <Link
                href="/"
                className={`px-4 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${pathname === '/'
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'text-text-secondary hover:text-primary hover:bg-primary/10'
                  }`}
              >
                Accueil
              </Link>
            </li>
            {loadingCategories ? (
              Array.from({ length: 6 }).map((_, i) => (
                <li key={i}>
                  <div className="px-4 py-1.5 rounded-full bg-muted animate-pulse h-8 w-20" />
                </li>
              ))
            ) : (
              categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className={`px-4 py-1.5 rounded-full transition-colors whitespace-nowrap ${isCategoryActive(cat.slug)
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'text-text-secondary hover:text-primary hover:bg-primary/10'
                      }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))
            )}
            {categories.length > 8 && (
              <li>
                <Link
                  href="/categories"
                  className={`px-4 py-1.5 rounded-full transition-colors whitespace-nowrap ${pathname === '/categories'
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'text-text-secondary hover:text-primary hover:bg-primary/10'
                    }`}
                >
                  Plus...
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-[72px] md:top-[80px] left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto animate-slideRight">
            <div className="p-4 space-y-6">
              {isLoggedIn && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center text-white font-bold">
                    {getInitials(userName)}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{userName}</p>
                    <p className="text-xs text-text-secondary">{userEmail}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-bold text-text-primary mb-3 text-lg">Catégories</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/"
                    className={`px-4 py-3 rounded-xl text-sm transition-colors ${pathname === '/'
                        ? 'bg-primary text-white'
                        : 'bg-muted hover:bg-primary/10 hover:text-primary'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Accueil
                  </Link>
                  {loadingCategories ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="px-4 py-3 bg-muted rounded-xl animate-pulse h-11" />
                    ))
                  ) : (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className={`px-4 py-3 rounded-xl text-sm transition-colors ${isCategoryActive(cat.slug)
                            ? 'bg-primary text-white'
                            : 'bg-muted hover:bg-primary/10 hover:text-primary'
                          }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
  {isLoggedIn ? (
    <>
      {/* Dashboard Link - For superadmin, admin, manager, employee */}
      {['superadmin', 'admin', 'manager', 'employee'].includes(userRole) && (
        <Link
          href="/admin"
          className="flex items-center gap-2 py-2 text-primary font-medium hover:text-primary/80 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          <LayoutDashboard size={18} />
          Tableau de bord
        </Link>
      )}

      {/* 🔥 Driver Dashboard Link - For driver role only */}
      {userRole === 'driver' && (
        <Link
          href="/admin/driver/orders"
          className="flex items-center gap-2 py-2 text-primary font-medium hover:text-primary/80 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          <Truck size={18} />
          Mes livraisons
        </Link>
      )}

      <Link
        href="/account"
        className="flex items-center gap-2 py-2 text-text-secondary hover:text-primary transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        <UserCircle size={18} />
        Mon compte
      </Link>
      <Link
        href="/account/orders"
        className="flex items-center gap-2 py-2 text-text-secondary hover:text-primary transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        <Package size={18} />
        Mes commandes
      </Link>
      <Link
        href="/wishlist"
        className="flex items-center gap-2 py-2 text-text-secondary hover:text-primary transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        <HeartIcon size={18} />
        Ma liste d'envies
      </Link>
      <button
        onClick={() => {
          handleLogout()
          setIsMenuOpen(false)
        }}
        className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700 transition-colors w-full"
      >
        <LogOut size={18} />
        Se déconnecter
      </button>
    </>
  ) : (
    <>
      <Link
        href="/login"
        className="block py-2 text-text-secondary hover:text-primary transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        Se connecter
      </Link>
      <Link
        href="/register"
        className="block py-2 text-primary font-medium hover:text-primary/80 transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        Créer un compte
      </Link>
    </>
  )}
  <Link
    href="/about"
    className="block py-2 text-text-secondary hover:text-primary transition-colors"
    onClick={() => setIsMenuOpen(false)}
  >
    À propos
  </Link>
  <Link
    href="/contact"
    className="block py-2 text-text-secondary hover:text-primary transition-colors"
    onClick={() => setIsMenuOpen(false)}
  >
    Contact
  </Link>
</div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}