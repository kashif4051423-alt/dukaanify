'use client'

import { ScrollReveal } from './ScrollReveal'
import Link from 'next/link'

const steps = [
  {
    number: '01',
    title: 'Create Account',
    description: 'Sign up for free in seconds. No credit card needed.',
    icon: '👤',
  },
  {
    number: '02',
    title: 'Set Up Your Store',
    description: 'Add your business name, logo, and currency. Your store is live instantly.',
    icon: '🏪',
  },
  {
    number: '03',
    title: 'Add Products',
    description: 'Upload products with photos, prices, and stock. Takes under 5 minutes.',
    icon: '📦',
  },
  {
    number: '04',
    title: 'Start Selling',
    description: 'Share your store link and receive orders from customers anywhere.',
    icon: '💰',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" distance={40}>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-[#A78BFA] uppercase tracking-widest mb-3">How It Works</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F9FAFB] mb-4">
              Get started in 4 simple steps
            </h2>
            <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto">
              Launch your online store in minutes, not days. No technical skills required.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              distance={40}
              delay={idx * 0.1}
            >
              <div className="relative">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[calc(100%+24px)] h-0.5 bg-gradient-to-r from-[#7C3AED] to-transparent" />
                )}

                <div className="bg-[#0B0F19] rounded-2xl p-6 border border-[#1F2937] hover:border-[#7C3AED]/50 transition-all duration-300 h-full">
                  {/* Number */}
                  <div className="text-4xl font-bold text-[#7C3AED] mb-4">{step.number}</div>

                  {/* Icon */}
                  <div className="text-4xl mb-4">{step.icon}</div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#F9FAFB] mb-2">{step.title}</h3>

                  {/* Description */}
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="up" distance={40} delay={0.5}>
          <div className="mt-16 text-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#7C3AED] text-white font-semibold rounded-xl hover:bg-[#6D28D9] transition-all shadow-lg shadow-purple-900/40"
            >
              Start Your Free Store
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
