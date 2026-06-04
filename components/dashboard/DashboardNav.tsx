'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'

const NAV_ITEMS = [
  { label: 'All Businesses', href: '/dashboard',              icon: GridIcon },
  { label: 'New Business',   href: '/dashboard/new-business', icon: PlusIcon },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const initials = (user?.user_metadata?.full_name as string | undefined)
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    ?? user?.email?.[0]?.toUpperCase() ?? '?'

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-[#111827] border-r border-[#1f2937] flex flex-col z-40',
        'transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#1f2937] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/images/dukannify logo.png" alt="Dukaanify" className="w-7 h-7 object-contain" />
            <span className="font-bold text-[#f9fafb] text-sm">Dukaanify</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1f2937] text-[#6b7280]"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">
            Navigation
          </p>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[#7c3aed] text-white shadow-sm'
                    : 'text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#f9fafb]'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-purple-200' : 'text-[#6b7280]')} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-[#1f2937]">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl px-4 py-3 mb-2 border border-purple-800/50">
            <p className="text-xs font-bold text-purple-300">Dukaanify</p>
            <p className="text-xs text-purple-400/70 mt-0.5">Multi-tenant SaaS platform</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#9ca3af] hover:bg-red-900/20 hover:text-red-400 transition-colors group"
          >
            <LogOutIcon className="w-4 h-4 text-[#6b7280] group-hover:text-red-400" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Top bar ── */}
      <header className="fixed top-0 left-0 right-0 lg:left-64 h-14 bg-[#111827] border-b border-[#1f2937] flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1f2937] text-[#9ca3af]"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-[#f9fafb]">Dashboard</span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#1f2937] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#7c3aed] flex items-center justify-center">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <span className="text-sm font-medium text-[#f9fafb] hidden sm:block max-w-[120px] truncate">
              {(user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? ''}
            </span>
            <ChevronIcon className={cn('w-3.5 h-3.5 text-[#6b7280] transition-transform', userMenuOpen && 'rotate-180')} />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#111827] border border-[#1f2937] rounded-xl shadow-lg z-20 py-1">
                <div className="px-4 py-3 border-b border-[#1f2937]">
                  <p className="text-sm font-semibold text-[#f9fafb] truncate">
                    {(user?.user_metadata?.full_name as string | undefined) ?? 'Account'}
                  </p>
                  <p className="text-xs text-[#6b7280] truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="border-t border-[#1f2937] mt-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  )
}

function GridIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
}
function PlusIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
}
function XIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
}
function MenuIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
}
function ChevronIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
}
function LogOutIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
}
