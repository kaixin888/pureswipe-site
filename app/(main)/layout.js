import React from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import '../globals.css'

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
