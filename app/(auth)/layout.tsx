import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12 relative">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)`,
          backgroundSize: '28px 28px',
          opacity: 0.6,
        }}
      />

      {/* Indigo glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_2px_8px_rgb(99_102_241/0.4)]">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Dukaanify</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_0_rgb(0_0_0/0.08)] border border-gray-200/80 p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Dukaanify · All rights reserved
        </p>
      </div>
    </div>
  )
}
