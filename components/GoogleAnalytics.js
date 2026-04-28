'use client'

import { useEffect } from 'react'
import { useStore } from './Providers'

// GA4 Measurement ID (already configured)
const GA_ID = 'G-JFTMBGD8EM'

// Only load GA when cookies are consented
export default function GoogleAnalytics() {
  const { cookieConsent } = useStore() || {}

  useEffect(() => {
    // Check consent — if user explicitly rejected analytics, skip
    if (cookieConsent === false) return
    if (cookieConsent === null) return // not yet decided — wait

    // Load gtag script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    script.async = true
    if (!document.querySelector(`script[src*="${GA_ID}"]`)) {
      document.head.appendChild(script)
    }

    // Init gtag
    window.dataLayer = window.dataLayer || []
    function gtag(){ window.dataLayer.push(arguments) }
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', GA_ID, {
      send_page_view: true,
      cookie_flags: 'max-age=7200;Secure;SameSite=Lax',
    })
  }, [cookieConsent])

  return null
}
