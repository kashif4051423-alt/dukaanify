import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Dukaanify',
  description: 'Choose the right plan for your business',
}

const PLANS = [
  {
    name: 'Starter',
    nameUrdu: 'شروعات',
    price: 5000,
    period: 'month',
    businesses: 2,
    highlight: false,
    badge: null as string | null,
    color: 'border-gray-200',
    features: [
      '2 Businesses / Stores',
      'Unlimited Products',
      'Online Order System',
      'WhatsApp Orders',
      'JazzCash / Easypaisa',
      'Order Dashboard',
      'Public Store Page',
      'Basic Analytics',
    ],
  },
  {
    name: 'Growth',
    nameUrdu: 'ترقی',
    price: 7000,
    period: 'month',
    businesses: 5,
    highlight: true,
    badge: 'Most Popular' as string | null,
    color: 'border-indigo-500',
    features: [
      '5 Businesses / Stores',
      'Unlimited Products',
      'Online Order System',
      'WhatsApp Orders',
      'All Payment Methods',
      'Order Dashboard',
      'Public Store Pages',
      'Advanced Analytics',
      'Priority Support',
    ],
  },
  {
    name: 'Pro Annual',
    nameUrdu: 'سالانہ',
    price: 15000,
    period: 'year',
    businesses: 10,
    highlight: false,
    badge: 'Best Value' as string | null,
    color: 'border-emerald-400',
    features: [
      '10 Businesses / Stores',
      'Unlimited Products',
      'Online Order System',
      'WhatsApp Orders',
      'All Payment Methods',
      'Full Analytics',
      'Priority Support',
      'Custom Branding',
      '1 Year Access',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19]">
      {/* Nav */}
      <nav className="bg-[#111827] border-b border-[#1f2937] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/dukannify logo.png" alt="Dukaanify" className="w-7 h-7 object-contain" />
          <span className="font-bold text-[#f9fafb]">Dukaanify</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#9ca3af] hover:text-[#f9fafb] font-medium">Sign in</Link>
          <Link href="/register" className="text-sm bg-[#7c3aed] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="bg-purple-900/30 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-800/50">
            Simple Pricing
          </span>
          <h1 className="text-4xl font-bold text-[#f9fafb] mt-4 mb-3">Choose Your Plan</h1>
          <p className="text-[#9ca3af] text-lg max-w-xl mx-auto">
            Start selling online today. No hidden fees.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-[#111827] rounded-2xl border-2 p-6 flex flex-col ${
                plan.highlight ? 'border-[#7c3aed] shadow-xl shadow-purple-900/30 scale-105' : 'border-[#1f2937]'
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${
                  plan.highlight ? 'bg-[#7c3aed] text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <h2 className="text-xl font-bold text-[#f9fafb]">{plan.name}</h2>
                <p className="text-sm text-[#6b7280]">{plan.nameUrdu}</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#f9fafb]">
                    PKR {plan.price.toLocaleString()}
                  </span>
                  <span className="text-[#6b7280] text-sm">/{plan.period}</span>
                </div>
                <p className="text-sm text-[#7c3aed] font-semibold mt-1">
                  Up to {plan.businesses} businesses
                </p>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#9ca3af]">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-colors ${
                  plan.highlight
                    ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
                    : 'bg-[#1f2937] text-[#f9fafb] hover:bg-[#374151]'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 mb-8">
          <h2 className="text-lg font-bold text-[#f9fafb] text-center mb-6">
            How to Pay / ادائیگی کا طریقہ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔴</span>
                <span className="font-bold text-[#f9fafb]">JazzCash</span>
              </div>
              <p className="text-sm font-mono font-semibold text-red-300">03269415471</p>
            </div>
            <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🟢</span>
                <span className="font-bold text-[#f9fafb]">Easypaisa</span>
              </div>
              <p className="text-sm font-mono font-semibold text-green-300">03269415471</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏦</span>
                <span className="font-bold text-[#f9fafb]">Allied Bank</span>
              </div>
              <p className="text-sm font-mono font-semibold text-blue-300 break-all">53670020131980570017</p>
            </div>
          </div>
          <div className="mt-6 bg-yellow-900/20 border border-yellow-800/50 rounded-xl px-5 py-4 text-center">
            <p className="text-sm text-yellow-300 font-medium">
              After payment, send screenshot to WhatsApp:{' '}
              <a
                href="https://wa.me/923269415471"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-yellow-200 underline"
              >
                03269415471
              </a>
            </p>
            <p className="text-xs text-yellow-400 mt-1">Account activated within 24 hours</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[#9ca3af] text-sm">
            Questions?{' '}
            <a
              href="https://wa.me/923269415471?text=Hi, I want to know more about Dukaanify plans"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#7c3aed] font-semibold hover:underline"
            >
              Chat with us on WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
