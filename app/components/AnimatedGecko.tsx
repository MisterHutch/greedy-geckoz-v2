'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function AnimatedGecko() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const geckoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <>
      {/* Animated Gecko */}
      <div ref={geckoRef} className="gecko-container">
        <motion.div
          className="realistic-gecko relative"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Main Gecko Body */}
          <div className="relative">
            <span className="text-green-600">🦎</span>
          </div>

          {/* Simple eyes that follow the cursor */}
          <div className="absolute top-4 left-6 gecko-eyes">
            <div 
              className="w-1 h-1 bg-black rounded-full"
              style={{
                transform: `translate(${Math.min(1, Math.max(-1, (mousePosition.x - (geckoRef.current?.getBoundingClientRect().left || 0)) / 100))}px, ${Math.min(1, Math.max(-1, (mousePosition.y - (geckoRef.current?.getBoundingClientRect().top || 0)) / 100))}px)`
              }}
            />
          </div>
          <div className="absolute top-4 right-6 gecko-eyes">
            <div 
              className="w-1 h-1 bg-black rounded-full"
              style={{
                transform: `translate(${Math.min(1, Math.max(-1, (mousePosition.x - (geckoRef.current?.getBoundingClientRect().left || 0)) / 100))}px, ${Math.min(1, Math.max(-1, (mousePosition.y - (geckoRef.current?.getBoundingClientRect().top || 0)) / 100))}px)`
              }}
            />
          </div>
        </motion.div>
      </div>
    </>
  )
}