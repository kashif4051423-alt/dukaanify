'use client'

import { useRef, useEffect, useState } from 'react'

interface Feature3DCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  delay: number
}

export function Feature3DCard({
  icon,
  title,
  description,
  color,
  delay,
}: Feature3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    let rafId: number
    let lastMouseX = 0
    let lastMouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return

      lastMouseX = e.clientX
      lastMouseY = e.clientY

      // Throttle with RAF - only update every frame
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect()
        const x = lastMouseX - rect.left
        const y = lastMouseY - rect.top

        const rotateX = (y - rect.height / 2) / 10
        const rotateY = (x - rect.width / 2) / 10

        setRotation({ x: rotateX, y: rotateY })
      })
    }

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId)
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
        className={`relative h-full p-6 rounded-2xl border transition-all duration-300 group cursor-pointer
          ${color === 'purple'
            ? 'bg-gradient-to-br from-[#7C3AED]/10 to-[#7C3AED]/5 border-[#7C3AED]/30 hover:border-[#7C3AED]/60'
            : color === 'cyan'
              ? 'bg-gradient-to-br from-[#06B6D4]/10 to-[#06B6D4]/5 border-[#06B6D4]/30 hover:border-[#06B6D4]/60'
              : 'bg-gradient-to-br from-[#34D399]/10 to-[#34D399]/5 border-[#34D399]/30 hover:border-[#34D399]/60'
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
            ${color === 'purple'
              ? 'bg-[#7C3AED]/20'
              : color === 'cyan'
                ? 'bg-[#06B6D4]/20'
                : 'bg-[#34D399]/20'
            }`}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-xl
              ${color === 'purple'
                ? 'bg-[#7C3AED]/20 text-[#A78BFA]'
                : color === 'cyan'
                  ? 'bg-[#06B6D4]/20 text-[#22D3EE]'
                  : 'bg-[#34D399]/20 text-[#6EE7B7]'
              }`}
          >
            {icon}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-[#F9FAFB] mb-2 group-hover:text-[#A78BFA] transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            {description}
          </p>

          {/* Animated line */}
          <div
            className={`absolute bottom-0 left-0 h-1 rounded-full transition-all duration-300 group-hover:w-full
              ${color === 'purple'
                ? 'bg-gradient-to-r from-[#7C3AED] to-transparent'
                : color === 'cyan'
                  ? 'bg-gradient-to-r from-[#06B6D4] to-transparent'
                  : 'bg-gradient-to-r from-[#34D399] to-transparent'
              }`}
            style={{ width: '0%' }}
          />
        </div>
      </div>
    </div>
  )
}
