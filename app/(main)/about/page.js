import { MapPin, Phone, Mail, Shield, Award, Users } from 'lucide-react';

export const metadata = {
  title: 'About Us | clowand — American Bathroom Hygiene',
  description: 'Learn about clowand, the Boston-based company reimagining bathroom hygiene with zero-touch, disposable toilet brush systems trusted by 2,000+ American homes.',
  keywords: 'clowand about, toilet brush company, Boston hygiene brand, disposable toilet brush USA',
  openGraph: {
    title: 'About clowand — Smarter Bathroom Hygiene',
    description: 'Boston engineers building cleaner, safer bathrooms for American families.',
    url: 'https://clowand.com/about',
    siteName: 'clowand',
    locale: 'en_US',
    type: 'website',
  },
};

const STATS = [
  { value: '2,000+', label: 'American Homes' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '100%', label: 'Satisfaction Guarantee' },
  { value: '18"', label: 'Zero-Touch Handle' },
];

const VALUES = [
  {
    icon: Shield,
    title: 'Hygiene First',
    desc: 'We believe no one should touch a used toilet brush. Our zero-contact design eliminates the single most unsanitary object in the American bathroom.',
  },
  {
    icon: Award,
    title: 'American Standard',
    desc: 'Engineered and quality-tested for US households. Every pad, every wand, every caddy meets our strict durability and safety benchmarks.',
  },
  {
    icon: Users,
    title: 'Family Safe',
    desc: 'From studio apartments to family homes — clowand fits every bathroom and every lifestyle without compromising on cleanliness.',
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen" lang="en-US">

      {/* Hero */}
      <section className="bg-slate-950 text-white pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] italic block mb-6">
            Our Story
          </span>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-8 leading-none">
            Built in Boston.<br />
            <span className="text-blue-400">Trusted Nationwide.</span>
          </h1>
          <p className="text-slate-300 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            clowand started with a simple observation: the toilet brush is the most overlooked,
            most unsanitary object in every American bathroom. We set out to fix that.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-black italic tracking-tighter text-slate-950 mb-2">{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 mb-8">
            Why We Started
          </h2>
          <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
            <p>
              In 2023, a team of Boston engineers and product designers gathered around a whiteboard
              with one question: <em>"Why is the toilet brush still the same design it was 100 years ago?"</em>
            </p>
            <p>
              The traditional toilet brush is a breeding ground for bacteria. It sits in a pool of
              contaminated water, spreads germs every time it&apos;s used, and nobody wants to touch it —
              yet everyone has to.
            </p>
            <p>
              We designed the clowand system from scratch. An 18-inch zero-touch wand, a self-sealing
              caddy, and disposable cleaning pads that you snap on and toss — never touching a used pad
              with your bare hands.
            </p>
            <p>
              The response from American families was immediate. Cleaner bathrooms. Less stress.
              No more dreading that one chore. Today, clowand is trusted in over 2,000 US homes —
              and we&apos;re just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 mb-16 text-center">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {VALUES.map((v) => (
              <div key={v.title} className="text-center">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <v.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-black italic uppercase tracking-tight text-slate-950 mb-3">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 mb-12">
            Get In Touch
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-5 p-6 border border-slate-100 rounded-3xl hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Headquarters</p>
                <p className="font-bold text-slate-800">123 Clean St, Boston, MA 02108, USA</p>
              </div>
            </div>
            <div className="flex items-start gap-5 p-6 border border-slate-100 rounded-3xl hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Phone</p>
                <p className="font-bold text-slate-800">+1 (888) 256-9263</p>
                <p className="text-xs text-slate-400 mt-1">Mon – Fri, 9:00 AM – 5:00 PM EST</p>
              </div>
            </div>
            <div className="flex items-start gap-5 p-6 border border-slate-100 rounded-3xl hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Email</p>
                <a href="mailto:support@clowand.com" className="font-bold text-slate-800 hover:text-blue-500 transition-colors">
                  support@clowand.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
