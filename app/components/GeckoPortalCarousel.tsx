'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollValue } from '../../lib/paradox/scroll-controller'

interface GeckoData {
  id: number
  name: string
  image: string
  rarity: string
  traits: string[]
  description: string
}

export default function GeckoPortalCarousel() {
  const [activePortal, setActivePortal] = useState(0)
  const [portalEnergy, setPortalEnergy] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY, paradoxIntensity } = useScrollValue()
  
  // Real gecko data with actual images
  const geckoz: GeckoData[] = [
    { 
      id: 1337, 
      name: 'Gecko #1337', 
      image: '/geckoz/gecko-1337.png',
      rarity: 'Legendary', 
      traits: ['Elite Hacker', 'Code Wizard', 'NFT Genius'],
      description: "This gecko wrote the smart contract for your portfolio (it's in the red)"
    },
    { 
      id: 420, 
      name: 'Gecko #420', 
      image: '/geckoz/gecko-420.png',
      rarity: 'Epic', 
      traits: ['Chill Vibes', 'Diamond Hands', 'Moon Walker'],
      description: "The most relaxed gecko in the collection. Probably high on hopium."
    },
    { 
      id: 69, 
      name: 'Gecko #69', 
      image: '/geckoz/gecko-69.png',
      rarity: 'Rare', 
      traits: ['Nice', 'Meme Lord', 'Culture Icon'],
      description: "Nice. This gecko gets it. Peak internet culture appreciation."
    },
    { 
      id: 1776, 
      name: 'Gecko #1776', 
      image: '/geckoz/gecko-1776.png',
      rarity: 'Patriotic', 
      traits: ['Freedom Lover', 'Revolution', 'Independence'],
      description: "This gecko declared independence from traditional finance. Very American."
    },
    { 
      id: 1, 
      name: 'Gecko #1', 
      image: '/geckoz/gecko-1.png',
      rarity: 'Genesis', 
      traits: ['OG', 'First', 'Alpha'],
      description: "The original gecko. Started this whole mess. You're welcome."
    },
    { 
      id: 721, 
      name: 'Gecko #721', 
      image: '/geckoz/gecko-721.png',
      rarity: 'Uncommon', 
      traits: ['Standard Issue', 'Regular Joe', 'Average'],
      description: "Just a regular gecko doing gecko things. Probably you IRL."
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return { main: '#ffd700', glow: 'rgba(255, 215, 0, 0.6)' }
      case 'epic': return { main: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.6)' }
      case 'mythic': return { main: '#ec4899', glow: 'rgba(236, 72, 153, 0.6)' }
      case 'genesis': return { main: '#56ec6a', glow: 'rgba(86, 236, 106, 0.6)' }
      case 'patriotic': return { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)' }
      case 'uncommon': return { main: '#9ca3af', glow: 'rgba(156, 163, 175, 0.6)' }
      default: return { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)' }
    }
  }

  const handlePortalClick = (index: number) => {
    setActivePortal(index)
    setPortalEnergy(index)
    
    // Create ripple effect
    const portal = containerRef.current?.querySelectorAll('.dimensional-portal')[index] as HTMLElement
    if (portal) {
      portal.style.transform = 'scale(1.2) rotateX(15deg) rotateY(10deg) translateZ(50px)'
      setTimeout(() => {
        portal.style.transform = 'scale(1.1) rotateX(10deg) rotateY(5deg)'
      }, 300)
    }
  }

  useEffect(() => {
    // Auto-cycle through portals
    const interval = setInterval(() => {
      setActivePortal((prev) => (prev + 1) % geckoz.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [geckoz.length])

  const dimensionalPhase = scrollY * 0.001

  return (
    <section 
      ref={containerRef}
      id="gecko-portals"
      data-paradox-section="portal-carousel"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        perspective: '3000px',
        transformStyle: 'preserve-3d',
        background: `
          radial-gradient(ellipse at center, rgba(131, 56, 236, ${0.1 + paradoxIntensity * 0.1}) 0%, transparent 70%),
          linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(255, 0, 110, 0.05) 50%, rgba(0, 0, 0, 0.95) 100%)
        `,
        overflow: 'hidden'
      }}
    >
      {/* Section Title */}
      <motion.div
        style={{
          position: 'absolute',
          top: '5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          textAlign: 'center'
        }}
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: `linear-gradient(45deg, var(--dimension-1), var(--dimension-2), var(--dimension-3))`,
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'paradoxTextShift 8s ease-in-out infinite',
            marginBottom: '1rem'
          }}
        >
          Gecko Dimension Portals
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.25rem' }}>
          Each portal reveals a different gecko reality. Choose wisely.
        </p>
      </motion.div>

      {/* Portal Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '4rem',
          padding: '8rem 4rem 4rem',
          height: '100%',
          position: 'relative',
          zIndex: 10,
          alignItems: 'center',
          justifyItems: 'center'
        }}
      >
        {geckoz.map((gecko, index) => {
          const colors = getRarityColor(gecko.rarity)
          const portalPhase = dimensionalPhase + index * 0.5
          const energyLevel = Math.abs(Math.sin(portalPhase)) * paradoxIntensity
          const isActive = index === activePortal
          
          return (
            <motion.div
              key={gecko.id}
              className="dimensional-portal"
              style={{
                position: 'relative',
                width: '300px',
                height: '300px',
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
                transform: `scale(${isActive ? 1.2 : 1}) rotateX(${isActive ? 15 : 0}deg) rotateY(${isActive ? 10 : 0}deg) translateZ(${isActive ? 50 : 0}px)`,
                transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
              }}
              onClick={() => handlePortalClick(index)}
              whileHover={{ 
                scale: isActive ? 1.25 : 1.15,
                rotateX: 10,
                rotateY: 5
              }}
              initial={{ opacity: 0, scale: 0.5, rotateX: 45 }}
              whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ 
                delay: index * 0.2,
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
            >
              {/* Portal Frame */}
              <div 
                className="portal-frame"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50% 20% 40% 30%',
                  background: `linear-gradient(45deg, 
                    rgba(86, 236, 106, 0.1) 0%, 
                    rgba(131, 56, 236, 0.1) 50%, 
                    rgba(255, 0, 110, 0.1) 100%)`,
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                  overflow: 'hidden',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Portal Energy Ring */}
                <div
                  className="portal-energy-ring"
                  style={{
                    position: 'absolute',
                    inset: '-20px',
                    border: `2px solid ${colors.main}`,
                    borderRadius: '50%',
                    opacity: energyLevel,
                    transform: `scale(${1 + energyLevel * 0.2}) rotate(${portalPhase * 57.3}deg)`,
                    boxShadow: `0 0 20px ${colors.glow}`,
                    animation: 'portalEnergyPulse 4s ease-in-out infinite'
                  }}
                />
                
                {/* Portal Distortion Field */}
                <div
                  className="portal-distortion-field"
                  style={{
                    position: 'absolute',
                    inset: '10px',
                    background: `conic-gradient(from ${portalPhase * 180}deg, 
                      transparent 0deg, 
                      rgba(131, 56, 236, 0.3) 90deg, 
                      transparent 180deg, 
                      rgba(255, 0, 110, 0.3) 270deg, 
                      transparent 360deg)`,
                    borderRadius: 'inherit',
                    animation: 'portalDistortionSpin 12s linear infinite'
                  }}
                />
              </div>

              {/* Portal Interior */}
              <div 
                className="portal-interior"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: 'inherit',
                  overflow: 'hidden',
                  transformStyle: 'preserve-3d',
                  zIndex: 5
                }}
              >
                {/* Gecko Container */}
                <div 
                  className="gecko-container"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Primary Gecko Image */}
                  <img 
                    src={gecko.image} 
                    alt={gecko.name}
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: `2px solid ${colors.main}`,
                      boxShadow: `0 0 20px ${colors.glow}`,
                      filter: `drop-shadow(0 0 10px ${colors.glow})`,
                      transform: `rotateY(${Math.sin(portalPhase) * 10}deg) scale(${1 + energyLevel * 0.1})`,
                      zIndex: 10
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<span style="font-size: 8rem;">${gecko.id % 3 === 0 ? '🦎' : gecko.id % 3 === 1 ? '🦚' : '🦗'}</span>`
                      }
                    }}
                  />
                  
                  {/* Recursive Reflections */}
                  <div className="recursive-reflections">
                    {[...Array(3)].map((_, i) => (
                      <img 
                        key={i}
                        src={gecko.image} 
                        alt={`${gecko.name} reflection ${i + 1}`}
                        style={{
                          position: 'absolute',
                          width: '200px',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          transform: `scale(${0.8 ** (i + 1)}) translateZ(-${100 * (i + 1)}px) rotateY(${180 + i * 30}deg)`,
                          opacity: (0.7 ** (i + 1)) * energyLevel,
                          filter: `brightness(${0.8 - i * 0.2}) hue-rotate(${i * 60}deg) blur(${i}px)`,
                          zIndex: 5 - i
                        }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Gecko Info Overlay (appears on active) */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '1rem',
                        right: '1rem',
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: `1px solid ${colors.main}`,
                        zIndex: 15
                      }}
                    >
                      <h3 style={{ 
                        color: colors.main, 
                        fontSize: '1.25rem', 
                        fontWeight: 'bold',
                        marginBottom: '0.5rem'
                      }}>
                        {gecko.name}
                      </h3>
                      <div style={{
                        color: colors.main,
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        background: `${colors.main}20`,
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {gecko.rarity}
                      </div>
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        fontSize: '0.75rem',
                        lineHeight: 1.4 
                      }}>
                        {gecko.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Gravitational Field Effects */}
      <div className="gravitational-fields">
        {geckoz.map((_, index) => (
          <div
            key={index}
            className={`gravity-field gravity-field-${index}`}
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: `radial-gradient(circle, transparent 70%, rgba(${index * 50}, ${100 + index * 30}, ${200 - index * 20}, 0.05) 100%)`,
              left: `${20 + (index % 3) * 30}%`,
              top: `${30 + Math.floor(index / 3) * 40}%`,
              transform: 'translate(-50%, -50%)',
              animation: `floatSpiral ${15 + index * 2}s ease-in-out infinite`,
              animationDelay: `${index * 2}s`,
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        ))}
      </div>

      {/* Portal Navigation */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1rem',
          zIndex: 20
        }}
      >
        {geckoz.map((_, index) => (
          <button
            key={index}
            onClick={() => handlePortalClick(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: index === activePortal 
                ? getRarityColor(geckoz[index].rarity).main
                : 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: index === activePortal ? 'scale(1.5)' : 'scale(1)',
              boxShadow: index === activePortal 
                ? `0 0 10px ${getRarityColor(geckoz[index].rarity).glow}`
                : 'none'
            }}
          />
        ))}
      </div>
    </section>
  )
}