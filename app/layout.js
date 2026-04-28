import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Providers } from '../components/Providers'
import SiteChrome from '../components/SiteChrome'
import CookieConsentBanner from '../components/CookieConsent'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
  variable: '--font-inter',
  display: 'swap',
})

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
      <body className={inter.className}>
        <Providers>
          {/* Google Analytics GA4 */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-JFTMBGD8EM"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-JFTMBGD8EM');
            `}
          </Script>
          <SiteChrome>{children}</SiteChrome>
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  )
}
