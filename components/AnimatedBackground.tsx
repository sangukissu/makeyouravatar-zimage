'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    // Initial resize
    handleResize()
    window.addEventListener('resize', handleResize)

    // Grid configuration
    const gridSize = 40
    const perspective = 800
    let offset = 0

    const drawGrid = () => {
      ctx.fillStyle = '#020617' // midnight
      ctx.fillRect(0, 0, width, height)

      // Base gradient
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width)
      gradient.addColorStop(0, 'rgba(23, 37, 84, 0.3)') // aura-blue-dim
      gradient.addColorStop(1, 'rgba(2, 6, 23, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)' // aura-cyan-glow
      ctx.lineWidth = 1

      // Horizontal moving lines
      offset = (offset + 0.5) % gridSize
      
      // Draw grid with perspective
      for (let y = -height; y < height * 2; y += gridSize) {
        const yPos = y + offset
        
        ctx.beginPath()
        ctx.moveTo(0, yPos)
        ctx.lineTo(width, yPos)
        ctx.stroke()
      }

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Floating particles
      const time = Date.now() / 2000
      const particles = 20
      
      for (let i = 0; i < particles; i++) {
        const x = (Math.sin(time + i) * width/2) + width/2
        const y = (Math.cos(time + i * 1.5) * height/2) + height/2
        const size = Math.random() * 2 + 1
        
        ctx.fillStyle = `rgba(34, 211, 238, ${Math.abs(Math.sin(time + i)) * 0.5})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      
      animationFrameId = requestAnimationFrame(drawGrid)
    }

    drawGrid()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-midnight">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight/20 via-transparent to-midnight/80 pointer-events-none" />

      {/* Floating bright spots (Aura effect) - Keeping these for the atmospheric glow */}
      <motion.div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-aura-cyan-glow/5 blur-[120px]"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-aura-blue-glow/5 blur-[120px]"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Scanline effect - reduced intensity */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(transparent_50%,_rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
      
      {/* Noise */}
      <div className="absolute inset-0 noise" />
    </div>
  )
}
