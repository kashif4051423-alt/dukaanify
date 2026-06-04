import Image from 'next/image'
import { AnimateOnScroll } from './AnimateOnScroll'

export function FounderSection() {
  return (
    <section id="founder" className="py-20 sm:py-28 bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold text-[#A78BFA] uppercase tracking-widest mb-3">Meet the Founder</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F9FAFB] mb-3">Built by Kashif</h2>
            <p className="text-[#9CA3AF] max-w-xl mx-auto">A passionate full-stack developer building tools for entrepreneurs.</p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <div className="max-w-4xl mx-auto bg-[#111827] border border-[#1F2937] rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="relative min-h-[320px] md:min-h-[420px]">
                <Image
                  src="/images/kashif foun.jpg"
                  alt="Kashif Dev — Full Stack Developer"
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center gap-1.5 bg-[#0B0F19]/70 backdrop-blur text-[#F9FAFB] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#1F2937]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Available for projects
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#F9FAFB] mb-1">Kashif Dev</h3>
                  <p className="text-[#A78BFA] font-semibold mb-4">Full Stack Developer & Founder</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Next.js', 'React', 'Supabase', 'TypeScript'].map((t) => (
                      <span key={t} className="px-3 py-1 bg-[#7C3AED]/10 text-[#A78BFA] text-xs font-semibold rounded-full border border-[#7C3AED]/20">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    Kashif built Dukaanify to help small businesses and entrepreneurs manage their online stores effortlessly — without needing technical expertise.
                  </p>
                </div>

                <div className="space-y-3 mb-7 pb-7 border-b border-[#1F2937]">
                  <a href="mailto:khashia791@gmail.com" className="flex items-center gap-3 text-sm text-[#9CA3AF] hover:text-[#A78BFA] transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-[#1F2937] flex items-center justify-center group-hover:bg-[#7C3AED]/10 transition-colors flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0l-9.75 6.75L2.25 6.75" />
                      </svg>
                    </div>
                    khashia791@gmail.com
                  </a>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1F2937] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div className="text-sm text-[#9CA3AF]">
                      <a href="tel:+923347140884" className="hover:text-[#A78BFA] transition-colors block">+92 334 7140884</a>
                      <a href="tel:+923269415471" className="hover:text-[#A78BFA] transition-colors block">+92 326 9415471</a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href="https://wa.me/923347140884"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.347l-.355.192-3.674-.964.984 3.202-.196.315a9.86 9.86 0 001.34 5.076 9.997 9.997 0 008.368 4.6h.004c2.718 0 5.331-1.055 7.294-2.973a10.009 10.009 0 002.926-7.977c0-5.508-4.484-9.99-9.998-9.99" />
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href="mailto:khashia791@gmail.com"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#7C3AED] text-white text-sm font-semibold rounded-xl hover:bg-[#6D28D9] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0l-9.75 6.75L2.25 6.75" />
                    </svg>
                    Email
                  </a>
                  <a
                    href="https://github.com/kashif4051423-alt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 flex items-center justify-center py-2.5 bg-[#1F2937] text-[#9CA3AF] rounded-xl hover:bg-[#374151] hover:text-[#F9FAFB] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
