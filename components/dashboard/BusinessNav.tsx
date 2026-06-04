'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { Business } from '@/types/models'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import Image from 'next/image'

const NAV_ITEMS = [
  { label: 'Overview',  path: '',          icon: HomeIcon },
  { label: 'Products',  path: '/products', icon: BoxIcon },
  { label: 'Orders',    path: '/orders',   icon: ClipboardIcon },
  { label: 'Customers', path: '/customers',icon: UsersIcon },
  { label: 'Settings',  path: '/settings', icon: CogIcon },
]

export function BusinessNav({ business }: { business: Business }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { user } = useUser()
  const base = `/${business.slug}`
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const currentPage = NAV_ITEMS.find(({ path }) =>
    path === '' ? pathname === base : pathname.startsWith(`${base}${path}`)
  )?.label ?? 'Dashboard'

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
      {/* ── Sidebar ─────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-[#111827] border-r border-[#1f2937] flex flex-col z-40',
        'transition-transform duration-300 ease-in-out',
        'lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Sidebar logo */}
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

        {/* Business card */}
        <div className="px-3 py-3 border-b border-[#1f2937]">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#7c3aed] mb-2 transition-colors"
          >
            <ArrowLeftIcon className="w-3 h-3" />
            All Businesses
          </Link>
          <div className="flex items-center gap-2.5 bg-[#1f2937] rounded-xl px-3 py-2.5">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[#374151]">
              {business.logo_url ? (
                <Image src={business.logo_url} alt={business.name} fill className="object-cover" sizes="36px" />
              ) : (
                <div className="w-full h-full bg-purple-900/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                  {business.name[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#f9fafb] truncate">{business.name}</p>
              <p className="text-xs text-[#6b7280] truncate">/{business.slug}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">
            Manage
          </p>
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const href = `${base}${path}`
            const isActive = path === '' ? pathname === base : pathname.startsWith(`${base}${path}`)
            return (
              <Link
                key={path}
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

        {/* View store + sign out */}
        <div className="px-3 py-3 border-t border-[#1f2937] space-y-1">
          <a
            href={`/store/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#7c3aed] bg-purple-900/20 hover:bg-purple-900/30 transition-colors font-medium border border-purple-800/50"
          >
            <ExternalIcon className="w-4 h-4" />
            View Store
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#9ca3af] hover:bg-red-900/20 hover:text-red-400 transition-colors group"
          >
            <LogOutIcon className="w-4 h-4 text-[#6b7280] group-hover:text-red-400" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Top bar (always visible, sits in the content column) ── */}
      <header className="lg:pl-64 fixed top-0 left-0 right-0 h-14 bg-[#111827] border-b border-[#1f2937] flex items-center justify-between px-4 z-20">
        {/* Left: hamburger + page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1f2937] text-[#9ca3af]"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-[#f9fafb]">{currentPage}</span>
        </div>

        {/* Right: user menu */}
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
                <Link
                  href="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#9ca3af] hover:bg-[#1f2937]"
                >
                  <GridIcon className="w-4 h-4 text-[#6b7280]" />
                  All Businesses
                </Link>
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

// Icons
function HomeIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
}
function BoxIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
}
function ClipboardIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
}
function UsersIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
}
function CogIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}
function GridIcon({ className }: { className?: string }) {
  return <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg className={className ?? 'w-3 h-3'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
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
function ExternalIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
}
function LogOutIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
}
