// Build Force: 2026-04-12 10:45:00 (clowand brand sync)
import './globals.css'
import { Inter } from 'next/font/google'


const inter = Inter({ subsets: ['latin'] })


const SEO_KEYWORDS = "18 inch disposable toilet brush, long handle disposable toilet brush, zero touch toilet cleaning system, scented disposable toilet brush refills, disposable toilet brush for RV, toilet cleaning wand starter kit, hygienic toilet cleaning system, apartment essentials";


export const metadata = {
  title: 'Clowand | 18" Premium Disposable Toilet Brush System',
  description: 'Clean smarter, not harder. The 18-inch hygienic revolution for your bathroom. Triple action pads, zero-touch mechanism. Shop now for a germ-free home.',
  keywords: SEO_KEYWORDS,
  openGraph: {
    title: 'Clowand - 100% Zero-Touch Clean',
    description: '18" Long Handle, Triple Action Pads, One-Click Release.',
    url: 'https://clowand.com',
    siteName: 'Clowand',
    locale: 'en_US',
    type: 'website',
  },
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 顶部导航栏 */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
              <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">clowand</span>
            </a>
            
            <div className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-gray-400">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#bundles" className="hover:text-blue-600 transition-colors">Shop</a>
