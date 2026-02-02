import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'

export interface Notification {
    id: number
    title: string
    body: string
    data: any
    readAt: string | null
    createdAt: string
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    loading: boolean
    markAsRead: (ids: number[] | 'all') => Promise<void>
    subscribeToPush: () => Promise<void>
    isPushSupported: boolean
    isSubscribed: boolean
    permission: NotificationPermission
    requestPermission: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(false)
    const [isPushSupported, setIsPushSupported] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [isSubscribed, setIsSubscribed] = useState(false)

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            console.log('Push Supported. Permission:', Notification.permission)
            setIsPushSupported(true)
            setPermission(Notification.permission)
            checkSubscription()
        } else {
             console.log('Push NOT Supported')
        }
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications()
            // Poll every minute
            const interval = setInterval(fetchNotifications, 60000)

            // Auto-request permission if supported and in default state
            if ('serviceWorker' in navigator && 'PushManager' in window && Notification.permission === 'default') {
                requestPermission()
            }

            return () => clearInterval(interval)
        }
    }, [isAuthenticated])

    const checkSubscription = async () => {
        try {
             // Wait up to 2 seconds for SW ready to avoid infinite hang if SW fails registration
            const registrationPromise = navigator.serviceWorker.ready;
            const timeoutPromise = new Promise<ServiceWorkerRegistration | undefined>((resolve) => setTimeout(() => resolve(undefined), 2000));
            const registration = await Promise.race([registrationPromise, timeoutPromise]);
            
            if (!registration) {
                 console.warn('SW ready timed out - check registration in main.tsx')
                 return
            }

            const subscription = await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
        } catch (e) {
            console.error('Error checking subscription', e)
        }
    }

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const response = await api.get('/notifications')
            setNotifications(response.data.notifications)
            setUnreadCount(response.data.unreadCount)
        } catch (error) {
            console.error('Failed to fetch notifications', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (ids: number[] | 'all') => {
        try {
            await api.post('/notifications/read', { ids })
            // Optimistic update
            if (ids === 'all') {
                setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })))
                setUnreadCount(0)
            } else {
                setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, readAt: new Date().toISOString() } : n))
                setUnreadCount(prev => Math.max(0, prev - ids.length))
            }
        } catch (error) {
            console.error('Failed to mark read', error)
        }
    }

    const requestPermission = async () => {
        console.log('Requesting permission...')
        if (!isPushSupported) {
             console.log('Push not supported, aborting request')
             return
        }
        const result = await Notification.requestPermission()
        console.log('Permission result:', result)
        setPermission(result)
        if (result === 'granted') {
            subscribeToPush()
        }
    }

    const subscribeToPush = async () => {
        if (!isPushSupported) return
        if (!VAPID_PUBLIC_KEY) {
            console.error('VAPID Public Key not configured')
            return
        }

        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            })

            // Send subscription to backend
            const keys = subscription.toJSON().keys
            await api.post('/notifications/subscribe', {
                endpoint: subscription.endpoint,
                keys
            })

            setIsSubscribed(true)
            console.log('Push Subscribed')
        } catch (error) {
            console.error('Failed to subscribe to push', error)
            setPermission(Notification.permission) // Update permission if it failed due to denial
            alert('Failed to subscribe to notifications. Please check permission settings.')
        }
    }

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            markAsRead,
            subscribeToPush,
            isPushSupported,
            isSubscribed,
            permission,
            requestPermission
        }}>
            {children}
        </NotificationContext.Provider>
    )
}
