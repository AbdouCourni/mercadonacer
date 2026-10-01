// File: hooks/usePushNotifications.ts
// Path: /hooks/usePushNotifications.ts
// Description: React hook for managing push notification state

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  isPushSupported,
  getPermissionStatus,
  subscribeToPush,
  unsubscribeFromPush,
  hasActiveSubscription,
} from '@/lib/push/client'

type PermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported' | 'loading'

export function usePushNotifications() {
  const [permission, setPermission] = useState<PermissionStatus>('loading')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize state on mount
  useEffect(() => {
    const init = async () => {
      if (!isPushSupported()) {
        setPermission('unsupported')
        return
      }

      const status = getPermissionStatus()
      setPermission(status as PermissionStatus)

      if (status === 'granted') {
        const active = await hasActiveSubscription()
        setIsSubscribed(active)
      }
    }
    init()
  }, [])

  // Subscribe handler
  const subscribe = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await subscribeToPush()

    if (result.success) {
      setIsSubscribed(true)
      setPermission('granted')
    } else {
      setError(result.error || 'Erreur inconnue')
      // Refresh permission status
      const status = getPermissionStatus()
      setPermission(status as PermissionStatus)
    }

    setIsLoading(false)
    return result
  }, [])

  // Unsubscribe handler
  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await unsubscribeFromPush()

    if (result.success) {
      setIsSubscribed(false)
    } else {
      setError(result.error || 'Erreur inconnue')
    }

    setIsLoading(false)
    return result
  }, [])

  // Toggle
  const toggle = useCallback(async () => {
    if (isSubscribed) {
      return await unsubscribe()
    } else {
      return await subscribe()
    }
  }, [isSubscribed, subscribe, unsubscribe])

  return {
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    toggle,
    isSupported: permission !== 'unsupported',
  }
}