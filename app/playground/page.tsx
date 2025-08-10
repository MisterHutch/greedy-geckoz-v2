'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Download, RotateCcw, Shuffle, Palette, Droplets, Layers, Zap } from 'lucide-react'
import Header from '../components/Header'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  maxAge: number
  size: number
  color: string
}

interface FluidSettings {
  viscosity: number
  dieThickness: number
  polarity: number
  gravity: number
  particleCount: number
  colors: string[]
  currentColor: string
}

export default function FluidPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  
  const [settings, setSettings] = useState<FluidSettings>({
    viscosity: 0.98,
    dieThickness: 3,
    polarity: 1,
    gravity: 0.1,
    particleCount: 500,
    colors: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b', '#fb5607'],
    currentColor: '#ff006e'
  })

  const [isPlaying, setIsPlaying] = useState(false)

  // Initialize canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Spawn particles at position
  const spawnParticles = useCallback((x: number, y: number) => {
    const particlesToSpawn = Math.min(10, settings.particleCount - particlesRef.current.length)
    
    for (let i = 0; i < particlesToSpawn; i++) {
      const angle = (Math.PI * 2 * i) / particlesToSpawn
      const speed = 1 + Math.random() * 3
      
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed * settings.polarity,
        vy: Math.sin(angle) * speed * settings.polarity,
        age: 0,
        maxAge: 300 + Math.random() * 200,
        size: settings.dieThickness + Math.random() * settings.dieThickness,
        color: settings.currentColor
      })
    }
  }, [settings])

  // Mouse interaction handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    mouseRef.current.x = e.clientX - rect.left
    mouseRef.current.y = e.clientY - rect.top

    if (mouseRef.current.isDown && isPlaying) {
      spawnParticles(mouseRef.current.x, mouseRef.current.y)
    }
  }, [isPlaying, spawnParticles])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseRef.current.isDown = true
    if (isPlaying) {
      spawnParticles(mouseRef.current.x, mouseRef.current.y)
    }
  }, [isPlaying, spawnParticles])

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDown = false
  }, [])

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Clear with slight transparency for trailing effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      // Update physics
      particle.vx *= settings.viscosity
      particle.vy *= settings.viscosity
      particle.vy += settings.gravity

      // Apply fluid dynamics - particles affect each other
      particlesRef.current.forEach(other => {
        if (other !== particle) {
          const dx = other.x - particle.x
          const dy = other.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 50 && distance > 0) {
            const force = (50 - distance) / 50 * 0.1 * settings.polarity
            particle.vx -= (dx / distance) * force
            particle.vy -= (dy / distance) * force
          }
        }
      })

      particle.x += particle.vx
      particle.y += particle.vy
      particle.age++

      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width / window.devicePixelRatio) {
        particle.vx *= -0.8
        particle.x = Math.max(0, Math.min(canvas.width / window.devicePixelRatio, particle.x))
      }
      if (particle.y < 0 || particle.y > canvas.height / window.devicePixelRatio) {
        particle.vy *= -0.8
        particle.y = Math.max(0, Math.min(canvas.height / window.devicePixelRatio, particle.y))
      }

      // Draw particle
      const alpha = 1 - (particle.age / particle.maxAge)
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Create connections between nearby particles
      particlesRef.current.forEach(other => {
        if (other !== particle && other.age < other.maxAge) {
          const dx = other.x - particle.x
          const dy = other.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 100) {
            const connectionAlpha = (1 - distance / 100) * alpha * 0.1
            ctx.save()
            ctx.globalAlpha = connectionAlpha
            ctx.strokeStyle = particle.color
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
            ctx.restore()
          }
        }
      })

      return particle.age < particle.maxAge
    })

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [settings, isPlaying])

  // Start/stop animation
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, animate])

  // Control functions
  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const clearScreen = () => {
    particlesRef.current = []
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const randomizeSettings = () => {
    const randomColor = settings.colors[Math.floor(Math.random() * settings.colors.length)]
    setSettings(prev => ({
      ...prev,
      viscosity: 0.9 + Math.random() * 0.09,
      dieThickness: 1 + Math.random() * 8,
      polarity: Math.random() > 0.5 ? 1 : -1,
      gravity: Math.random() * 0.3,
      currentColor: randomColor
    }))
  }

  const snapScreenshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `fluid-art-${Date.now()}.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="min-h-screen psychedelic-gradient-hero">
      <Header />
      
      <main className="relative py-8 px-4">
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4 trippy-text neon-glow-multicolor"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Fluid Playground
            </motion.h1>
            <motion.p
              className="text-xl text-white max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Create mesmerizing fluid art with interactive physics - because your trading losses need some beauty
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Control Panel */}
            <motion.div
              className="lg:col-span-1 space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Playback Controls */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Droplets className="w-5 h-5" />
                  <span>Controls</span>
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={togglePlayback}
                    className={`btn-primary w-full ${isPlaying ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  >
                    {isPlaying ? 'Pause' : 'Start'} Simulation
                  </button>
                  
                  <button
                    onClick={clearScreen}
                    className="btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                  
                  <button
                    onClick={randomizeSettings}
                    className="btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>Randomize</span>
                  </button>
                  
                  <button
                    onClick={snapScreenshot}
                    className="btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Snap Shot</span>
                  </button>
                </div>
              </div>

              {/* Color Selector */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Colors</span>
                </h3>
                
                <div className="grid grid-cols-3 gap-2">
                  {settings.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSettings(prev => ({ ...prev, currentColor: color }))}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        settings.currentColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Physics Controls */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Physics</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Viscosity: {settings.viscosity.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0.9"
                      max="0.99"
                      step="0.01"
                      value={settings.viscosity}
                      onChange={(e) => setSettings(prev => ({ ...prev, viscosity: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Particle Size: {settings.dieThickness.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      value={settings.dieThickness}
                      onChange={(e) => setSettings(prev => ({ ...prev, dieThickness: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Polarity: {settings.polarity > 0 ? 'Attract' : 'Repel'}
                    </label>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.1"
                      value={settings.polarity}
                      onChange={(e) => setSettings(prev => ({ ...prev, polarity: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gravity: {settings.gravity.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.01"
                      value={settings.gravity}
                      onChange={(e) => setSettings(prev => ({ ...prev, gravity: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Canvas */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card p-0 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleMouseMove}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-96 lg:h-[600px] bg-black cursor-crosshair"
                  style={{ touchAction: 'none' }}
                />
                
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Click and drag to create fluid • {particlesRef.current.length} particles active</span>
                    <span className="hidden md:inline">Pro tip: Try different polarity settings for wild effects</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}