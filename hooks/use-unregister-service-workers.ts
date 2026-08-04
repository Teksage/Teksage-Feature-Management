'use client'

import { useEffect } from 'react'

/**
 * This app ships no service worker, but sibling Teksage projects do (the website
 * registers `/firebase-messaging-sw.js`). On a shared origin such as
 * `localhost:3000` their worker stays active here and intercepts requests, which
 * surfaces as unexplained `TypeError: Failed to fetch`. Clear any leftovers.
 */
export function useUnregisterServiceWorkers() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
      .catch(() => {
        // Nothing actionable — the app works without touching the worker.
      })
  }, [])
}
