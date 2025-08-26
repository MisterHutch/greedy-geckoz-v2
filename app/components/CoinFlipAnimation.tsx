'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface CoinFlipAnimationProps {
  isActive: boolean
  userChoice: 'heads' | 'tails'
  result: 'heads' | 'tails'
  onComplete: () => void
}

export default function CoinFlipAnimation({ isActive, userChoice, result, onComplete }: CoinFlipAnimationProps) {
  const [phase, setPhase] = useState(0) // 0: flip, 1: zoom, 2: result
  const [flipCount, setFlipCount] = useState(0)
  const onCompleteRef = useRef(onComplete)
  
  // Keep the ref current
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  
  const won = userChoice === result
  
  useEffect(() => {
    if (!isActive) {
      setPhase(0)
      setFlipCount(0)
      return
    }
    
    console.log(`🎭 Starting coin flip animation - user chose: ${userChoice}, result will be: ${result}`)
    
    // Phase progression with realistic timing
    const timer1 = setTimeout(() => {
      console.log('⏱️ Phase 1 - Starting zoom in')
      setPhase(1) // Start zoom in
    }, 3000) // Let coin flip for 3 seconds
    
    const timer2 = setTimeout(() => {
      console.log(`⏱️ Phase 2 - Showing result: ${result} (won: ${won})`)
      setPhase(2) // Show result
    }, 4500) // Zoom for 1.5 seconds
    
    const timer3 = setTimeout(() => {
      console.log('⏰ Coin flip animation timer complete - calling onComplete')
      onCompleteRef.current()
    }, 7000) // Show result for 2.5 seconds
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [isActive]) // Removed onComplete from deps to prevent re-running
  
  // Update flip count during animation
  useEffect(() => {
    if (phase === 0) {
      const flipTimer = setInterval(() => {
        setFlipCount(prev => prev + 1)
      }, 100) // Flip every 100ms
      
      setTimeout(() => clearInterval(flipTimer), 3000)
      
      return () => clearInterval(flipTimer)
    }
  }, [phase])

  if (!isActive) return null

  const coinSide = phase < 2 ? (flipCount % 2 === 0 ? 'heads' : 'tails') : result

  return (
    <>
      {/* Modal Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-radial from-yellow-400/30 via-black/95 to-black"
        style={{ zIndex: 60 }}
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 61 }}
      >
        {/* Dramatic Lighting Effects */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: phase >= 1 ? 
              'radial-gradient(circle at center, rgba(255, 215, 0, 0.4) 0%, transparent 30%)' :
              'radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 50%)',
            transition: 'background 1s ease-out'
          }}
        />

      {/* Spinning Light Rays */}
      {phase >= 1 && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200vw',
            height: '200vw',
            transform: 'translate(-50%, -50%)',
            background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              rgba(255, 215, 0, 0.2) 30deg,
              transparent 60deg,
              rgba(255, 215, 0, 0.1) 90deg,
              transparent 120deg,
              rgba(255, 215, 0, 0.2) 150deg,
              transparent 180deg
            )`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}

        {/* Main Coin */}
        <div className="relative z-10">
        <motion.div
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
          animate={{
            scale: phase === 0 ? 1 : phase === 1 ? 3 : 4,
            rotateX: phase === 0 ? [0, 360] : 0,
            rotateY: phase === 0 ? [0, 180] : result === 'heads' ? 0 : 180,
          }}
          transition={{
            scale: { duration: phase === 1 ? 1.5 : 0.5, ease: "easeInOut" },
            rotateX: { duration: 0.2, repeat: phase === 0 ? Infinity : 0, ease: "linear" },
            rotateY: { duration: 0.15, repeat: phase === 0 ? Infinity : 0, ease: "linear" }
          }}
        >
          {/* Coin Faces */}
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: coinSide === 'heads' ? 
                'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffc107 100%)' :
                'linear-gradient(135deg, #ff8f00 0%, #ffa000 50%, #ffb300 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#333',
              boxShadow: phase >= 1 ? 
                '0 0 100px rgba(255, 215, 0, 0.8), 0 0 200px rgba(255, 215, 0, 0.4)' :
                '0 20px 40px rgba(255, 215, 0, 0.3)',
              border: '8px solid rgba(255, 255, 255, 0.9)',
              position: 'relative',
              backfaceVisibility: 'hidden'
            }}
          >
            {coinSide === 'heads' ? '👑' : '⚡'}
            
            {/* Coin Shine Effect */}
            <div
              style={{
                position: 'absolute',
                top: '10%',
                left: '20%',
                width: '30%',
                height: '30%',
                background: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '50%',
                filter: 'blur(10px)',
              }}
            />
          </div>
        </motion.div>
        </div>

        {/* Result Text */}
        {phase === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 text-center text-white"
          >
          <div className="text-6xl mb-4">
            {won ? '🎉' : '💀'}
          </div>
          
          <h2 className={`text-5xl font-bold mb-4 ${won ? 'text-green-400' : 'text-red-400'}`} style={{ textShadow: '0 0 20px currentColor' }}>
            {won ? 'YOU WON!' : 'YOU LOST!'}
          </h2>
          
          <p className="text-2xl mb-2 text-white/90">
            Coin landed: <strong className="text-yellow-400">{result.toUpperCase()}</strong>
          </p>
          
          <div className={`text-xl p-4 rounded-lg border-2 ${won ? 'bg-green-900/30 border-green-400/50 text-green-200' : 'bg-red-900/30 border-red-400/50 text-red-200'}`}>
            {won ? 
              '🚀 Doubling your geckoz! Generating NFTs...' : 
              '😈 No geckoz for you! Payment processed...'
            }
          </div>
          </motion.div>
        )}

        {/* User Choice Indicator */}
        {phase < 2 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-[15%] left-1/2 transform -translate-x-1/2 text-center text-white"
          >
          <div className="text-lg mb-2 text-white/80">
            You chose:
          </div>
          <div className="text-4xl font-bold text-yellow-400" style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.8)' }}>
            {userChoice.toUpperCase()} {userChoice === 'heads' ? '👑' : '⚡'}
          </div>
          </motion.div>
        )}

        {/* Tension-Building Particles */}
        {phase === 0 && [...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: `${50 + Math.cos(i * 18) * 30}%`,
              top: `${50 + Math.sin(i * 18) * 30}%`,
            }}
            animate={{
              scale: [0, 2, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.05,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </>
  )
}