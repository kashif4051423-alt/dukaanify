'use client'

import { useState } from 'react'

export function ProfessionalContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true)
      setIsLoading(false)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })

      // Reset after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    }, 1500)
  }

  return (
    <div className="relative">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .form-group {
          animation: slideUp 0.5s ease-out forwards;
        }

        .form-group:nth-child(1) { animation-delay: 0.1s; }
        .form-group:nth-child(2) { animation-delay: 0.2s; }
        .form-group:nth-child(3) { animation-delay: 0.3s; }
        .form-group:nth-child(4) { animation-delay: 0.4s; }
        .form-group:nth-child(5) { animation-delay: 0.5s; }

        .success-message {
          animation: slideUp 0.4s ease-out;
        }

        input, textarea, select {
          transition: all 0.3s ease;
        }

        input:focus, textarea:focus, select:focus {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }
      `}</style>

      <div className="relative bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-2xl p-px shadow-2xl shadow-purple-900/30">
        <div className="bg-[#0B0F19] rounded-2xl p-8">
          {submitted ? (
            <div className="success-message text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#F9FAFB] mb-2">Message Sent!</h3>
              <p className="text-[#9CA3AF]">Thank you for reaching out. We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-[#F9FAFB] mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-[#111827] border border-[#1F2937] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-[#F9FAFB] mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-[#111827] border border-[#1F2937] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Phone */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-[#F9FAFB] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 bg-[#111827] border border-[#1F2937] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none"
                  />
                </div>

                {/* Subject */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-[#F9FAFB] mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#111827] border border-[#1F2937] rounded-lg text-[#F9FAFB] focus:outline-none"
                  >
                    <option value="">Select a subject</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-[#F9FAFB] mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  className="w-full px-4 py-3 bg-[#111827] border border-[#1F2937] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="form-group">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1F2937]">
                <div className="text-center">
                  <p className="text-2xl mb-1">📧</p>
                  <p className="text-xs text-[#9CA3AF]">Email</p>
                  <p className="text-xs font-semibold text-[#A78BFA]">khashia791@gmail.com</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">📱</p>
                  <p className="text-xs text-[#9CA3AF]">Phone</p>
                  <p className="text-xs font-semibold text-[#A78BFA]">+92 334 7140884</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">💬</p>
                  <p className="text-xs text-[#9CA3AF]">WhatsApp</p>
                  <p className="text-xs font-semibold text-[#A78BFA]">Chat Now</p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
