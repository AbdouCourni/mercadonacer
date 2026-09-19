// File: app/(auth)/register/page.tsx
// Path: /app/(auth)/register/page.tsx
// Description: Registration page - Mobile-first responsive

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/ui/google-icon'
import { signUp, signInWithGoogle } from '@/services/auth.service'
import { mergeGuestCart } from '@/services/cart.client.service'
import { getUser } from '@/services/auth.service'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setLoading(true)

  // Validate
  if (!fullName.trim()) {
    setError('Veuillez entrer votre nom complet')
    setLoading(false)
    return
  }

  if (!email.trim()) {
    setError('Veuillez entrer votre email')
    setLoading(false)
    return
  }

  if (password.length < 6) {
    setError('Le mot de passe doit contenir au moins 6 caractères')
    setLoading(false)
    return
  }

  if (password !== confirmPassword) {
    setError('Les mots de passe ne correspondent pas')
    setLoading(false)
    return
  }

  try {
    console.log('📝 Registering:', { email, fullName })
    await signUp(email, password, fullName)
    console.log('✅ Registration successful')
    
    // 🔥 After successful signup, merge guest cart
    const user = await getUser()
    if (user) {
      await mergeGuestCart(user.id)
      window.dispatchEvent(new Event('cartUpdated'))
      console.log('✅ Guest cart merged after signup')
    }
    
    router.push('/login?registered=true')
  } catch (err: any) {
    console.error('❌ Registration error:', err)
    setError(err.message || 'Erreur lors de l\'inscription')
  } finally {
    setLoading(false)
  }
}
  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription avec Google')
      setLoading(false)
    }
  }

  return (
<div className="bg-white rounded-lg shadow-md p-4 sm:p-5 border border-border max-w-[400px] mx-auto w-full"> 
        <div className="text-center mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <User size={28} className="sm:w-8 sm:h-8 text-primary" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          Créer un compte
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Rejoignez MercadoNacer pour commander en ligne
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Nom complet
          </label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              placeholder="Votre nom complet"
              disabled={loading}
            />
          </div>
        </div>

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
              placeholder="Minimum 6 caractères"
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

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              placeholder="Confirmez votre mot de passe"
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-primary text-white hover:bg-primary/90 transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
          disabled={loading}
        >
          {loading ? 'Création du compte...' : 'Créer mon compte'}
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

      {/* Google Sign Up */}
      <Button
        onClick={handleGoogleSignUp}
        variant="outline"
        size="lg"
        className="w-full border-border hover:bg-muted transition-colors text-sm sm:text-base"
        disabled={loading}
      >
        <GoogleIcon className="mr-2 w-5 h-5" />
        S'inscrire avec Google
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm text-text-secondary mt-6">
        Vous avez déjà un compte ?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  )
}