import React from 'react'
import '../globals.css'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ChatWidget from '../../components/ChatWidget'
import RecentSales from '../../components/RecentSales'
import AnnouncementBar from '../../components/AnnouncementBar'
import { Providers } from '../../components/Providers'
import GlobalCheckout from '../../components/GlobalCheckout'

export default function SiteLayout({ children }) {
  return (
    <Providers>
      <AnnouncementBar />
      <Navbar />
      {/* mobile: 32px bar + ~80px navbar = 112px; desktop: 40px bar + 64px navbar = 104px */}
      <div className="pt-[112px] md:pt-[104px]">{children}</div>
      <Footer />
      <ChatWidget />
      <RecentSales />
      <GlobalCheckout />
    </Providers>
  )
}
