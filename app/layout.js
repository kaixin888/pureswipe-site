// Build Force: 2026-04-12 20:50:00 (Refine v2.2.3 Fix)
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
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">C</div>
              <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">clowand</span>
            </a>
            <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#bundles" className="hover:text-blue-600 transition-colors">Shop</a>
              <a href="#reviews" className="hover:text-blue-600 transition-colors">Reviews</a>
            </div>
            <button className="bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full hover:scale-105 transition-all shadow-xl">
              Buy Now
            </button>
          </div>
        </nav>
        {children}
        <footer className="bg-slate-950 py-24 text-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-12 text-center md:text-left">
            <div className="col-span-1 md:col-span-2">
              <a href="/" className="inline-block group">
                <h2 className="text-3xl font-black mb-6 italic uppercase tracking-tighter group-hover:text-blue-400 transition-colors">clowand</h2>
              </a>
              <p className="text-slate-400 max-w-sm mb-8 font-medium italic text-xs">Elevating American bathroom hygiene with smarter, cleaner, and better tools.</p>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-blue-400 italic">Shop</h3>
              <ul className="space-y-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <li><a href="#bundles" className="hover:text-white transition-colors">Starter Kit</a></li>
                <li><a href="#bundles" className="hover:text-white transition-colors">Value Pack</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-blue-400 italic">Legal Compliance</h3>
              <ul className="space-y-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <li><a href="/privacy" className="hover:text-white transition-colors underline decoration-blue-500/30 underline-offset-4">Privacy Policy</a></li>
                <li><a href="/refund" className="hover:text-white transition-colors underline decoration-blue-500/30 underline-offset-4">Refund Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors underline decoration-blue-500/30 underline-offset-4">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-[8px] font-black uppercase tracking-[0.4em]">
            © 2026 clowand. 100% US Compliant. Build: 02:35 AM
          </div>
        </footer>
      </body>
    </html>
  )
}
