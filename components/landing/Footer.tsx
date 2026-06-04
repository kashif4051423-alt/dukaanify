import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0B0F19] border-t border-[#1F2937] text-[#9CA3AF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-purple-900/30">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-[#F9FAFB] text-lg">Dukaanify</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Multi-tenant SaaS platform for managing online businesses. Built for entrepreneurs.
            </p>
            <div className="flex gap-3">
              {[
                {
                  href: 'https://github.com/kashif4051423-alt',
                  label: 'GitHub',
                  hoverClass: 'hover:bg-[#374151] hover:text-[#F9FAFB]',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  ),
                },
                {
                  href: 'https://wa.me/923347140884',
                  label: 'WhatsApp',
                  hoverClass: 'hover:bg-emerald-700 hover:text-white',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.347l-.355.192-3.674-.964.984 3.202-.196.315a9.86 9.86 0 001.34 5.076 9.997 9.997 0 008.368 4.6h.004c2.718 0 5.331-1.055 7.294-2.973a10.009 10.009 0 002.926-7.977c0-5.508-4.484-9.99-9.998-9.99" />
                    </svg>
                  ),
                },
                {
                  href: 'mailto:khashia791@gmail.com',
                  label: 'Email',
                  hoverClass: 'hover:bg-[#7C3AED] hover:text-white',
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0l-9.75 6.75L2.25 6.75" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`w-9 h-9 rounded-lg bg-[#1F2937] flex items-center justify-center transition-colors ${s.hoverClass}`}
                  title={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[#F9FAFB] font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="hover:text-[#A78BFA] transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#A78BFA] transition-colors">How it works</a></li>
              <li><Link href="/pricing" className="hover:text-[#A78BFA] transition-colors">Pricing</Link></li>
              <li><Link href="/register" className="hover:text-[#A78BFA] transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[#F9FAFB] font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#founder" className="hover:text-[#A78BFA] transition-colors">About</a></li>
              <li><a href="mailto:khashia791@gmail.com" className="hover:text-[#A78BFA] transition-colors">Contact</a></li>
              <li>
                <a href="https://github.com/kashif4051423-alt" target="_blank" rel="noopener noreferrer" className="hover:text-[#A78BFA] transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#F9FAFB] font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="mailto:khashia791@gmail.com" className="hover:text-[#A78BFA] transition-colors break-all">khashia791@gmail.com</a></li>
              <li><a href="tel:+923347140884" className="hover:text-[#A78BFA] transition-colors">+92 334 7140884</a></li>
              <li>
                <a href="https://wa.me/923347140884" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.347l-.355.192-3.674-.964.984 3.202-.196.315a9.86 9.86 0 001.34 5.076 9.997 9.997 0 008.368 4.6h.004c2.718 0 5.331-1.055 7.294-2.973a10.009 10.009 0 002.926-7.977c0-5.508-4.484-9.99-9.998-9.99" />
                  </svg>
                  WhatsApp Chat
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1F2937] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {year} Dukaanify. All rights reserved.</p>
          <p className="text-[#4B5563]">Built with Next.js · Supabase · Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}
