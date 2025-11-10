/// <reference types="vite-plugin-pwa/client" />

// Auto-update PWA and reload when a new SW is available
import { registerSW } from 'virtual:pwa-register'

const CHECK_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export function enablePwaAutoUpdate() {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Force activate new SW and reload the page
      updateSW(true)
    },
    onOfflineReady() {
      // Optional: could show a toast "Offline ready"
    },
    onRegisteredSW(_swUrl, reg) {
      if (reg) {
        // Periodically check for updates while the app is open
        setInterval(() => { reg.update().catch(() => {}) }, CHECK_INTERVAL_MS)
      }
    },
  })

  // Also check when the tab becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker?.getRegistration()?.then(r => r?.update()).catch(() => {})
    }
  })
}

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  enablePwaAutoUpdate()
}
