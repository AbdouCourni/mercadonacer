// File: app/(auth)/login/page.tsx
// Path: /app/(auth)/login/page.tsx
// Description: Login page with guest cart merge

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/ui/google-icon'
import { signIn, signInWithGoogle, getUser } from '@/services/auth.service'
import { mergeGuestCart } from '@/services/cart.client.service'
export const dynamic = 'force-dynamic'


export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check for registration success
  useEffect(() => {
    if (searchParams.get('registered')) {
      setSuccess('Compte créé avec succès ! Connectez-vous maintenant.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Veuillez entrer votre email')
      return
    }

    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe')
      return
    }

    setLoading(true)

    try {
      await signIn(email, password)
      
      // 🔥 After successful login, merge guest cart
      const user = await getUser()
      if (user) {
        await mergeGuestCart(user.id)
        window.dispatchEvent(new Event('cartUpdated'))
      }
      
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      // 🔥 Note: Google sign-in redirects, so cart merge happens in callback route
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion avec Google')
      setLoading(false)
    }
  }

  return (
   <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 border border-border max-w-[400px] mx-auto w-full">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Mail size={28} className="sm:w-8 sm:h-8 text-primary" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          Bienvenue
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Connectez-vous à votre compte MercadoNacer
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Email
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              placeholder="votre@email.com"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              placeholder="Votre mot de passe"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-primary text-white hover:bg-primary/90 transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-text-secondary">ou</span>
        </div>
      </div>

      {/* Google Sign In */}
      <Button
        onClick={handleGoogleSignIn}
        variant="outline"
        size="lg"
        className="w-full border-border hover:bg-muted transition-colors text-sm sm:text-base"
        disabled={loading}
      >
        <GoogleIcon className="mr-2 w-5 h-5" />
        Se connecter avec Google
      </Button>

      {/* Register Link */}
      <p className="text-center text-sm text-text-secondary mt-6">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}