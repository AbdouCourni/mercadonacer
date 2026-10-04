// File: components/GoogleAnalytics.tsx
// Path: /components/GoogleAnalytics.tsx
// Description: Track page views on route change

'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

function GATracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    if (typeof window.gtag !== 'function') return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

    window.gtag('event', 'page_view', {
      page_path: url,
    })
  }, [pathname, searchParams])

  return null
}

export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GATracker />
    </Suspense>
  )
}