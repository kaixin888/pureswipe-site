'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import GlobalCheckout from './GlobalCheckout';

/**
 * SiteChrome — public-site shell (AnnouncementBar + Navbar + Footer).
 *
 * Why this exists:
 *   Root app/layout.js is a server component (it exports `metadata`),
 *   so it cannot use `usePathname`. We wrap children here on the client
 *   to skip chrome on /admin (Refine has its own layout) and any future
 *   chrome-less routes (auth flows, embeds, etc.).
 *
 * Skip rules:
 *   - /admin/* — Refine v6 manages its own header/sider
 *   - /api/*  — never rendered as a page anyway, defensive
 */
export default function SiteChrome({ children }) {
  const pathname = usePathname() || '/';
  const isChromeless =
    pathname.startsWith('/admin') || pathname.startsWith('/api');

  if (isChromeless) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <GlobalCheckout />
      <main
        className={pathname === '/' ? '' : ''}
        style={pathname === '/' ? { paddingTop: 'var(--header-end, 88px)' } : undefined}
      >{children}</main>
      <Footer />
    </>
  );
}
