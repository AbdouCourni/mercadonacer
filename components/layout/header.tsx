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
  Home,
  Grid3x3,
  Tag,
  Info,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUser, signOut } from '@/services/auth.service'
import { getGuestCartCount } from '@/services/cart.client.service'
import { createClient } from '@/lib/supabase/client'
import { isVitrineMode } from '@/lib/site-mode'

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
  // FETCH CATEGORIES (ordered by importance)
  // ============================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClient()

        // Fetch categories with product counts, ordered by display_order
        const { data, error } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            slug,
            display_order,
            products:products(count)
          `)
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true })

        if (error) throw error

        // Filter: only categories with at least 1 active product, or high priority
        const filtered = (data || [])
          .filter((cat: any) => {
            const count = cat.products?.[0]?.count || 0
            return count > 0 || (cat.display_order && cat.display_order <= 10)
          })
          .map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
          }))

        setCategories(filtered)
      } catch (error: any) {
        console.error('Error fetching categories:', error?.message)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // ============================================
  // USER ROLE
  // ============================================
  const fetchUserRole = async () => {
    try {
      const user = await getUser()
      if (!user) return

      const response = await fetch('/api/user/role')
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.role || '')
        return
      }

      // Fallback
      const supabase = createClient()
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles!inner (name)
        `)
        .eq('user_id', user.id)
        .maybeSingle()

      let role = 'user'
      if (userRoleData) {
        const rolesArray = userRoleData.roles as { name: string }[]
        if (rolesArray?.length > 0) role = rolesArray[0].name
      }
      setUserRole(role)
    } catch (err) {
      console.error('Role fetch error:', err)
    }
  }

  // ============================================
  // CART COUNT (skipped in vitrine mode)
  // ============================================
  const fetchCartCount = async () => {
    if (isVitrineMode()) {
      setCartCount(0)
      return
    }

    try {
      const user = await getUser()
      let count = 0

      if (user) {
        const response = await fetch('/api/cart')
        if (response.ok) {
          const data = await response.json()
          count = data.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0
        }
      } else {
        count = getGuestCartCount()
      }

      setCartCount(count)
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

  // ============================================
  // AUTH CHECK
  // ============================================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getUser()
        setIsLoggedIn(!!user)
        if (user) {
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur')
          setUserEmail(user.email || '')
          await fetchUserRole()
        }
      } catch (error) {
        console.error('Auth error:', error)
        setIsLoggedIn(false)
      }
    }

    checkAuth()
    fetchCartCount()

    const handleCartUpdate = () => fetchCartCount()
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  // ============================================
  // SCROLL EFFECT
  // ============================================
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ============================================
  // CLOSE MOBILE MENU ON RESIZE
  // ============================================
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ============================================
  // CLOSE MOBILE MENU ON ROUTE CHANGE
  // ============================================
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  // ============================================
  // TOP NAV LINKS (modern e-commerce standard)
  // ============================================
  const navLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/products', label: 'Produits', icon: Package },
    { href: '/categories', label: 'Catégories', icon: Grid3x3 },
{ href: '/promotions', label: 'Promotions', icon: Tag },
    { href: '/about', label: 'À propos', icon: Info },
    { href: '/contact', label: 'Contact', icon: Phone },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-border/50'
          : 'bg-white border-b border-border/30'
      }`}
    >
      {/* ============================================
          TOP BAR (desktop only)
          ============================================ */}
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
            <span className="w-px h-4 bg-white/30" />
            <Link href="/delivery" className="hover:underline hover:opacity-80 transition-opacity">
              Livraison 24-48h
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="opacity-90">💬 Commander via WhatsApp</span>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN HEADER
          ============================================ */}
      <div className="container-custom py-2 md:py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
  {/* Logo image */}
  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary to-accent-2">
    {/* Fallback: gradient with M if logo fails to load */}
    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg md:text-xl">
      M
    </span>
    {/* Logo image (layered on top) */}
    <img
      src="/logo.png"
      alt="Mercado Nacer"
      className="relative z-10 w-full h-full object-contain"
    />
  </div>

  <div className="hidden sm:block">
    <span className="text-lg md:text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">
      Mercado<span className="text-accent">Nacer</span>
    </span>
    <span className="text-[10px] md:text-xs block text-text-secondary leading-tight">
      Votre supermarché en ligne
    </span>
  </div>
</Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2">
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
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full p-2.5 hover:scale-105 transition-all duration-300 shadow-md"
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

            {/* Wishlist — hidden in vitrine mode */}
            {!isVitrineMode() && (
              <Link href="/wishlist">
                <button className="hidden sm:block p-2 hover:bg-muted rounded-full transition-colors">
                  <Heart size={20} className="text-text-secondary hover:text-primary transition-colors" />
                </button>
              </Link>
            )}

            {/* Auth / User — hidden in vitrine mode */}
            {!isVitrineMode() && (
              isLoggedIn ? (
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

                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
                      <p className="text-xs text-text-secondary truncate">{userEmail}</p>
                    </div>

                    {['superadmin', 'admin', 'manager', 'employee'].includes(userRole) && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-sm font-medium text-primary">
                        <LayoutDashboard size={16} />
                        Tableau de bord
                      </Link>
                    )}

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
              )
            )}

            {/* Cart — hidden in vitrine mode */}
            {!isVitrineMode() && (
              <Link href="/cart" className="relative inline-flex items-center p-2 hover:bg-muted rounded-full transition-colors">
                <ShoppingCart size={20} className="text-text-secondary hover:text-primary transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md px-1.5 z-10">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
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
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full p-2.5"
              >
                <Search size={18} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ============================================
          DESKTOP NAV — modern simplified links
          ============================================ */}
      <nav className="hidden lg:block border-t border-border/50 bg-muted/20">
        <div className="container-custom">
          <ul className="flex items-center gap-1 text-sm py-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-4 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      active
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'text-text-secondary hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <Icon size={14} />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* ============================================
          MOBILE MENU
          ============================================ */}
      {isMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-[72px] md:top-[80px] left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Logged-in user card — hidden in vitrine */}
              {isLoggedIn && !isVitrineMode() && (
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

              {/* Main nav links */}
              <div>
                <h3 className="font-bold text-text-primary mb-3 text-lg">Navigation</h3>
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.href)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                          active
                            ? 'bg-primary text-white'
                            : 'bg-muted hover:bg-primary/10 hover:text-primary'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon size={18} />
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <h3 className="font-bold text-text-primary mb-3 text-lg">Catégories populaires</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 8).map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className={`px-4 py-3 rounded-xl text-sm transition-colors ${
                          isActive(`/categories/${cat.slug}`)
                            ? 'bg-primary text-white'
                            : 'bg-muted hover:bg-primary/10 hover:text-primary'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Account links (commerce mode only) */}
              {!isVitrineMode() && isLoggedIn && (
                <div className="border-t border-border pt-4 space-y-3">
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
                </div>
              )}

              {/* Footer links */}
              <div className="border-t border-border pt-4 space-y-3">
                <Link
                  href="/about"
                  className="block py-2 text-text-secondary hover:text-primary transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  À propos
                </Link>
                <Link
                  href="/contact"
                  className="block py-2 text-text-secondary hover:text-primary transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  href="/delivery"
                  className="block py-2 text-text-secondary hover:text-primary transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Livraison
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}