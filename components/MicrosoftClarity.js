'use client'

import { useEffect } from 'react'
import { useStore } from './Providers'

// Microsoft Clarity Project ID
const CLARITY_ID = 'wkqtzclrp4'

// Only load Clarity when analytics cookies are consented
export default function MicrosoftClarity() {
  const { cookieConsent } = useStore() || {}

  useEffect(() => {
    // Respect consent — skip if rejected or not yet decided
    if (cookieConsent !== true) return

    // Avoid duplicate injection
    if (document.querySelector('script[src*="clarity.ms"]')) return

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`
    document.head.appendChild(script)

    // Init clarity queue (standard pattern)
    window.clarity =
      window.clarity ||
      function () {
        ;(window.clarity.q = window.clarity.q || []).push(arguments)
      }
  }, [cookieConsent])

  return null
}
