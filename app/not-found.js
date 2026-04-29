import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found | clowand',
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center">
        {/* 大数字背景装饰 */}
        <div className="relative mb-12">
          <div className="text-[140px] md:text-[180px] font-display font-bold text-[#e5e0da] leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1a3a5c] bg-white px-4 py-2 rounded-full shadow-sm">
              Page Not Found
            </span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-display tracking-tight text-[#1a2935] mb-4">
          Looks like this page doesn&apos;t exist
        </h1>
        <p className="text-sm text-[#5a6978] mb-10 leading-relaxed">
          The link might be broken, or the page may have been moved. 
          Let&apos;s get you back on track.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#2ecc71] text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#27ae60] transition-all shadow-lg"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
