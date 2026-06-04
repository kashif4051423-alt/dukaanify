'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'

interface Pricing3DCardProps {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  delay: number
}

export function Pricing3DCard({
  name,
  price,
  description,
  features,
  highlighted = false,
  delay,
}: Pricing3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const rotateX = (y - rect.height / 2) / 15
      const rotateY = (x - rect.width / 2) / 15

      setRotation({ x: rotateX, y: rotateY })
    }

    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 })
      setIsHovered(false)
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)
    card.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
      card.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isHovered])

  return (
    <div
      ref={cardRef}
      className="h-full"
      style={{
        perspective: '1000px',
        animation: `slideUp 0.6s ease-out ${delay}s both`,
      }}
    >
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div
        className={`relative h-full p-8 rounded-2xl border transition-all duration-300 group cursor-pointer
          ${highlighted
            ? 'bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/10 border-[#7C3AED]/50 shadow-2xl shadow-purple-900/30'
            : 'bg-gradient-to-br from-[#111827]/50 to-[#0B0F19]/50 border-[#1F2937]/50 hover:border-[#7C3AED]/30'
          }`}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl
            ${highlighted ? 'bg-[#7C3AED]/30' : 'bg-[#7C3AED]/10'}`}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Badge */}
          {highlighted && (
            <div className="inline-block mb-4 px-3 py-1 bg-[#7C3AED]/20 border border-[#7C3AED]/50 rounded-full">
              <span className="text-xs font-semibold text-[#A78BFA]">Most Popular</span>
            </div>
          )}

          {/* Name */}
          <h3 className="text-2xl font-bold text-[#F9FAFB] mb-2">
            {name}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#9CA3AF] mb-6">
            {description}
          </p>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-[#F9FAFB]">
              {price}
            </span>
            {price !== 'Custom' && (
              <span className="text-[#9CA3AF] ml-2">/month</span>
            )}
          </div>

          {/* CTA Button */}
          <Link
            href="/register"
            className={`block w-full py-3 px-4 rounded-xl font-semibold text-center mb-6 transition-all duration-300
              ${highlighted
                ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-lg shadow-purple-900/40'
                : 'bg-[#1F2937] text-[#F9FAFB] hover:bg-[#7C3AED]/20 border border-[#1F2937] hover:border-[#7C3AED]/50'
              }`}
          >
            Get Started
          </Link>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-[#7C3AED] flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-[#9CA3AF]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
