'use client'

import { useEffect, useRef } from 'react'

export function Hero3DAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = containerRef.current.clientWidth
    canvas.height = containerRef.current.clientHeight
    containerRef.current.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Animation state
    let animationId: number
    let rotation = 0

    // Cube vertices
    const vertices = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ]

    // Cube edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Front
      [4, 5], [5, 6], [6, 7], [7, 4], // Back
      [0, 4], [1, 5], [2, 6], [3, 7], // Sides
    ]

    // Rotation matrices
    function rotateX(point: number[], angle: number) {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return [
        point[0],
        point[1] * cos - point[2] * sin,
        point[1] * sin + point[2] * cos,
      ]
    }

    function rotateY(point: number[], angle: number) {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return [
        point[0] * cos + point[2] * sin,
        point[1],
        -point[0] * sin + point[2] * cos,
      ]
    }

    function rotateZ(point: number[], angle: number) {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return [
        point[0] * cos - point[1] * sin,
        point[0] * sin + point[1] * cos,
        point[2],
      ]
    }

    // Project 3D to 2D
    function project(point: number[]) {
      const scale = 300 / (8 + point[2])
      return [
        canvas.width / 2 + point[0] * scale,
        canvas.height / 2 + point[1] * scale,
      ]
    }

    // Animation loop
    function animate() {
      if (!ctx) return
      // Clear canvas
      ctx.fillStyle = 'rgba(11, 15, 25, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update rotation
      rotation += 0.01

      // Transform and project vertices
      const projectedVertices = vertices.map((v) => {
        let point = [...v]
        point = rotateX(point, rotation * 0.5)
        point = rotateY(point, rotation)
        point = rotateZ(point, rotation * 0.3)
        return project(point)
      })

      // Draw edges
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.6)'
      ctx.lineWidth = 2

      edges.forEach(([start, end]) => {
        const p1 = projectedVertices[start]
        const p2 = projectedVertices[end]

        ctx.beginPath()
        ctx.moveTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.stroke()
      })

      // Draw vertices
      projectedVertices.forEach((p) => {
        ctx.fillStyle = 'rgba(167, 139, 250, 0.8)'
        ctx.beginPath()
        ctx.arc(p[0], p[1], 4, 0, Math.PI * 2)
        ctx.fill()

        // Glow effect
        ctx.fillStyle = 'rgba(124, 58, 237, 0.2)'
        ctx.beginPath()
        ctx.arc(p[0], p[1], 8, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth
        canvas.height = containerRef.current.clientHeight
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      canvas.remove()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-96 bg-gradient-to-br from-[#7C3AED]/5 to-[#06B6D4]/5 rounded-2xl border border-[#7C3AED]/30 overflow-hidden shadow-2xl shadow-purple-900/30"
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent pointer-events-none" />

      {/* Info text */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="bg-[#111827]/80 backdrop-blur-sm border border-[#1F2937] rounded-xl p-4">
          <p className="text-xs text-[#9CA3AF] mb-2">Dashboard Preview</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-[#9CA3AF]">Orders</p>
              <p className="text-lg font-bold text-[#A78BFA]">1,284</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF]">Revenue</p>
              <p className="text-lg font-bold text-[#34D399]">PKR 84K</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF]">Products</p>
              <p className="text-lg font-bold text-[#22D3EE]">56</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
