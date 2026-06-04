'use client'

import { useEffect, useRef } from 'react'

export function Hero3DScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = containerRef.current.clientWidth
    canvas.height = containerRef.current.clientHeight
    containerRef.current.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    // Particle system for background
    const particles: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      size: number
      color: string
    }> = []

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 1000 - 500,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 3,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? '#7C3AED' : '#06B6D4',
      })
    }

    // 3D rotation matrices
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
      const scale = 500 / (8 + point[2])
      return {
        x: canvas.width / 2 + point[0] * scale,
        y: canvas.height / 2 + point[1] * scale,
        scale: scale / 100,
      }
    }

    // Animation loop
    function animate() {
      if (!ctx) return
      // Clear with fade effect
      ctx.fillStyle = 'rgba(11, 15, 25, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 0.01

      // Update and draw particles
      particles.forEach((p) => {
        // Update position
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

        // Wrap around
        if (p.x > canvas.width / 2) p.x = -canvas.width / 2
        if (p.x < -canvas.width / 2) p.x = canvas.width / 2
        if (p.y > canvas.height / 2) p.y = -canvas.height / 2
        if (p.y < -canvas.height / 2) p.y = canvas.height / 2
        if (p.z > 500) p.z = -500
        if (p.z < -500) p.z = 500

        // Rotate point
        let point = [p.x, p.y, p.z]
        point = rotateX(point, time * 0.3)
        point = rotateY(point, time * 0.5)
        point = rotateZ(point, time * 0.2)

        const proj = project(point)

        // Draw particle
        const radius = Math.max(1, p.size * proj.scale)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.6 + Math.sin(time + p.z) * 0.4
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2)
        ctx.fill()

        // Glow
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.2
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, radius * 3, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1

      // Draw connecting lines
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.1)'
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dz = particles[i].z - particles[j].z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < 200) {
            let p1 = [particles[i].x, particles[i].y, particles[i].z]
            let p2 = [particles[j].x, particles[j].y, particles[j].z]

            p1 = rotateX(p1, time * 0.3)
            p1 = rotateY(p1, time * 0.5)
            p1 = rotateZ(p1, time * 0.2)

            p2 = rotateX(p2, time * 0.3)
            p2 = rotateY(p2, time * 0.5)
            p2 = rotateZ(p2, time * 0.2)

            const proj1 = project(p1)
            const proj2 = project(p2)

            ctx.beginPath()
            ctx.moveTo(proj1.x, proj1.y)
            ctx.lineTo(proj2.x, proj2.y)
            ctx.stroke()
          }
        }
      }

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
      className="absolute inset-0 w-full h-full"
    />
  )
}
