import { Package, Check, Minus, Star } from 'lucide-react';

/**
 * Bundle Comparison Table — shows all bundles side-by-side so customers
 * can compare price, refill count, cost-per-pad, and included items at a glance.
 *
 * Data is derived from the `bundles` array (products table or hardcoded fallback)
 * by parsing names/descriptions — no extra schema needed.
 *
 * Props:
 *   bundles: Array<{
 *     id, name, price, sale_price, description, image, items (string[]), tag, popular, stock
 *   }>
 */

// Extract refill count from product name/items. Handles:
//   "48 Refills" → 48
//   "36x Refill Pads" → 36
//   items: ["12x Single-Use Refill Pads"] → 12
function extractRefillCount(bundle) {
  // Try parsing from items array first (hardcoded BUNDLES)
  if (bundle.items && bundle.items.length > 0) {
    for (const item of bundle.items) {
      const m = item.match(/(\d+)\s*x?\s*(?:[Rr]efill|[Pp]ad)/);
      if (m) return parseInt(m[1], 10);
    }
  }
  // Fallback: parse from name
  const m = (bundle.name || '').match(/(\d+)\s*[Rr]efill/);
  if (m) return parseInt(m[1], 10);
  // Fallback: parse from description
  const d = (bundle.description || '').match(/(\d+)\s*[Rr]efill/);
  if (d) return parseInt(d[1], 10);
  return null;
}

// Determine if bundle includes a wand/handle
function includesWand(bundle) {
  const text = (bundle.name + ' ' + bundle.description + ' ' + (bundle.items || []).join(' ')).toLowerCase();
  return /\bwand\b|\bhandle\b/i.test(text);
}

// Determine if bundle includes a caddy/holder
function includesCaddy(bundle) {
  const text = (bundle.name + ' ' + bundle.description + ' ' + (bundle.items || []).join(' ')).toLowerCase();
  return /\bcaddy\b|\bholder\b|\bhanger\b|\bventilated/i.test(text);
}

// Determine if bundle includes an auto-lid mechanism
function includesAutoLid(bundle) {
  const text = (bundle.name + ' ' + bundle.description + ' ' + (bundle.items || []).join(' ')).toLowerCase();
  return /\bauto\s*lid\b|\bautomatic\s*lid\b|\blower\b|\blid\b.*open/i.test(text);
}

function getBestFor(bundle) {
  const name = (bundle.name || '').toLowerCase();
  const tag = (bundle.tag || '').toLowerCase();
  if (bundle.popular || tag.includes('best') || tag.includes('popular') || name.includes('family') || name.includes('value')) {
    return 'Best Value for Families';
  }
  if (name.includes('starter') || name.includes('beginner') || name.includes('basic')) {
    return 'Perfect for Beginners';
  }
  if (name.includes('eco') || name.includes('refill') || name.includes('bulk')) {
    return 'Stock Up & Save';
  }
  return 'Premium Cleaning';
}

