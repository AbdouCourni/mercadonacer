// File: components/LegalLanguageToggle.tsx
// Path: /components/LegalLanguageToggle.tsx
// Description: Language toggle for legal pages

'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export function LegalLanguageToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentLang = searchParams.get('lang') === 'ar' ? 'ar' : 'fr'

  const switchLanguage = (lang: 'fr' | 'ar') => {
    const params = new URLSearchParams(searchParams.toString())
    if (lang === 'fr') {
      params.delete('lang')
    } else {
      params.set('lang', lang)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-border overflow-hidden bg-white">
      <button
        onClick={() => switchLanguage('fr')}
        className={cn(
          'px-4 py-2 text-sm font-medium transition-colors',
          currentLang === 'fr'
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:bg-muted'
        )}
        aria-label="Français"
      >
        FR
      </button>
      <button
        onClick={() => switchLanguage('ar')}
        className={cn(
          'px-4 py-2 text-sm font-medium transition-colors',
          currentLang === 'ar'
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:bg-muted'
        )}
        aria-label="العربية"
      >
        AR
      </button>
    </div>
  )
}