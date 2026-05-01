'use client'

import { Check, X } from 'lucide-react'

/**
 * Bundle Comparison Table — Bento Grid 版（V2）
 *
 * 取代旧的横向滑动对比表，改为 3 列 Bento Card 布局：
 * - 上方 NegativeChecklistBanner（"WHAT YOU WON'T GET WITH OLD BRUSHES" — Dropps 风格）
 * - 3 张 BundleCard（Bento Grid），含 3 词人格标签、特性列表、统一 teal-600 CTA
 * - 移动端自动堆叠为单列垂直卡片
 *
 * Props:
 *   bundles: Array<{ id, name, price, sale_price, description, image, items, tag, popular, stock }>
 */

// 3 词人格标签 — 按 bundle name 前缀匹配
const TAGLINES = {
  starter: 'Complete. Compact. Daily.',
  'auto-lid': 'Smart. Hygienic. Premium.',
  eco: 'Minimal. Sustainable. Refillable.',
}

// 特性列表 — 按 bundle name 前缀匹配
const FEATURES = {
  starter: ['Disposable Refills', '18" Extended Reach', 'Ergonomic Grip', 'Compact Storage'],
  'auto-lid': ['Disposable Refills', 'Auto-Lid Mechanism', '48 Pads Included', 'Odor-Proof Storage'],
  eco: ['48 Pads Included', 'Cleaning Solution Infused', 'Biodegradable Materials', 'Multi-Scent Options'],
}

// 负面清单项
const NEGATIVE_ITEMS = [
  'Bacteria Growth',
  'Wet Mess',
  'Reusable Germs',
  'Awkward Storage',
  'Under-Rim Struggle',
]

function getBundleKey(bundle) {
  const name = (bundle.name || '').toLowerCase()
  if (name.includes('eco')) return 'eco'
  if (name.includes('auto') || name.includes('lid')) return 'auto-lid'
  return 'starter'
}

function getTagline(bundle) {
  return TAGLINES[getBundleKey(bundle)] || ''
}

function getFeatures(bundle) {
  return FEATURES[getBundleKey(bundle)] || []
}

function isBestValue(bundle) {
  return bundle.popular || (getBundleKey(bundle) === 'auto-lid')
}

function getDisplayPrice(bundle) {
  const sp = bundle.sale_price
  if (sp != null && Number(sp) > 0 && Number(sp) < Number(bundle.price)) {
    return Number(sp)
  }
  return Number(bundle.price)
}

// 产品图：先尝试 site_images 映射，否则 fallback 到 bundle.image
function getImageUrl(bundle, index) {
  const IMAGE_MAP = [
    'https://pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev/products/bundle-starter-kit.jpg',
    'https://pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev/products/bundle-family-pack.jpg',
    'https://pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev/products/bundle-eco-refill.jpg',
  ]
  return IMAGE_MAP[index] || bundle.image
}

// ─── 子组件 ───────────────────────────────────────

function NegativeChecklistBanner() {
  return (
    <div className="bg-stone-50 rounded-2xl p-5 md:p-6 mb-8">
      <p className="text-stone-900 font-semibold text-xs uppercase tracking-wider mb-3">
        What you won&apos;t get with old brushes
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {NEGATIVE_ITEMS.map((item) => (
          <span key={item} className="text-stone-600 text-sm italic flex items-center gap-1.5">
            <X size={14} className="text-red-400 shrink-0" />
            {item}
          </span>
        ))}
      </div>
      <p className="text-stone-400 text-xs mt-3 leading-relaxed">
        All clowand brushes are disposable, sealed, and designed for one-time hygienic use.
      </p>
    </div>
  )
}

function BundleCard({ bundle, index }) {
  const key = getBundleKey(bundle)
  const tagline = getTagline(bundle)
  const features = getFeatures(bundle)
  const bestValue = isBestValue(bundle)
  const price = getDisplayPrice(bundle)
  const imageUrl = getImageUrl(bundle, index)

  return (
    <div
      className={
        'relative flex flex-col bg-white rounded-2xl p-6 transition-all duration-300 ' +
        (bestValue
          ? 'border-2 border-teal-500 shadow-md shadow-teal-100/50'
          : 'border border-stone-200 shadow-sm hover:shadow-lg')
      }
    >
      {/* ★ BEST VALUE 角标 */}
      {bestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 inline-block px-4 py-1 bg-teal-500 text-white text-[10px] font-semibold uppercase tracking-wider rounded-full whitespace-nowrap shadow-sm">
          ★ Best Value
        </div>
      )}

      {/* 产品图 */}
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-white mb-4">
        <img
          src={imageUrl}
          alt={bundle.name}
          className="w-full h-full object-contain p-2"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      </div>

      {/* 3 词标签 */}
      {tagline && (
        <p className="text-teal-700 font-serif italic text-sm opacity-85 mb-1">
          &ldquo;{tagline}&rdquo;
        </p>
      )}

      {/* 标题 */}
      <h4 className="text-stone-900 font-bold text-base mb-1 leading-snug line-clamp-1">
        {key === 'starter' ? 'Starter Kit' : key === 'auto-lid' ? 'Auto-Lid Bundle' : 'Eco Refill Box'}
      </h4>

      {/* 简述 */}
      <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-2 min-h-[2.6em]">
        {bundle.description}
      </p>

      {/* 特性列表 */}
      <ul className="space-y-1.5 mb-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-stone-700 text-sm leading-5">
            <Check size={14} className="text-teal-600 shrink-0 mt-0.5" strokeWidth={3} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* Spacer for bottom alignment */}
      <div className="flex-1" />

      {/* 价格 */}
      <div className="mb-4">
        <span className="text-stone-900 font-bold text-3xl">${price.toFixed(2)}</span>
        <span className="text-teal-600 text-xs ml-2 font-medium">+ Free Shipping</span>
      </div>

      {/* CTA 按钮 — 统一 teal-600 */}
      <a
        href={'/products/' + bundle.id}
        className="block w-full py-3 rounded-lg bg-teal-600 text-white text-center text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:bg-teal-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
      >
        Add to Cart
      </a>
    </div>
  )
}

// ─── 主组件 ───────────────────────────────────────

export default function BundleComparisonTable({ bundles }) {
  if (!bundles || bundles.length < 2) return null

  return (
    <div className="mt-16">
      <h3 className="text-center font-serif text-stone-900 text-2xl md:text-3xl mb-6">
        Compare Your Options
      </h3>

      {/* 负面清单对比横幅 */}
      <NegativeChecklistBanner />

      {/* Bento Grid — 3 卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {bundles.map((bundle, i) => (
          <BundleCard key={bundle.id} bundle={bundle} index={i} />
        ))}
      </div>

      <p className="text-center text-[10px] text-stone-400 italic mt-6">
        All prices in USD. Free shipping on all bundles within the continental US.
      </p>
    </div>
  )
}
