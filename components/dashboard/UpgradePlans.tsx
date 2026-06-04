'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PaymentForm } from './PaymentForm'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'PKR 5,000',
    period: '/ month',
    businesses: 2,
    highlight: false,
    badge: null,
    whatsappMsg: 'Hi! I want to buy the Starter Plan (PKR 5,000/month - 2 businesses). Please activate my account.',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 'PKR 7,000',
    period: '/ month',
    businesses: 5,
    highlight: true,
    badge: 'Popular',
    whatsappMsg: 'Hi! I want to buy the Growth Plan (PKR 7,000/month - 5 businesses). Please activate my account.',
  },
  {
    id: 'pro',
    name: 'Pro Annual',
    price: 'PKR 15,000',
    period: '/ year',
    businesses: 10,
    highlight: false,
    badge: 'Best Value',
    whatsappMsg: 'Hi! I want to buy the Pro Annual Plan (PKR 15,000/year - 10 businesses). Please activate my account.',
  },
]

export function UpgradePlans() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const selectedPlan = PLANS.find((p) => p.id === selected)
  const waMsg = selectedPlan?.whatsappMsg
    ?? 'Hi! I want to upgrade my Dukaanify plan. Please share payment details.'

  const waUrl = `https://wa.me/923269415471?text=${encodeURIComponent(waMsg)}`

  return (
    <div className="max-w-2xl w-full mx-auto">
      {/* Lock banner */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
          <LockIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Upgrade to Add More Businesses
        </h1>
        <p className="text-gray-500">
          You&apos;ve used your free business slot. Select a plan below to create more stores.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {PLANS.map((plan) => {
          const isSelected = selected === plan.id
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`relative bg-white rounded-2xl border-2 p-5 text-center transition-all duration-200 cursor-pointer hover:shadow-lg focus:outline-none ${
                isSelected
                  ? 'border-indigo-600 shadow-lg shadow-indigo-100 scale-105'
                  : plan.highlight
                    ? 'border-indigo-300 hover:border-indigo-500'
                    : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full ${
                  plan.highlight ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {plan.badge}
                </span>
              )}

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
              )}

              <p className="font-bold text-gray-900 mb-1 text-base">{plan.name}</p>
              <p className={`text-2xl font-bold ${isSelected ? 'text-indigo-600' : 'text-gray-800'}`}>
                {plan.price}
              </p>
              <p className="text-xs text-gray-400 mb-2">{plan.period}</p>
              <p className="text-sm font-semibold text-gray-600">
                {plan.businesses} businesses
              </p>
            </button>
          )
        })}
      </div>

      {/* Hint */}
      {!selected && (
        <p className="text-center text-sm text-indigo-600 font-medium mb-4 animate-pulse">
          👆 Click a plan to continue
        </p>
      )}

      {/* Payment section — always visible, highlights when plan selected */}
      <div className={`bg-white border rounded-2xl p-5 mb-6 transition-all duration-300 ${
        selected ? 'border-indigo-300 shadow-md' : 'border-gray-200'
      }`}>
        <p className="text-sm font-semibold text-gray-700 mb-1 text-center">
          {selected
            ? `Send payment for ${selectedPlan?.name} (${selectedPlan?.price} ${selectedPlan?.period})`
            : 'Send payment to activate your plan:'}
        </p>
        {selected && (
          <p className="text-xs text-gray-400 text-center mb-3">
            After payment, submit screenshot below — activated within 24 hours
          </p>
        )}

        {/* Show payment form if plan selected */}
        {selected && !showPaymentForm && (
          <div className="mb-4">
            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Submit Payment Screenshot
            </button>
          </div>
        )}

        {selected && showPaymentForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <PaymentForm
              planId={selected}
              planName={selectedPlan?.name || ''}
              planPrice={selectedPlan?.price || ''}
              onSuccess={() => {
                setShowPaymentForm(false)
                setSelected(null)
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-center text-xs mb-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="font-bold text-red-700 mb-1">🔴 JazzCash</p>
            <p className="text-gray-700 font-mono font-semibold">03269415471</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-3">
            <p className="font-bold text-green-700 mb-1">🟢 Easypaisa</p>
            <p className="text-gray-700 font-mono font-semibold">03269415471</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="font-bold text-blue-700 mb-1">🏦 Allied Bank</p>
            <p className="text-gray-600 font-mono text-[10px] break-all">53670020131980570017</p>
          </div>
        </div>

        {!showPaymentForm && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all ${
              selected
                ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-green-200'
                : 'bg-gray-100 text-gray-500 cursor-pointer hover:bg-[#25D366] hover:text-white'
            }`}
          >
            <WhatsAppIcon className="w-5 h-5" />
            {selected
              ? `Send ${selectedPlan?.name} Payment Screenshot`
              : 'Send Payment Screenshot on WhatsApp'}
          </a>
        )}
      </div>

      <div className="flex items-center justify-center gap-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Back to Dashboard
        </Link>
        <Link href="/pricing" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
          View Full Pricing →
        </Link>
      </div>
    </div>
  )
}

function LockIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
}
function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
}
function WhatsAppIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
