'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface TimeWarpAnimationProps {
  isActive: boolean
  mintQuantity: number
  onComplete?: () => void
}

export default function TimeWarpAnimation({ isActive, mintQuantity, onComplete }: TimeWarpAnimationProps) {
  const [phase, setPhase] = useState(0) // 0: entry, 1: warp, 2: generation, 3: exit
  
  useEffect(() => {
    if (!isActive) {
      setPhase(0)
      return
    }
    
    // Phase progression
    const timer1 = setTimeout(() => setPhase(1), 500)   // Start warp
    const timer2 = setTimeout(() => setPhase(2), 2000)  // Generation phase
    const timer3 = setTimeout(() => setPhase(3), 8000)  // Exit warp
    const timer4 = setTimeout(() => {
      setPhase(0)
      onComplete?.()
    }, 10000) // Complete
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2) 
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'radial-gradient(ellipse at center, rgba(131, 56, 236, 0.8) 0%, rgba(0, 0, 0, 0.95) 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Cosmic Tunnel */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              border: `3px solid rgba(86, 236, 106, ${0.8 - i * 0.04})`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: phase >= 1 ? [1, 0.1, 0.1] : 1,
              rotateZ: phase >= 1 ? [0, 360, 720] : 0,
              translateZ: phase >= 1 ? [0, -2000, -4000] : 0,
            }}
            transition={{
              duration: phase >= 1 ? 3 : 0.5,
              delay: i * 0.1,
              ease: "easeInOut",
              repeat: phase === 1 ? Infinity : 0
            }}
          />
        ))}
      </div>

      {/* Reality Distortion Grid */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(0deg, transparent 48%, rgba(255, 0, 110, 0.3) 49%, rgba(255, 0, 110, 0.3) 51%, transparent 52%),
            linear-gradient(90deg, transparent 48%, rgba(131, 56, 236, 0.3) 49%, rgba(131, 56, 236, 0.3) 51%, transparent 52%)
          `,
          backgroundSize: '50px 50px',
        }}
      >
        <motion.div
          style={{ width: '100%', height: '100%' }}
          animate={{
            backgroundPositionX: phase >= 1 ? [-1000, 1000] : 0,
            backgroundPositionY: phase >= 1 ? [-500, 500] : 0,
          }}
          transition={{
            duration: 2,
            repeat: phase >= 1 ? Infinity : 0,
            ease: "linear"
          }}
        />
      </div>

      {/* Dimensional Particles */}
      {[...Array(50)].map((_, i) => (
        <motion.div
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
          }}
          animate={{
            scale: phase >= 1 ? [1, 0.1, 2, 0] : [0, 1, 0],
            x: phase >= 1 ? [0, (Math.random() - 0.5) * 2000] : 0,
            y: phase >= 1 ? [0, (Math.random() - 0.5) * 1000] : 0,
            opacity: phase >= 1 ? [1, 0.5, 1, 0] : [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: i * 0.05,
            repeat: phase >= 1 ? Infinity : 0,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Central Content */}
      <div 
        style={{
          position: 'relative',
          textAlign: 'center',
          zIndex: 10,
          color: 'white'
        }}
      >
        {/* Phase-specific content */}
        {phase === 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
          >
            <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🌀</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Preparing Dimensional Breach
            </h2>
            <p style={{ opacity: 0.8 }}>Reality protocols initializing...</p>
          </motion.div>
        )}
        
        {phase === 1 && (
          <motion.div
            animate={{
              scale: [1, 1.2, 0.8, 1],
              rotateY: [0, 180, 360],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>⚡</div>
            <h2 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(45deg, var(--dimension-1), var(--dimension-2), var(--dimension-3))',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'paradoxTextShift 2s ease-in-out infinite'
            }}>
              WARPING REALITY
            </h2>
            <p style={{ opacity: 0.8, fontSize: '1.2rem' }}>
              Traveling through dimensional corridors...
            </p>
          </motion.div>
        )}
        
        {phase === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: '6rem', marginBottom: '1rem' }}
            >
              🦎
            </motion.div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Generating {mintQuantity} Unique Geckoz
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              {[...Array(mintQuantity)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    width: '20px',
                    height: '20px',
                    background: 'var(--dimension-2)',
                    borderRadius: '50%',
                  }}
                  animate={{
                    scale: [0, 1.5, 1],
                    opacity: [0, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.8 }}>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎨 Compositing trait layers...
              </motion.p>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
              >
                📤 Uploading to IPFS...
              </motion.p>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
              >
                ⚡ Minting NFTs to blockchain...
              </motion.p>
            </div>
          </motion.div>
        )}
        
        {phase === 3 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotateZ: [0, 360],
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{ fontSize: '8rem', marginBottom: '1rem' }}
            >
              ✨
            </motion.div>
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--dimension-4)' }}>
              REALITY RESTORED
            </h2>
            <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Your {mintQuantity} geckoz have transcended dimensions!
            </p>
          </motion.div>
        )}
      </div>

      {/* Dimensional Vortex Overlay */}
      {phase >= 1 && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '150vw',
            height: '150vw',
            background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              rgba(131, 56, 236, 0.3) 60deg,
              rgba(255, 0, 110, 0.3) 120deg,
              rgba(86, 236, 106, 0.3) 180deg,
              rgba(255, 215, 0, 0.3) 240deg,
              rgba(131, 56, 236, 0.3) 300deg,
              transparent 360deg
            )`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.6,
          }}
          animate={{
            rotate: phase >= 1 ? [0, 360] : 0,
            scale: phase === 3 ? [1, 0] : 1,
          }}
          transition={{
            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, ease: "easeInOut" }
          }}
        />
      )}
    </motion.div>
  )
}