'use client'

import { useEffect, useRef } from 'react'

export function Admin3DBackground() {
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

    // Grid particles
    const particles: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      size: number
    }> = []

    // Create grid pattern
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 500 - 250,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 1,
        size: Math.random() * 2 + 1,
      })
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

    function project(point: number[]) {
      const scale = 300 / (5 + point[2])
      return {
        x: canvas.width / 2 + point[0] * scale,
        y: canvas.height / 2 + point[1] * scale,
        scale: scale / 100,
      }
    }

    function animate() {
      if (!ctx) return
      ctx.fillStyle = 'rgba(15, 23, 42, 0.02)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 0.005

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

        if (p.x > canvas.width / 2) p.x = -canvas.width / 2
        if (p.x < -canvas.width / 2) p.x = canvas.width / 2
        if (p.y > canvas.height / 2) p.y = -canvas.height / 2
        if (p.y < -canvas.height / 2) p.y = canvas.height / 2
        if (p.z > 250) p.z = -250
        if (p.z < -250) p.z = 250

        let point = [p.x, p.y, p.z]
        point = rotateY(point, time)

        const proj = project(point)

        // Draw particle
        const radius = Math.max(0.5, p.size * proj.scale)
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)'
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2)
        ctx.fill()

        // Glow
        ctx.fillStyle = 'rgba(99, 102, 241, 0.1)'
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, radius * 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw connecting lines
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dz = particles[i].z - particles[j].z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < 150) {
            let p1 = [particles[i].x, particles[i].y, particles[i].z]
            let p2 = [particles[j].x, particles[j].y, particles[j].z]

            p1 = rotateY(p1, time)
            p2 = rotateY(p2, time)

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

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />
}
