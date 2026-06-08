'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md border-b border-[#1F2937]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/#hero" className="flex items-center gap-2.5 group scroll-smooth">
            <img src="/logo.svg" alt="Dukaanify" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300 cursor-pointer" />
            <span className="font-bold text-white text-xl tracking-tight group-hover:text-indigo-300 transition-colors duration-300 cursor-pointer">Dukaanify</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium">How it works</a>
            <a href="#pricing" className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium">Pricing</a>
            <a href="#founder" className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium">About</a>
            <Link href="/pricing" className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors font-medium">Pricing Page</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-[#7C3AED] text-white px-5 py-2.5 rounded-lg hover:bg-[#6D28D9] transition-colors shadow-lg shadow-purple-900/30">
              Get Started Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-[#9CA3AF] hover:bg-[#111827] hover:text-[#F9FAFB] transition-colors"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#1F2937] bg-[#111827] px-4 py-4 space-y-1">
          <a href="#features" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] rounded-lg transition-colors">Features</a>
          <a href="#how-it-works" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] rounded-lg transition-colors">How it works</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] rounded-lg transition-colors">Pricing</a>
          <a href="#founder" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] rounded-lg transition-colors">About</a>
          <Link href="/pricing" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] rounded-lg transition-colors">Pricing Page</Link>
          <a href="#contact" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] rounded-lg transition-colors">Contact</a>
          <div className="pt-3 border-t border-[#1F2937] flex flex-col gap-2">
            <Link href="/login" className="block text-center px-4 py-2.5 text-sm font-semibold text-[#9CA3AF] border border-[#1F2937] rounded-lg hover:bg-[#1F2937] hover:text-[#F9FAFB] transition-colors">Sign In</Link>
            <Link href="/register" className="block text-center px-4 py-2.5 text-sm font-semibold bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors">Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
