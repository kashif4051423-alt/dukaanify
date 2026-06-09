'use client'

import { useState } from 'react'
import { StarIcon } from './StarIcon'

const reviews = [
  {
    id: 1,
    name: 'Ali Madina Furniture',
    role: 'Store Owner',
    content: 'Dukaanify increased our sales by 300%. Everything is automated and so simple to use!',
    rating: 5,
    initials: 'AM',
  },
  {
    id: 2,
    name: 'Hassan Ahmed',
    role: 'Business Manager',
    content: 'Best platform ever! Auto-sync with Google Sheets, managing orders is incredibly easy.',
    rating: 5,
    initials: 'HA',
  },
  {
    id: 3,
    name: 'Fatima Khan',
    role: 'E-commerce Owner',
    content: 'The WhatsApp integration is a game changer! Customers can order directly through WhatsApp now.',
    rating: 5,
    initials: 'FK',
  },
  {
    id: 4,
    name: 'Muhammad Khan',
    role: 'Electronics Seller',
    content: 'Customer support is amazing. They helped me set everything up in minutes!',
    rating: 5,
    initials: 'MK',
  },
  {
    id: 5,
    name: 'Sarah Ahmed',
    role: 'Fashion Boutique Owner',
    content: 'The inventory management feature saved me so much time. Highly recommended!',
    rating: 5,
    initials: 'SA',
  },
  {
    id: 6,
    name: 'Rashid Hassan',
    role: 'Restaurant Owner',
    content: 'Orders are organized so well. Delivery tracking makes everything transparent.',
    rating: 5,
    initials: 'RH',
  },
]

export function ReviewsSection() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0b0f19]" id="reviews">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join thousands of successful business owners who trust Dukaanify
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {reviews.map((review) => (
            <button
              key={review.id}
              onClick={() => setExpandedId(expandedId === review.id ? null : review.id)}
              className="text-left bg-[#111827] rounded-2xl p-6 border border-[#1f2937] hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-amber-400 fill-current" />
                ))}
              </div>

              {/* Comment */}
              <p className={`mb-6 leading-relaxed transition-all duration-300 ${
                expandedId === review.id 
                  ? 'text-gray-200 line-clamp-none' 
                  : 'text-gray-400 line-clamp-3'
              }`}>
                "{review.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0 text-sm">
                  {review.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{review.name}</p>
                  <p className="text-xs text-gray-500 truncate">{review.role}</p>
                </div>
              </div>

              {/* Expand indicator */}
              <div className="mt-3 text-xs text-indigo-400 font-medium">
                {expandedId === review.id ? '← Click to collapse' : 'Click to read more →'}
              </div>
            </button>
          ))}
        </div>

        {/* Stats - Clickable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-[#1f2937]">
          {[
            { label: 'Happy Clients', value: '50+', icon: '👥' },
            { label: 'Total Orders', value: '10K+', icon: '📦' },
            { label: 'Total Sales', value: 'PKR 10K+', icon: '💰' },
          ].map((stat, idx) => (
            <button
              key={idx}
              className="text-center p-6 rounded-2xl border border-[#1f2937] bg-gradient-to-br from-[#111827] to-[#0b0f19] hover:from-indigo-950/30 hover:to-indigo-900/20 transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95 group"
            >
              <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300">
                {stat.icon}
              </div>
              <p className="text-4xl font-bold text-indigo-400 mb-2 group-hover:text-indigo-300">
                {stat.value}
              </p>
              <p className="text-gray-400 font-medium group-hover:text-gray-300">
                {stat.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
