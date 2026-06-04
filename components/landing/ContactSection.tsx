'use client'

import { ProfessionalContactForm } from './ProfessionalContactForm'

export function ContactSection() {
  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#0B0F19] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#06B6D4]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-[#A78BFA] uppercase tracking-widest mb-3">Get in Touch</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F9FAFB] mb-4">
            Let's Talk
          </h2>
          <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Info */}
          <div className="space-y-8">
            <div className="group">
              <div className="flex items-start gap-4 p-6 rounded-xl bg-[#111827]/50 border border-[#1F2937] hover:border-[#7C3AED]/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#F9FAFB] mb-1">Email</h3>
                  <p className="text-[#9CA3AF]">Send us an email anytime</p>
                  <a href="mailto:khashia791@gmail.com" className="text-[#A78BFA] font-semibold hover:text-[#7C3AED] transition-colors">
                    khashia791@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-4 p-6 rounded-xl bg-[#111827]/50 border border-[#1F2937] hover:border-[#7C3AED]/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#F9FAFB] mb-1">Phone</h3>
                  <p className="text-[#9CA3AF]">Call us during business hours</p>
                  <div className="space-y-1">
                    <a href="tel:+923347140884" className="block text-[#A78BFA] font-semibold hover:text-[#7C3AED] transition-colors">
                      +92 334 7140884
                    </a>
                    <a href="tel:+923269415471" className="block text-[#A78BFA] font-semibold hover:text-[#7C3AED] transition-colors">
                      +92 326 9415471
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-4 p-6 rounded-xl bg-[#111827]/50 border border-[#1F2937] hover:border-[#7C3AED]/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-2.87 1.693-4.773 4.574-4.773 7.88 0 1.141.147 2.25.43 3.285L2.98 22l3.528-.931c3.6 1.803 7.831 1.271 10.684-1.32 2.853-2.591 3.544-6.684 1.488-10.07-.703-1.231-1.649-2.306-2.766-3.105A9.884 9.884 0 0011.051 6.979z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#F9FAFB] mb-1">WhatsApp</h3>
                  <p className="text-[#9CA3AF]">Chat with us on WhatsApp</p>
                  <a href="https://wa.me/923347140884" target="_blank" rel="noopener noreferrer" className="text-[#A78BFA] font-semibold hover:text-[#7C3AED] transition-colors">
                    Start Chat
                  </a>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-4 p-6 rounded-xl bg-[#111827]/50 border border-[#1F2937] hover:border-[#7C3AED]/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-600 to-pink-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#F9FAFB] mb-1">Location</h3>
                  <p className="text-[#9CA3AF]">Based in Pakistan</p>
                  <p className="text-[#A78BFA] font-semibold">Available Worldwide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div>
            <ProfessionalContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
