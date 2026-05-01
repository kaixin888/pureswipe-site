// Middleware: rewrite stale /images/hero.jpg to R2 CDN (bypass Vercel edge cache)
// Also handle renamed hero-banner.jpg
// This runs at Edge level, zero cache, instant update
import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // hero-banner.jpg → media.clowand.com CDN (no Vercel cache)
  if (pathname === '/images/hero-banner.jpg' || pathname === '/images/hero.jpg') {
    return NextResponse.redirect(
      'https://media.clowand.com/images/hero-banner.jpg',
      { status: 302 }
    )
  }
  // wand-box.jpg → CDN
  if (pathname === '/images/wand-box.jpg') {
    return NextResponse.redirect(
      'https://media.clowand.com/images/wand-box.jpg',
      { status: 302 }
    )
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/images/:path*',
}
