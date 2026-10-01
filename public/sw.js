// File: public/sw.js
// Path: /public/sw.js
// Description: Service Worker for push notifications

// ============================================
// SERVICE WORKER LIFECYCLE
// ============================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  self.skipWaiting() // Activate immediately
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(self.clients.claim()) // Take control of all pages
})

// ============================================
// PUSH NOTIFICATION RECEIVED
// ============================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)

  let data = {
    title: 'Mercado Nacer',
    body: 'Vous avez une nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    url: '/',
    tag: 'default',
  }

  // Parse payload if exists
  if (event.data) {
    try {
      const payload = event.data.json()
      data = { ...data, ...payload }
      console.log('[SW] Parsed payload:', data)
    } catch (error) {
      console.error('[SW] Failed to parse push payload:', error)
      // Fallback: use raw text as body
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag, // Prevents duplicate notifications with same tag
    data: {
      url: data.url,
      timestamp: Date.now(),
    },
    requireInteraction: false, // Auto-dismiss
    vibrate: [200, 100, 200], // Vibration pattern (Android)
    actions: data.actions || [], // Optional action buttons
  }

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// ============================================
// NOTIFICATION CLICK
// ============================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event)
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  // Focus existing tab if open, otherwise open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if a tab with this URL is already open
      for (const client of windowClients) {
        const clientUrl = new URL(client.url)
        const targetUrl = new URL(urlToOpen, self.location.origin)
        
        if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
          console.log('[SW] Focusing existing tab:', client.url)
          return client.focus()
        }
      }
      
      // No existing tab — open a new one
      if (clients.openWindow) {
        console.log('[SW] Opening new window:', urlToOpen)
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// ============================================
// NOTIFICATION CLOSED (Optional tracking)
// ============================================

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag)
  // Optional: send analytics
})

// ============================================
// PUSH SUBSCRIPTION CHANGE
// ============================================

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed')
  // The browser invalidated the subscription
  // Re-subscribe and send new subscription to server
  // (Advanced — can be handled later)
})

// ============================================
// MESSAGE FROM PAGE (for manual triggers)
// ============================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message from page:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})