export default function BundleComparisonTable({ bundles }) {
  // Only show if we have 2+ bundles to compare
  if (!bundles || bundles.length < 2) return null;

  return (
    <div className="mt-16">
      <h3 className="text-center text-lg md:text-xl font-black italic uppercase tracking-tighter text-slate-900 mb-8">
        Compare Your Options
      </h3>

      <div className="overflow-x-auto -mx-4 px-4 pb-4">
        <div className="min-w-[640px]">
          {/* Header row */}
          <div className="grid" style={{ gridTemplateColumns: '140px repeat(' + bundles.length + ', 1fr)' }}>
            {/* Empty top-left */}
            <div className="sticky left-0 bg-[#f2efe8] z-10" />

            {bundles.map((bundle) => {
              const price = (bundle.sale_price != null && Number(bundle.sale_price) > 0 && Number(bundle.sale_price) < Number(bundle.price))
                ? Number(bundle.sale_price) : Number(bundle.price);
              return (
                <div key={bundle.id} className="relative px-4 pb-6 text-center">
                  {/* BEST VALUE / Tag */}
                  {bundle.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                      <Star size={10} className="fill-white" /> BEST VALUE
                    </div>
                  )}
                  {bundle.tag && !bundle.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-[#1a3a5c] text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full whitespace-nowrap">
                      {bundle.tag}
                    </div>
                  )}
                  <div className={'bg-white rounded-2xl border-2 p-5 ' + (bundle.popular ? 'border-emerald-400 shadow-lg shadow-emerald-100' : 'border-[#e5e0da]')}>
                    <div className="w-16 h-16 mx-auto bg-[#eef2f5] rounded-xl flex items-center justify-center mb-4">
                      <Package size={28} className="text-[#1a3a5c]/40" />
                    </div>
                    <h4 className="text-sm font-black italic uppercase tracking-tight text-slate-900 mb-1 leading-tight line-clamp-2 min-h-[2.5em]">
                      {bundle.name}
                    </h4>
                    <p className="text-2xl font-black italic tracking-tighter text-[#1a3a5c] mb-1">
                      ${price.toFixed(2)}
                    </p>
                    <a
                      href={'/products/' + bundle.id}
                      className={'inline-block mt-2 text-[8px] font-black uppercase tracking-widest px-5 py-2 rounded-full transition-all ' +
                        (bundle.popular
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-[#1a3a5c] text-white hover:bg-[#2a4a6c]')}
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature rows */}
          <ComparisonRow label="Includes Wand" bundles={bundles} getter={includesWand} icon />
          <ComparisonRow label="Includes Caddy" bundles={bundles} getter={includesCaddy} icon />
          <ComparisonRow label="Auto-Lid Mechanism" bundles={bundles} getter={includesAutoLid} icon />

          <div className="grid" style={{ gridTemplateColumns: '140px repeat(' + bundles.length + ', 1fr)' }}>
            <ComparisonLabel>Refill Count</ComparisonLabel>
            {bundles.map((b) => {
              const count = extractRefillCount(b);
              return (
                <div key={b.id} className="px-4 py-4 text-center border-b border-[#e5e0da]">
                  <span className="text-sm font-black text-slate-900">{count != null ? count + ' pads' : '\u2014'}</span>
                </div>
              );
            })}
          </div>

          <div className="grid" style={{ gridTemplateColumns: '140px repeat(' + bundles.length + ', 1fr)' }}>
            <ComparisonLabel>Cost per Pad</ComparisonLabel>
            {bundles.map((b) => {
              const count = extractRefillCount(b);
              const price = (b.sale_price != null && Number(b.sale_price) > 0 && Number(b.sale_price) < Number(b.price))
                ? Number(b.sale_price) : Number(b.price);
              const cpp = count && count > 0 ? (price / count) : null;
              const isLowest = bundles.every((other) => {
                const oc = extractRefillCount(other);
                const op = (other.sale_price != null && Number(other.sale_price) > 0 && Number(other.sale_price) < Number(other.price))
                  ? Number(other.sale_price) : Number(other.price);
                const ocpp = oc && oc > 0 ? (op / oc) : Infinity;
                return cpp != null && ocpp >= cpp;
              });
              return (
                <div key={b.id} className="px-4 py-4 text-center border-b border-[#e5e0da]">
                  {cpp != null ? (
                    <span className={'text-sm font-black ' + (isLowest ? 'text-emerald-600' : 'text-slate-900')}>
                      ${cpp.toFixed(2)}
                      {isLowest && <span className="ml-1 text-[9px] text-emerald-500 italic font-bold">LOWEST</span>}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">\u2014</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid" style={{ gridTemplateColumns: '140px repeat(' + bundles.length + ', 1fr)' }}>
            <ComparisonLabel>Best For</ComparisonLabel>
            {bundles.map((b) => (
              <div key={b.id} className="px-4 py-4 text-center border-b border-[#e5e0da]">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 italic">
                  {getBestFor(b)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-[9px] text-slate-400 italic mt-6">
        All prices in USD. Free shipping on all bundles within the continental US.
      </p>
    </div>
  );
}

function ComparisonLabel({ children }) {
  return (
    <div className="sticky left-0 bg-[#f2efe8] z-10 px-4 py-4 text-[8px] font-black uppercase tracking-widest text-slate-400 italic border-b border-[#e5e0da] flex items-center">
      {children}
    </div>
  );
}

function ComparisonRow({ label, bundles, getter, icon }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: '140px repeat(' + bundles.length + ', 1fr)' }}>
      <ComparisonLabel>{label}</ComparisonLabel>
      {bundles.map((b) => (
        <div key={b.id} className="px-4 py-4 text-center border-b border-[#e5e0da]">
          {getter(b) ? (
            <Check size={18} className="mx-auto text-emerald-500" strokeWidth={3} />
          ) : (
            <Minus size={18} className="mx-auto text-slate-300" />
          )}
        </div>
      ))}
    </div>
  );
}
