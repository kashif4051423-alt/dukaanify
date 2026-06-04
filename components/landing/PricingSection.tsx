'use client'

import { Pricing3DCard } from './Pricing3DCard'
import { ScrollReveal } from './ScrollReveal'

const PLANS = [
  {
    name: 'Starter',
    price: 'PKR 5,000',
    description: 'Perfect for getting started',
    features: [
      '2 Businesses / Stores',
      'Unlimited Products',
      'Online Order System',
      'WhatsApp Orders',
      'JazzCash / Easypaisa',
      'Order Dashboard',
      'Public Store Page',
      'Basic Analytics',
    ],
    highlighted: false,
  },
  {
    name: 'Growth',
    price: 'PKR 7,000',
    description: 'For growing businesses',
    features: [
      '5 Businesses / Stores',
      'Unlimited Products',
      'Online Order System',
      'WhatsApp Orders',
      'All Payment Methods',
      'Order Dashboard',
      'Public Store Pages',
      'Advanced Analytics',
      'Priority Support',
    ],
    highlighted: true,
  },
  {
    name: 'Pro Annual',
    price: 'PKR 15,000',
    description: 'Best value yearly plan',
    features: [
      '10 Businesses / Stores',
      'Unlimited Products',
      'Online Order System',
      'WhatsApp Orders',
      'All Payment Methods',
      'Advanced Dashboard',
      'Public Store Pages',
      'Advanced Analytics',
      'Priority Support',
      'Custom Domain',
    ],
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#0B0F19] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#06B6D4]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" distance={40}>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-[#A78BFA] uppercase tracking-widest mb-3">Pricing</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F9FAFB] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto">
              Choose the perfect plan for your business. No hidden fees, cancel anytime.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              distance={40}
              delay={idx * 0.15}
            >
              <Pricing3DCard
                name={plan.name}
                price={plan.price}
                description={plan.description}
                features={plan.features}
                highlighted={plan.highlighted}
                delay={0}
              />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="up" distance={40} delay={0.5}>
          <div className="mt-16 text-center">
            <p className="text-[#9CA3AF] mb-4">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#contact" className="px-6 py-3 bg-[#7C3AED] text-white font-semibold rounded-xl hover:bg-[#6D28D9] transition-colors">
                Get Started Free
              </a>
              <a href="#contact" className="px-6 py-3 bg-[#1F2937] text-[#F9FAFB] font-semibold rounded-xl hover:bg-[#7C3AED]/20 border border-[#1F2937] hover:border-[#7C3AED]/50 transition-colors">
                Contact Sales
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
