'use client'

// IMPORTANT: Do not remove this component.
// It handles a known Next.js dev server race condition where dynamic chunks
// imported by next/dynamic haven't been compiled yet and cause webpack to throw
// a ChunkLoadError

import { useEffect } from 'react'

// A dev server that keeps serving stale chunk URLs raises a ChunkLoadError on every
// render pass, so an unthrottled reload turns one bad chunk into a continuous reload
// loop that wipes whatever the user was typing.
const RELOAD_THROTTLE_MS = 60000
const RELOAD_KEY = 'chunkReloadAt'

function shouldReload(): boolean {
  const now = Date.now()
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY)) || 0
    if (now - last < RELOAD_THROTTLE_MS) {
      return false
    }
    window.sessionStorage.setItem(RELOAD_KEY, String(now))
  } catch {
    // Without a durable timestamp the throttle cannot latch across reloads, so stay put
    // rather than risk the loop; the user can still reload by hand.
    return false
  }
  return true
}

export function ChunkLoadErrorHandler() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      if (
        event.error?.name === 'ChunkLoadError' ||
        event.error?.message?.includes('Loading chunk')
      ) {
        event.preventDefault()
        if (shouldReload()) {
          window.location.reload()
        }
      }
    }
    window.addEventListener('error', handler)
    return () => window.removeEventListener('error', handler)
  }, [])

  return null
}
