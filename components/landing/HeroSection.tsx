'use client'

import Link from 'next/link'
import { Hero3DScene } from './Hero3DScene'
import { ProfessionalDashboard } from './ProfessionalDashboard'

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#0B0F19] pt-16 pb-20 sm:pt-24 sm:pb-28 min-h-screen flex items-center scroll-smooth">
      {/* 3D Background */}
      <div className="absolute inset-0 -z-10">
        <Hero3DScene />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0B0F19] via-transparent to-[#0B0F19]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#A78BFA] text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
              Multi-tenant SaaS Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F9FAFB] tracking-tight leading-[1.1] mb-6">
              Manage Multiple{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
                Businesses
              </span>{' '}
              in One Place
            </h1>

            <p className="text-lg text-[#9CA3AF] mb-8 leading-relaxed max-w-xl">
              Create online stores, manage products, receive orders, and track analytics — all from a single dashboard. Built for entrepreneurs and small businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#7C3AED] text-white font-semibold rounded-xl hover:bg-[#6D28D9] transition-all shadow-lg shadow-purple-900/40 text-base group"
              >
                Start Free Today
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-transparent text-[#F9FAFB] font-semibold rounded-xl border border-[#1F2937] hover:border-[#7C3AED]/50 hover:bg-[#111827] transition-all text-base"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#9CA3AF]">
              {['No credit card required', 'Free forever plan', 'Setup in 2 minutes'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#7C3AED] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — professional dashboard */}
          <div className="relative">
            <ProfessionalDashboard />
            {/* Floating badge */}
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-[#111827] border border-[#1F2937] rounded-xl shadow-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#A78BFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF]">This month</p>
                <p className="text-sm font-bold text-[#F9FAFB]">+32% Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
