// File: components/LegalPageLayout.tsx
// Path: /components/LegalPageLayout.tsx
// Description: Reusable layout for all legal pages

'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LegalLanguageToggle } from './LegalLanguageToggle'
import { useLegalLanguage, pickLang } from '@/lib/legal-language'
import { Settings } from '@/types/settings.types'

interface LegalPageLayoutProps {
  titleFr: string
  titleAr: string
  icon: React.ReactNode
  settings: Settings | null
  contentFr: string | null
  contentAr: string | null
  children?: React.ReactNode
}

export function LegalPageLayout({
  titleFr,
  titleAr,
  icon,
  settings,
  contentFr,
  contentAr,
  children,
}: LegalPageLayoutProps) {
  const { language, isRTL } = useLegalLanguage()
  
  const title = language === 'ar' ? titleAr : titleFr
  const content = pickLang(contentFr, contentAr, language)
  
  // Company info
  const companyName = pickLang(
    settings?.company_name_fr,
    settings?.company_name_ar,
    language
  )
  const companyEmail = settings?.company_email
  const companyPhone = settings?.company_phone
  const companyAddress = pickLang(
    settings?.company_address_fr,
    settings?.company_address_ar,
    language
  )
  const workingHours = pickLang(
    settings?.working_hours_fr,
    settings?.working_hours_ar,
    language
  )
  
  return (
    <div className={`container-custom py-8 max-w-4xl mx-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            {icon}
            {title}
          </h1>
        </div>
        <LegalLanguageToggle />
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-border p-8 space-y-8">
        {content ? (
          // Render HTML content from DB
          <div 
            className="prose prose-lg max-w-none text-text-secondary"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          // Fallback if no content in DB
          <>
            {children || (
              <p className="text-text-secondary text-center py-8">
                {language === 'ar' 
                  ? 'المحتوى قيد الإنشاء...' 
                  : 'Contenu en cours de rédaction...'}
              </p>
            )}
          </>
        )}
        
        {/* Contact section (shown if company info exists) */}
        {(companyEmail || companyPhone) && (
          <section className="pt-6 border-t border-border">
            <h2 className="text-xl font-bold text-text-primary mb-3">
              {language === 'ar' ? 'اتصل بنا' : 'Contact'}
            </h2>
            <div className="space-y-2 text-text-secondary">
              <ul className="space-y-1">
                {companyEmail && (
                  <li>
                    📧 {language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}{' '}
                    <a href={`mailto:${companyEmail}`} className="text-primary hover:underline">
                      {companyEmail}
                    </a>
                  </li>
                )}
                {companyPhone && (
                  <li>
                    📱 {language === 'ar' ? 'الهاتف:' : 'Téléphone:'}{' '}
                    <a href={`tel:${companyPhone}`} className="text-primary hover:underline">
                      {companyPhone}
                    </a>
                  </li>
                )}
                {companyAddress && (
                  <li>
                    📍 {language === 'ar' ? 'العنوان:' : 'Adresse:'} {companyAddress}
                  </li>
                )}
                {workingHours && (
                  <li>
                    🕒 {language === 'ar' ? 'أوقات العمل:' : 'Horaires:'} {workingHours}
                  </li>
                )}
              </ul>
            </div>
          </section>
        )}
      </div>

      {/* Footer links */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <LegalFooterLinks language={language} />
      </div>
    </div>
  )
}

// Footer links with language support
function LegalFooterLinks({ language }: { language: 'fr' | 'ar' }) {
  const langParam = language === 'ar' ? '?lang=ar' : ''
  
  const links = language === 'ar'
    ? [
        { href: '/privacy', label: 'سياسة الخصوصية' },
        { href: '/terms', label: 'شروط الاستخدام' },
        { href: '/legal', label: 'المعلومات القانونية' },
        { href: '/refund', label: 'سياسة الإرجاع' },
        { href: '/delivery', label: 'سياسة التوصيل' },
      ]
    : [
        { href: '/privacy', label: 'Confidentialité' },
        { href: '/terms', label: 'CGU' },
        { href: '/legal', label: 'Mentions légales' },
        { href: '/refund', label: 'Retours' },
        { href: '/delivery', label: 'Livraison' },
      ]
  
  return (
    <>
      {links.map((link, index) => (
        <span key={link.href} className="flex items-center gap-3">
          <Link 
            href={`${link.href}${langParam}`} 
            className="text-sm text-primary hover:underline"
          >
            {link.label}
          </Link>
          {index < links.length - 1 && <span className="text-text-secondary">•</span>}
        </span>
      ))}
    </>
  )
}