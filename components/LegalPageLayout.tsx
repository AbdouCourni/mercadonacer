// File: components/LegalPageLayout.tsx
// Path: /components/LegalPageLayout.tsx
// Description: Reusable layout for legal pages

'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LegalLanguageToggle } from './LegalLanguageToggle'
import { useLegalLanguage } from '@/lib/legal-language'

interface LegalPageLayoutProps {
  titleFr: string
  titleAr: string
  icon: React.ReactNode
  children: React.ReactNode
}

export function LegalPageLayout({
  titleFr,
  titleAr,
  icon,
  children,
}: LegalPageLayoutProps) {
  const { language, isRTL } = useLegalLanguage()

  const title = language === 'ar' ? titleAr : titleFr
  const backLabel = language === 'ar' ? 'رجوع' : 'Retour'
  const footerLinks =
    language === 'ar'
      ? [
          { href: '/privacy', label: 'سياسة الخصوصية' },
          { href: '/terms', label: 'شروط الاستخدام' },
          { href: '/legal', label: 'المعلومات القانونية' },
          { href: '/refund', label: 'سياسة الإرجاع' },
          { href: '/delivery', label: 'سياسة التوصيل' },
          { href: '/about', label: 'من نحن' },
        ]
      : [
          { href: '/privacy', label: 'Confidentialité' },
          { href: '/terms', label: 'CGU' },
          { href: '/legal', label: 'Mentions légales' },
          { href: '/refund', label: 'Retours' },
          { href: '/delivery', label: 'Livraison' },
          { href: '/about', label: 'À propos' },
        ]

  const langParam = language === 'ar' ? '?lang=ar' : ''

  return (
    <div
      className="container-custom py-8 max-w-4xl mx-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label={backLabel}
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
            {icon}
            {title}
          </h1>
        </div>
        <LegalLanguageToggle />
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-border p-6 md:p-8">
        {children}
      </div>

      {/* Footer links */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {footerLinks.map((link, index) => (
          <span key={link.href} className="flex items-center gap-3">
            <Link
              href={`${link.href}${langParam}`}
              className="text-sm text-primary hover:underline"
            >
              {link.label}
            </Link>
            {index < footerLinks.length - 1 && (
              <span className="text-text-secondary">•</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}