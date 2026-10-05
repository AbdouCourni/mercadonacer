// File: components/ServiceWorkerRegister.tsx
// Path: /components/ServiceWorkerRegister.tsx
// Description: Register service worker for PWA

'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    // Register on load
    const registerSW = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope)
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error)
        })
    }

    // Wait for page load (better than blocking)
    if (document.readyState === 'complete') {
      registerSW()
    } else {
      window.addEventListener('load', registerSW)
      return () => window.removeEventListener('load', registerSW)
    }
  }, [])

  return null // Renders nothing
}