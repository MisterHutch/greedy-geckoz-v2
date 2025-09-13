'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollValue } from '../../lib/paradox/scroll-controller'

interface ImpossibleGeckoProps {
  mintStats: {
    totalMinted: number
    totalSupply: number
    lotteryWinnersCount: number
    lotteryWinnersRemaining: number
    lotteryPool: number
  }
}

export default function ImpossibleGecko({ mintStats }: ImpossibleGeckoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY, paradoxIntensity } = useScrollValue()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return <div>Loading paradox...</div>
  }
  
  const realityPhase = scrollY * 0.005
  const glitchIntensity = Math.max(0, Math.min(1, (scrollY - 100) / 500))
  
  return (
    <section 
      ref={containerRef}
      data-paradox-section="impossible-hero"
      className="impossible-gecko-container"
      style={{
        position: 'relative',
        width: '100vw',
        height: '120vh',
        perspective: '2000px',
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(131, 56, 236, ${0.1 + glitchIntensity * 0.2}) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(255, 0, 110, ${0.05 + glitchIntensity * 0.15}) 0%, transparent 50%),
          linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(131, 56, 236, 0.1) 50%, rgba(0, 0, 0, 0.98) 100%)
        `
      }}
    >
      {/* Primary/Mirrored Geckos removed per request */}
      
      {/* Reality Glitch Effects */}
      <div 
        className="reality-glitch"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`glitch-layer glitch-layer-${i}`}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: glitchIntensity * (0.3 - i * 0.05),
              background: i % 2 === 0 
                ? 'linear-gradient(45deg, transparent 48%, rgba(255, 0, 110, 0.1) 49%, rgba(255, 0, 110, 0.1) 51%, transparent 52%)'
                : 'linear-gradient(-45deg, transparent 48%, rgba(131, 56, 236, 0.08) 49%, rgba(131, 56, 236, 0.08) 51%, transparent 52%)',
              animation: `glitchShift${(i % 2) + 1} ${2 + i}s ease-in-out infinite ${i % 2 === 0 ? '' : 'reverse'}`
            }}
          />
        ))}
      </div>
      
      {/* Dimension-Shifting Stats Grid */}
      <div 
        className="stats-dimension-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          perspective: '1500px',
          position: 'relative',
          zIndex: 5,
          top: '45vh',
          padding: '0 2rem'
        }}
      >
        {[
          { label: 'Total Supply', value: mintStats.totalSupply.toLocaleString(), color: 'var(--reality-primary)' },
          { label: 'Minted', value: mintStats.totalMinted.toLocaleString(), color: 'var(--dimension-1)' },
          { label: 'SOL Each', value: '0.0169', color: 'var(--dimension-3)' },
          { label: 'SOL Prize', value: `~${mintStats.lotteryPool}`, color: 'var(--dimension-2)' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="stat-card"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: `1px solid rgba(86, 236, 106, ${0.2 + glitchIntensity * 0.3})`,
              borderRadius: '16px',
              padding: '2rem',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: `perspective(800px) rotateY(var(--scroll-rotation-${index + 1})) translateZ(${index * 50}px)`,
              animation: `dimensionFloat${index + 1} ${8 + index * 2}s ease-in-out infinite`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            whileHover={{ 
              scale: 1.05, 
              rotateY: 15,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <div 
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: stat.color,
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}
            >
              {stat.value}
            </div>
            <div 
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}
            >
              {stat.label}
            </div>
            
            {/* Dimensional Aura */}
            <div
              style={{
                position: 'absolute',
                inset: '-2px',
                background: `conic-gradient(from ${realityPhase * 10}deg, transparent, ${stat.color}20, transparent)`,
                borderRadius: 'inherit',
                zIndex: -1,
                animation: 'portalDistortionSpin 20s linear infinite'
              }}
            />
          </motion.div>
        ))}
      </div>
      
      {/* CTA Buttons with Paradox Effects */}
      <motion.div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          position: 'absolute',
          bottom: '10vh',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.button
          className="btn-primary paradox-button"
          style={{
            background: `linear-gradient(45deg, var(--dimension-1), var(--dimension-2), var(--dimension-3))`,
            backgroundSize: '300% 300%',
            animation: 'paradoxTextShift 8s ease-in-out infinite',
            padding: '1rem 2rem',
            borderRadius: '12px',
            border: 'none',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transformStyle: 'preserve-3d'
          }}
          whileHover={{ 
            scale: 1.1, 
            rotateX: 10,
            boxShadow: 'var(--impossible-shadow)'
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const mintSection = document.querySelector('#mint-descent')
            if (mintSection) {
              mintSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          🦎 Enter Gecko Dimension
          
          {/* Button Paradox Effect */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent)',
              animation: 'portalDistortionSpin 3s linear infinite',
              pointerEvents: 'none'
            }}
          />
        </motion.button>
        
        <motion.button
          className="btn-outline paradox-button"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `2px solid var(--dimension-2)`,
            color: 'var(--dimension-2)',
            padding: '1rem 2rem',
            borderRadius: '12px',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
          whileHover={{ 
            scale: 1.05,
            borderColor: 'var(--dimension-1)',
            color: 'var(--dimension-1)',
            backgroundColor: 'rgba(255, 0, 110, 0.1)'
          }}
          onClick={() => {
            const portalSection = document.querySelector('#gecko-portals')
            if (portalSection) {
              portalSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          🌀 Explore Portals
        </motion.button>
      </motion.div>
      
      {/* Floating Particles for Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: i % 4 === 0 ? 'var(--dimension-1)' : 
                          i % 4 === 1 ? 'var(--dimension-2)' : 
                          i % 4 === 2 ? 'var(--dimension-3)' : 'var(--reality-primary)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.6,
              animation: `float${['Up', 'Down', 'Left', 'Right', 'Spiral'][i % 5]} ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </section>
  )
}
