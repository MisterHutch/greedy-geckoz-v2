'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function AnimatedGecko() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showTongue, setShowTongue] = useState(false)
  const [tongueAngle, setTongueAngle] = useState(0)
  const geckoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (geckoRef.current) {
        const rect = geckoRef.current.getBoundingClientRect()
        const geckoX = rect.left + rect.width / 2
        const geckoY = rect.top + rect.height / 2
        
        // Calculate angle from gecko to mouse
        const angle = Math.atan2(e.clientY - geckoY, e.clientX - geckoX)
        setTongueAngle(angle * (180 / Math.PI))
        
        // Calculate distance to determine if tongue should show
        const distance = Math.sqrt(
          Math.pow(e.clientX - geckoX, 2) + Math.pow(e.clientY - geckoY, 2)
        )
        
        // Show tongue if mouse is within range (200px)
        if (distance < 200) {
          setShowTongue(true)
        } else {
          setShowTongue(false)
        }
      }
      
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleClick = () => {
      // Trigger tongue animation on click
      setShowTongue(true)
      setTimeout(() => setShowTongue(false), 600)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <>
      {/* Custom Fly Cursor */}
      <div 
        className="custom-fly-cursor"
        style={{ 
          left: mousePosition.x, 
          top: mousePosition.y 
        }}
      >
        🪰
      </div>

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
          {/* Main Gecko Body - More realistic lizard */}
          <div className="relative">
            <span className="text-green-600">🦎</span>
          </div>

          {/* Animated Tongue */}
          <div
            className={`gecko-tongue ${showTongue ? 'extended' : ''}`}
            style={{
              transform: `translate(-50%, -30%) rotate(${tongueAngle}deg)`,
              transformOrigin: 'top center',
              left: '55%', // Adjust to come from gecko's mouth area
              top: '45%'
            }}
          />

          {/* Eyes that follow the cursor - positioned better for gecko */}
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

        {/* Sassy tooltip messages */}
        {showTongue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-xs whitespace-nowrap font-medium shadow-lg"
          >
            {[
              "Gotcha! 🪰",
              "Mmm, tasty fly money!",
              "Another degen caught!",
              "Fly = your portfolio",
              "Om nom nom... 💸",
              "Gecko tax collected!",
              "Thanks for the snack!"
            ][Math.floor(Math.random() * 7)]}
          </motion.div>
        )}
      </div>
    </>
  )
}