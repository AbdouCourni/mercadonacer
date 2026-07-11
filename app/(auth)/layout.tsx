// File: app/(auth)/layout.tsx
// Path: /app/(auth)/layout.tsx
// Description: Auth layout with back/close navigation (no header/footer)

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4 relative">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 max-w-[400px] mx-auto w-full">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/50 rounded-full">
          <ArrowLeft size={22} className="text-text-secondary" />
        </button>
        <Link href="/" className="p-2 hover:bg-white/50 rounded-full">
          <X size={22} className="text-text-secondary" />
        </Link>
      </div>

      {/* Logo */}
      <Link href="/" className="mb-6 flex items-center gap-2">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center">
          <span className="text-white font-bold text-lg md:text-xl">M</span>
        </div>
        <div>
          <span className="text-xl md:text-2xl font-bold text-primary">
            Mercado<span className="text-accent">Nacer</span>
          </span>
          <span className="text-[10px] md:text-xs block text-text-secondary">
            Votre supermarché en ligne
          </span>
        </div>
      </Link>

      {/* Auth Card */}
      <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-border max-w-[400px] mx-auto w-full">
        {children}
      </div>

      <p className="mt-6 text-xs text-text-secondary text-center">
        © 2024 MercadoNacer. Tous droits réservés.
      </p>
    </div>
  )
}