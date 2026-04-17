import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'clowand | Professional 18" Disposable Toilet Brush - 365 Days of Hygiene',
  description: 'The ultimate 18-inch reach bathroom hygiene system. Triple-action pads, zero-touch mechanism, and 365-day supply in one box. Designed for the modern US home.',
  metadataBase: new URL('https://clowand.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'clowand | Professional 18" Disposable Toilet Brush',
    description: 'The zero-touch hygienic revolution for your home.',
    url: 'https://clowand.com',
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
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer","GTM-PNBVHTGR");` }} />
      </head>
      <body className={inter.className}>
        {/* GTM noscript fallback */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PNBVHTGR" height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
        </noscript>
        {children}
      </body>
    </html>
  )
}
