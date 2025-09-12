'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface FullScreenPopupProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  variant?: 'default' | 'cosmic' | 'neon' | 'matrix'
  children: React.ReactNode
  className?: string
}

export default function FullScreenPopup({
  isOpen,
  onClose,
  title,
  variant = 'default',
  children,
  className = ''
}: FullScreenPopupProps) {
  const variantStyles = {
    default: {
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(131, 56, 236, 0.1) 50%, rgba(0, 0, 0, 0.98) 100%)',
      backdropFilter: 'blur(20px)'
    },
    cosmic: {
      background: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(20, 20, 40, 0.95) 100%)
      `,
      backdropFilter: 'blur(25px) saturate(1.5)'
    },
    neon: {
      background: `
        linear-gradient(45deg, rgba(255, 0, 110, 0.05) 0%, transparent 25%),
        linear-gradient(-45deg, rgba(131, 56, 236, 0.05) 25%, transparent 50%),
        linear-gradient(90deg, rgba(6, 255, 165, 0.03) 50%, transparent 75%),
        rgba(0, 0, 0, 0.95)
      `,
      backdropFilter: 'blur(20px) brightness(1.1)'
    },
    matrix: {
      background: `
        linear-gradient(0deg, rgba(0, 0, 0, 0.98) 0%, rgba(0, 20, 0, 0.95) 50%, rgba(0, 0, 0, 0.98) 100%)
      `,
      backdropFilter: 'blur(15px) hue-rotate(90deg)'
    }
  }

  const contentVariants = {
    default: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
    },
    cosmic: {
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(120, 119, 198, 0.2)',
      boxShadow: `
        0 25px 50px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1)
      `
    },
    neon: {
      background: 'rgba(0, 0, 0, 0.6)',
      border: '2px solid rgba(86, 236, 106, 0.5)',
      boxShadow: `
        0 0 50px rgba(86, 236, 106, 0.2),
        0 25px 50px rgba(0, 0, 0, 0.5),
        inset 0 0 20px rgba(86, 236, 106, 0.05)
      `
    },
    matrix: {
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(0, 255, 0, 0.3)',
      boxShadow: `
        0 0 30px rgba(0, 255, 0, 0.1),
        0 25px 50px rgba(0, 0, 0, 0.6)
      `
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
          style={{
            ...variantStyles[variant],
            // Respect iOS safe areas for notches/home indicators
            paddingTop: 'max(1rem, env(safe-area-inset-top))',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            paddingLeft: 'max(1rem, env(safe-area-inset-left))',
            paddingRight: 'max(1rem, env(safe-area-inset-right))'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {variant === 'cosmic' && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${100 + i * 50}px`,
                      height: `${100 + i * 50}px`,
                      background: `radial-gradient(circle, rgba(${120 + i * 20}, ${119 + i * 15}, 198, 0.1) 0%, transparent 70%)`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 4 + i,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </>
            )}
            
            {variant === 'neon' && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `
                    repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      rgba(86, 236, 106, 0.03) 2px,
                      rgba(86, 236, 106, 0.03) 4px
                    )
                  `
                }}
                animate={{
                  backgroundPosition: ['0px 0px', '0px 20px']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            )}
            
            {variant === 'matrix' && (
              <motion.div
                className="absolute inset-0 text-green-500 font-mono text-xs opacity-20"
                style={{
                  background: `
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 20px,
                      rgba(0, 255, 0, 0.02) 20px,
                      rgba(0, 255, 0, 0.02) 21px
                    )
                  `
                }}
              />
            )}
          </div>

          {/* Content Container */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl backdrop-blur-xl overflow-hidden"
            style={contentVariants[variant]}
            initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 300,
              duration: 0.5
            }}
          >
            {/* Header */}
            {title && (
              <div 
                className="flex items-center justify-between p-6 border-b"
                style={{ 
                  borderColor: variant === 'neon' ? 'rgba(86, 236, 106, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <h2 
                  className="text-2xl font-bold"
                  style={{
                    color: variant === 'neon' ? '#56ec6a' : variant === 'matrix' ? '#00ff00' : '#ffffff',
                    textShadow: variant === 'neon' ? '0 0 10px rgba(86, 236, 106, 0.5)' : 'none'
                  }}
                >
                  {title}
                </h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: variant === 'neon' ? '#56ec6a' : '#ffffff'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    background: variant === 'neon' ? 'rgba(86, 236, 106, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
            )}

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
