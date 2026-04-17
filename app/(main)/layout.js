import React from 'react'
import '../globals.css'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ChatWidget from '../../components/ChatWidget'
import AnnouncementBar from '../../components/AnnouncementBar'
import { Providers } from '../../components/Providers'

export default function SiteLayout({ children }) {
  return (
    <Providers>
      <AnnouncementBar />
      <Navbar />
      <div className="pt-[128px] md:pt-[104px]">{children}</div>
      <Footer />
      <ChatWidget />
    </Providers>
  )
}
