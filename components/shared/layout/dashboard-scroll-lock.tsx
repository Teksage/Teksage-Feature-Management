'use client'

import { useEffect } from 'react'

/** Prevents document-level scroll so portal popups can't leave empty space below the shell. */
export function DashboardScrollLock() {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
    }
  }, [])

  return null
}
