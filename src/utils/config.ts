/**
 * Centralized configuration for environment variables.
 * Use this instead of directly accessing import.meta.env throughout the app.
 * 
 * IMPORTANT: All URLs must be set in .env file - no hardcoded fallbacks.
 */

const apiUrl = import.meta.env.VITE_API_URL
const storageUrl = import.meta.env.VITE_STORAGE_URL

// Warn in dev if env vars are missing
if (import.meta.env.DEV) {
    if (!apiUrl) console.warn('[Config] VITE_API_URL is not set!')
    if (!storageUrl) console.warn('[Config] VITE_STORAGE_URL is not set!')
}

export const config = {
    apiUrl: apiUrl || '',
    storageUrl: storageUrl || '',
    vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
}

/**
 * Get the full URL for an avatar or storage path.
 */
export function getStorageUrl(path: string | null | undefined): string {
    if (!path) return ''
    // If path is already absolute, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }
    return `${config.storageUrl}${path}`
}
