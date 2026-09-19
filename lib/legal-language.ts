// File: lib/legal-language.ts
// Path: /lib/legal-language.ts
// Description: Simple language utility for legal pages

'use client'

import { useSearchParams } from 'next/navigation'
import { Language } from '@/types/settings.types'

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

// Helper to pick localized content
export function pickLang(
  fr: string | null | undefined,
  ar: string | null | undefined,
  language: Language
): string {
  return language === 'ar' ? (ar || fr || '') : (fr || '')
}