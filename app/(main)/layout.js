import React from 'react'
import '../globals.css'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ChatWidget from '../../components/ChatWidget'
export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <ChatWidget />
    </>
  )
}
