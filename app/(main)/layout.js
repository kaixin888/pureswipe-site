import React from 'react'
import '../globals.css'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ChatWidget from '../../components/ChatWidget'
import { Providers } from '../../components/Providers'

export default function SiteLayout({ children }) {
  return (
    <Providers>
      <Navbar />
      {children}
      <Footer />
      <ChatWidget />
    </Providers>
  )
}
