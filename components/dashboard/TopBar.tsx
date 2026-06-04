'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import Link from 'next/link'

interface Props {
  title?: string
  onMenuClick?: () => void
}

export function TopBar({ title, onMenuClick }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const initials = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string)
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? 'Account'

  async function handleSignOut() {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-[#111827] border-b border-[#1f2937] flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20">
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1f2937] text-[#9ca3af] transition-colors"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        {title && (
          <h1 className="text-base font-semibold text-[#f9fafb] hidden sm:block">{title}</h1>
        )}
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-2">
        {/* Store link hint */}
        <Link
          href="/dashboard"
          className="hidden sm:flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-[#7c3aed] px-3 py-1.5 rounded-lg hover:bg-[#1f2937] transition-colors font-medium"
        >
          <GridIcon className="w-3.5 h-3.5" />
          Dashboard
        </Link>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#1f2937] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#7c3aed] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <span className="text-sm font-medium text-[#f9fafb] hidden sm:block max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronIcon className={`w-3.5 h-3.5 text-[#6b7280] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              {/* Menu */}
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#111827] border border-[#1f2937] rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-[#1f2937]">
                  <p className="text-sm font-semibold text-[#f9fafb] truncate">{displayName}</p>
                  <p className="text-xs text-[#6b7280] truncate mt-0.5">{user?.email}</p>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#9ca3af] hover:bg-[#1f2937] transition-colors"
                >
                  <GridIcon className="w-4 h-4 text-[#6b7280]" />
                  My Businesses
                </Link>

                <div className="border-t border-[#1f2937] mt-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
}
function GridIcon({ className }: { className?: string }) {
  return <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
}
function ChevronIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
}
function LogOutIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
}
