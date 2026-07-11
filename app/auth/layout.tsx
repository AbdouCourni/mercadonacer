// File: app/(auth)/layout.tsx
// Path: /app/(auth)/layout.tsx
// Description: Auth layout without header/footer, with back navigation

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const goBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4 relative">
      {/* Navigation Bar - Top */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 max-w-[400px] mx-auto w-full">
        {/* Back Arrow */}
        <button
          onClick={goBack}
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft size={22} className="text-text-secondary hover:text-primary transition-colors" />
        </button>

        {/* Close / Home Button */}
        <Link
          href="/"
          className="p-2 hover:bg-white/50 rounded-full transition-colors"
          aria-label="Accueil"
        >
          <X size={22} className="text-text-secondary hover:text-primary transition-colors" />
        </Link>
      </div>

      {/* Logo */}
      <Link href="/" className="mb-6 flex items-center gap-2 group">
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

      {/* Auth Card */}
      <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-border max-w-[400px] mx-auto w-full">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-text-secondary text-center">
        © 2024 MercadoNacer. Tous droits réservés.
      </p>
    </div>
  )
}