import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 py-24 text-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-12 text-center md:text-left">
        <div className="col-span-1 md:col-span-2">
          <a href="/" className="inline-block group mb-6" style={{ filter: 'brightness(0) invert(1)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">C</div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter group-hover:text-blue-400 transition-colors py-10 overflow-visible">clowand</h2>
            </div>
          </a>
          <p className="text-slate-400 max-w-sm mb-8 font-medium italic text-xs">Elevating American bathroom hygiene with smarter, cleaner, and better tools.</p>
          <div className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <MapPin size={14} className="text-blue-400" />
              <span>123 Clean St, Boston, MA 02108, USA</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Phone size={14} className="text-blue-400" />
              <span>+1 (888) 256-9263 (Mon-Fri, 9am - 5pm EST)</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Mail size={14} className="text-blue-400" />
              <span>support@clowand.com</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-blue-400 italic py-4 overflow-visible">Shop</h3>
          <ul className="space-y-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <li><a href="#bundles" className="hover:text-white transition-colors">Starter Kit</a></li>
            <li><a href="#bundles" className="hover:text-white transition-colors">Value Pack</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-blue-400 italic py-4 overflow-visible">Company</h3>
          <ul className="space-y-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <li><a href="/blog" className="hover:text-white transition-colors underline decoration-blue-500/30 underline-offset-4">Blog</a></li>
            <li><a href="/about" className="hover:text-white transition-colors underline decoration-blue-500/30 underline-offset-4">About Us</a></li>
            <li><a href="/privacy" className="hover:text-white transition-colors underline decoration-blue-500/30 underline-offset-4">Privacy Policy</a></li>
            <li><a href="/refund" className="hover:text-white transition-colors underline decoration-blue-500/30 underline-offset-4">Refund Policy</a></li>
            <li><a href="/terms" className="hover:text-white transition-colors underline decoration-blue-500/30 underline-offset-4">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-[8px] font-black uppercase tracking-[0.4em]">
        © 2026 clowand. 100% US Compliant. Redefining Bathroom Hygiene.
      </div>
    </footer>
  );
}
