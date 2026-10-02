// File: lib/legal-language.ts
// Path: /lib/legal-language.ts
// Description: Language utility for legal pages (AR/FR)

'use client'

import { useSearchParams } from 'next/navigation'

export type Language = 'fr' | 'ar'

export function useLegalLanguage(): {
  language: Language
  isRTL: boolean
} {
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang')
  const language: Language = lang === 'ar' ? 'ar' : 'fr'

  return {
    language,
    isRTL: language === 'ar',
  }
}

export function pickLang(
  fr: string | null | undefined,
  ar: string | null | undefined,
  language: Language
): string {
  return language === 'ar' ? ar || fr || '' : fr || ''
}