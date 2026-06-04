import Link from 'next/link'
import { AnimateOnScroll } from './AnimateOnScroll'

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#06B6D4]" />
      {/* Noise overlay for depth */}
      <div className="absolute inset-0 bg-[#0B0F19]/30" />
      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimateOnScroll>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Free to get started
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to launch your online store?
          </h2>

          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Join hundreds of entrepreneurs already using Dukaanify to manage their businesses. No technical skills needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#7C3AED] font-bold rounded-xl hover:bg-white/90 transition-all shadow-xl text-base group"
            >
              Start for Free
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all text-base"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/50">
            No credit card required · Free forever plan · Setup in 2 minutes
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
