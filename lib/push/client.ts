// File: lib/push/client.ts
// Path: /lib/push/client.ts
// Description: Browser-side push notification helpers

'use client'

/**
 * Convert base64 string to Uint8Array (needed by pushManager.subscribe)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Check if the browser supports push notifications
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Get current permission status
 */
export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

/**
 * Register the Service Worker (idempotent)
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) {
    console.warn('[Push] Service Worker not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })
    console.log('[Push] Service Worker registered:', registration.scope)
    return registration
  } catch (error) {
    console.error('[Push] Service Worker registration failed:', error)
    return null
  }
}

/**
 * Ask the user for permission and subscribe
 */
export async function subscribeToPush(): Promise<{
  success: boolean
  subscription?: PushSubscription
  error?: string
}> {
  try {
    // 1. Check support
    if (!isPushSupported()) {
      return { success: false, error: 'Notifications non supportées par ce navigateur' }
    }

    // 2. Check VAPID public key
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      return { success: false, error: 'Clé VAPID publique manquante' }
    }

    // 3. Register Service Worker
    const registration = await registerServiceWorker()
    if (!registration) {
      return { success: false, error: 'Échec de l\'enregistrement du Service Worker' }
    }

    // 4. Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return { success: false, error: 'Permission refusée par l\'utilisateur' }
    }

    // 5. Check for existing subscription
    let subscription = await registration.pushManager.getSubscription()

    // 6. Create subscription if not exists
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: Uint8Array.from(urlBase64ToUint8Array(vapidPublicKey)),
      })
      console.log('[Push] New subscription created:', subscription.endpoint)
    } else {
      console.log('[Push] Existing subscription found:', subscription.endpoint)
    }

    // 7. Send to server
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return {
        success: false,
        error: error.error || 'Échec de l\'enregistrement sur le serveur',
      }
    }

    return { success: true, subscription }
  } catch (error) {
    console.error('[Push] Subscribe error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    if (!isPushSupported()) {
      return { success: false, error: 'Non supporté' }
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      return { success: true } // Already unsubscribed
    }

    // 1. Remove from server
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })

    // 2. Unsubscribe locally
    await subscription.unsubscribe()
    console.log('[Push] Unsubscribed')

    return { success: true }
  } catch (error) {
    console.error('[Push] Unsubscribe error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    if (!isPushSupported()) return false
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return !!subscription
  } catch {
    return false
  }
}