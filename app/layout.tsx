// File: app/layout.tsx
// Path: /app/layout.tsx

import type { Metadata } from 'next'
import './globals.css'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import Script from 'next/script'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'


export const metadata: Metadata = {
  // Base
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),

  // Title template
  title: {
    default: 'Mercado Nacer — Votre supermarché en ligne à Nador',
    template: '%s | Mercado Nacer',
  },

  // Description
  description:
    'Commandez vos courses en ligne chez Mercado Nacer. Livraison rapide à Nador et environs (24-48h). Paiement à la livraison. Plus de 5000 produits.',

  // Keywords
  keywords: [
    'supermarché en ligne',
    'courses en ligne Nador',
    'livraison Nador',
    'épicerie en ligne Maroc',
    'Mercado Nacer',
    'achat en ligne Nador',
    'livraison 24h',
    'paiement à la livraison',
  ],

  // Authors
  authors: [{ name: 'Mercado Nacer' }],
  creator: 'Mercado Nacer',
  publisher: 'Mercado Nacer',

  // Open Graph (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    alternateLocale: ['ar_MA'],
    url: '/',
    siteName: 'Mercado Nacer',
    title: 'Mercado Nacer — Votre supermarché en ligne à Nador',
    description:
      'Commandez vos courses en ligne. Livraison rapide à Nador (24-48h). Paiement à la livraison.',
    images: [
      {
        url: '/og-image.jpg',   // 1200x630px
        width: 1200,
        height: 630,
        alt: 'Mercado Nacer - Supermarché en ligne',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Mercado Nacer — Votre supermarché en ligne',
    description:
      'Livraison rapide à Nador. Paiement à la livraison. Commandez maintenant.',
    images: ['/og-image.jpg'],
  },

  // Icons (favicons)
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg' },
    ],
  },

  // PWA manifest
  manifest: '/manifest.json',

  // Robots (default: allow all)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (add your codes later)
  verification: {
    // google: 'xxx',
    // yandex: 'xxx',
    // bing: 'xxx',
  },

  // Alternate languages
  alternates: {
    canonical: '/',
    languages: {
      'fr-MA': '/',
      'ar-MA': '/?lang=ar',
    },
  },

  // Category
  category: 'shopping',
}

function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mercado Nacer',
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/icons/icon-512x512.png`,
    description: 'Supermarché en ligne à Nador, Maroc',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nador',
      addressCountry: 'MA',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+212654063922',
      contactType: 'customer service',
      availableLanguage: ['French', 'Arabic'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" dir="ltr">
      <head>
         <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SQ0WJ868GH"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SQ0WJ868GH', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        </head>
      <body className="font-sans antialiased">
        <OrganizationJsonLd />
                <GoogleAnalytics />

        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}