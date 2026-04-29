// 使用 fontsource 本地字体（无需 CDN 请求，兼容 GFW 环境）
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/900.css'
import '@fontsource/playfair-display/600.css'
import '@fontsource/playfair-display/700.css'
import { Providers } from '../components/Providers'
import SiteChrome from '../components/SiteChrome'
import CookieConsentBanner from '../components/CookieConsent'
import GoogleAnalytics from '../components/GoogleAnalytics'
import './globals.css'

export const metadata = {
  title: 'clowand | Professional 18" Disposable Toilet Brush - 365 Days of Hygiene',
  description: 'The ultimate 18-inch reach bathroom hygiene system. Triple-action pads, zero-touch mechanism, and 365-day supply in one box. Designed for the modern US home.',
  metadataBase: new URL('https://www.clowand.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'clowand | Professional 18" Disposable Toilet Brush',
    description: 'The zero-touch hygienic revolution for your home.',
    url: 'https://www.clowand.com',
    siteName: 'clowand',
    images: [
      {
        url: '/images/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'clowand Toilet Brush',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'clowand | Professional 18" Disposable Toilet Brush',
    description: 'The zero-touch hygienic revolution for your home.',
    images: ['/images/hero.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-US">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="google" content="notranslate" />
      </head>
      <body className="font-sans">
        <Providers>
          {/* Consent-based GA4 — loads only when user accepts analytics cookies */}
          <GoogleAnalytics />
          <SiteChrome>{children}</SiteChrome>
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  )
}
