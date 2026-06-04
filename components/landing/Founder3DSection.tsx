'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export function Founder3DSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section id="founder" className="py-20 sm:py-28 bg-[#0B0F19] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#06B6D4]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#A78BFA]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block text-xs font-semibold text-[#A78BFA] uppercase tracking-widest mb-3 animate-pulse">Meet the Founder</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F9FAFB] mb-3 bg-gradient-to-r from-[#A78BFA] via-[#F9FAFB] to-[#22D3EE] bg-clip-text text-transparent">
            Built by Kashif
          </h2>
          <p className="text-[#9CA3AF] max-w-xl mx-auto text-lg">A passionate full-stack developer building tools for entrepreneurs.</p>
        </div>

        {/* 3D Card Container */}
        <div className={`max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div
            className="relative"
            style={isMounted ? {
              perspective: '1200px',
              transform: `rotateX(${(mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) * 0.01}deg) rotateY(${(mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) * 0.01}deg)`,
              transition: 'transform 0.1s ease-out',
            } : {}}
          >
            {/* Gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#A78BFA] rounded-3xl p-px shadow-2xl shadow-purple-900/50 blur-xl opacity-75 animate-pulse" />

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-[#111827] to-[#0B0F19] rounded-3xl overflow-hidden border border-[#1F2937]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 sm:p-12">
                {/* Image Section */}
                <div className={`relative group transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                  <div className="relative min-h-[320px] md:min-h-[420px] rounded-2xl overflow-hidden">
                    {/* 3D rotation effect */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 rounded-2xl"
                      style={isMounted ? {
                        transform: `rotateX(${(mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) * 0.02}deg) rotateY(${(mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) * 0.02}deg)`,
                      } : {}}
                    />

                    <Image
                      src="/images/kashif foun.jpg"
                      alt="Kashif Dev — Full Stack Developer"
                      fill
                      className="object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/90 via-transparent to-transparent" />

                    {/* Live badge */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-[#0B0F19]/80 backdrop-blur-md text-[#F9FAFB] text-xs font-semibold px-4 py-2 rounded-full border border-emerald-500/50 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Available for projects
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className={`flex flex-col justify-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                  {/* Name & Title */}
                  <div className="mb-8 space-y-3">
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#F9FAFB] to-[#A78BFA] bg-clip-text text-transparent">
                        Kashif Dev
                      </h3>
                      <p className="text-sm text-[#9CA3AF] mt-1">3+ Years Experience</p>
                    </div>
                    <p className="text-lg text-[#22D3EE] font-semibold">Founder & Owner of Dukaanify</p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 pt-3">
                      {['Next.js', 'React', 'Supabase', 'TypeScript', 'Tailwind'].map((tech, idx) => (
                        <div
                          key={tech}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#7C3AED]/20 to-[#06B6D4]/20 text-[#A78BFA] text-xs font-semibold rounded-full border border-[#7C3AED]/30 hover:border-[#7C3AED]/60 transition-all hover:shadow-lg hover:shadow-purple-900/30 cursor-default"
                          style={{
                            animation: `slideIn 0.5s ease-out ${idx * 0.1}s both`,
                          }}
                        >
                          {tech}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[#9CA3AF] text-base leading-relaxed mb-8 p-4 rounded-lg bg-[#111827]/50 border border-[#1F2937] hover:border-[#7C3AED]/30 transition-all">
                    Kashif built Dukaanify to help small businesses and entrepreneurs manage their online stores effortlessly. With 3+ years of experience, he created a platform where you can run your entire business from home — manage products, track orders, handle customers, and grow your business online without any technical knowledge.
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-8 pb-8 border-b border-[#1F2937]">
                    {/* Email */}
                    <a
                      href="mailto:khashia791@gmail.com"
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#111827]/50 border border-[#1F2937] hover:border-[#7C3AED]/50 hover:bg-[#1F2937]/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-purple-900/50 transition-all">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-[#9CA3AF]">Email</p>
                        <p className="text-sm font-semibold text-[#F9FAFB] group-hover:text-[#A78BFA] transition-colors">khashia791@gmail.com</p>
                      </div>
                    </a>

                    {/* Phone */}
                    <a
                      href="tel:+923347140884"
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#111827]/50 border border-[#1F2937] hover:border-[#22D3EE]/50 hover:bg-[#1F2937]/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-blue-900/50 transition-all">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-[#9CA3AF]">Phone</p>
                        <p className="text-sm font-semibold text-[#F9FAFB] group-hover:text-[#22D3EE] transition-colors">+92 334 7140884</p>
                      </div>
                    </a>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="https://wa.me/923347140884"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#25D366] to-[#20BA63] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-green-900/50 hover:scale-105 transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-2.87 1.693-4.773 4.574-4.773 7.88 0 1.141.147 2.25.43 3.285L2.98 22l3.528-.931c3.6 1.803 7.831 1.271 10.684-1.32 2.853-2.591 3.544-6.684 1.488-10.07-.703-1.231-1.649-2.306-2.766-3.105A9.884 9.884 0 0011.051 6.979z" />
                      </svg>
                      WhatsApp
                    </a>
                    <a
                      href="https://github.com/kashif4051423-alt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-900/50 hover:scale-105 transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
