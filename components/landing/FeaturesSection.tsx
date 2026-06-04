'use client'

import { Feature3DCard } from './Feature3DCard'
import { ScrollReveal } from './ScrollReveal'

const features = [
  {
    icon: '🏪',
    title: 'Online Store',
    description: 'Launch a professional store in minutes with a unique URL. Start selling immediately.',
    color: 'purple',
  },
  {
    icon: '📦',
    title: 'Product Management',
    description: 'Add products with images, pricing, and inventory. Organize your catalog effortlessly.',
    color: 'cyan',
  },
  {
    icon: '📋',
    title: 'Order Tracking',
    description: 'Receive and manage orders in real-time. Update statuses and notify customers.',
    color: 'green',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    description: 'Track revenue, orders, and customer insights with beautiful real-time charts.',
    color: 'purple',
  },
  {
    icon: '👥',
    title: 'Customer Management',
    description: 'Keep all customer records, contact info, and order history in one place.',
    color: 'cyan',
  },
  {
    icon: '💳',
    title: 'Multiple Payments',
    description: 'Accept COD, JazzCash, EasyPaisa, and SadaPay. Flexible for every customer.',
    color: 'green',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-[#0B0F19] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#06B6D4]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" distance={40}>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-[#A78BFA] uppercase tracking-widest mb-3">Features</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F9FAFB] mb-4">
              Everything you need to sell online
            </h2>
            <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto">
              A complete toolkit for managing your online business — from products to payments.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <ScrollReveal
              key={i}
              direction="up"
              distance={40}
              delay={i * 0.1}
            >
              <Feature3DCard
                icon={f.icon}
                title={f.title}
                description={f.description}
                color={f.color}
                delay={0}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
