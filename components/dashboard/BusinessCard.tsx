import Link from 'next/link'
import Image from 'next/image'
import type { Business } from '@/types/models'
import { formatDate } from '@/lib/utils/format'

// Deterministic color from business name for avatar fallback
function getAvatarColor(name: string): string {
  const colors = [
    'bg-purple-900/30 text-purple-300',
    'bg-violet-900/30 text-violet-300',
    'bg-blue-900/30 text-blue-300',
    'bg-emerald-900/30 text-emerald-300',
    'bg-amber-900/30 text-amber-300',
    'bg-rose-900/30 text-rose-300',
    'bg-cyan-900/30 text-cyan-300',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export function BusinessCard({ business }: { business: Business }) {
  const avatarColor = getAvatarColor(business.name)
  const initials = business.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link
      href={`/${business.slug}`}
      className="group flex flex-col bg-[#111827] border border-[#1f2937] rounded-2xl p-5 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
          {business.logo_url ? (
            <Image
              src={business.logo_url}
              alt={business.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-sm font-bold ${avatarColor}`}>
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#f9fafb] truncate group-hover:text-[#7c3aed] transition-colors">
            {business.name}
          </p>
          <p className="text-xs text-[#6b7280] mt-0.5 truncate">/{business.slug}</p>
        </div>
        {/* Active badge */}
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
          business.is_active
            ? 'bg-emerald-900/30 text-emerald-300'
            : 'bg-[#1f2937] text-[#6b7280]'
        }`}>
          {business.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Description */}
      {business.description ? (
        <p className="text-xs text-[#9ca3af] line-clamp-2 mb-4 flex-1">{business.description}</p>
      ) : (
        <div className="flex-1" />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#1f2937]">
        <span className="text-xs text-[#6b7280]">
          Created {formatDate(business.created_at)}
        </span>
        <span className="text-xs font-medium text-[#7c3aed] group-hover:text-purple-300 flex items-center gap-1">
          Open
          <ArrowIcon className="w-3 h-3" />
        </span>
      </div>
    </Link>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}
