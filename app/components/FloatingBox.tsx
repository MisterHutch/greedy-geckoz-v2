'use client'

import { motion } from 'framer-motion'

interface FloatingBoxProps {
  value: string | number
  label: string
  color?: string
  index?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'glass' | 'neon' | 'organic'
  className?: string
  children?: React.ReactNode
  onClick?: () => void
}

export default function FloatingBox({
  value,
  label,
  color = 'var(--reality-primary)',
  index = 0,
  size = 'md',
  variant = 'glass',
  className = '',
  children,
  onClick
}: FloatingBoxProps) {
  const sizeStyles = {
    sm: { padding: '1rem', fontSize: '1.25rem', borderRadius: '12px' },
    md: { padding: '2rem', fontSize: '2rem', borderRadius: '16px' },
    lg: { padding: '2.5rem', fontSize: '2.5rem', borderRadius: '20px' }
  }

  const variantStyles = {
    glass: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: `1px solid rgba(86, 236, 106, 0.2)`,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    neon: {
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      border: `2px solid ${color}`,
      boxShadow: `0 0 20px ${color}, inset 0 0 20px rgba(255, 255, 255, 0.05)`
    },
    organic: {
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(25px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.08)',
      borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%'
    }
  }

  return (
    <motion.div
      className={`floating-box cursor-pointer ${className}`}
      style={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `perspective(800px) rotateY(var(--scroll-rotation-${index + 1})) translateZ(${index * 20}px)`,
        animation: variant === 'organic' 
          ? `morph 8s ease-in-out infinite, dimensionFloat${index + 1} ${8 + index * 2}s ease-in-out infinite`
          : `dimensionFloat${index + 1} ${8 + index * 2}s ease-in-out infinite`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform, box-shadow'
      }}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 15,
        boxShadow: variant === 'neon' 
          ? `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${color}`
          : '0 20px 40px rgba(0,0,0,0.3)',
        transition: { type: "spring", damping: 10 }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.8,
        type: "spring",
        damping: 20
      }}
    >
      {/* Glow effect overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: '-1px',
          background: `linear-gradient(45deg, ${color}33, transparent, ${color}22)`,
          borderRadius: 'inherit',
          zIndex: -1,
          opacity: 0.6
        }}
      />
      
      {/* Content */}
      {children ? (
        children
      ) : (
        <>
          <div 
            style={{
              fontSize: sizeStyles[size].fontSize,
              fontWeight: 'bold',
              color: color,
              marginBottom: '0.5rem',
              textAlign: 'center',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          >
            {value}
          </div>
          <div 
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}
          >
            {label}
          </div>
        </>
      )}
      
      {/* Interactive particle effect */}
      <div 
        className="particle-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: 'inherit',
          pointerEvents: 'none'
        }}
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: color,
              borderRadius: '50%',
              top: `${20 + i * 30}%`,
              left: `${10 + i * 40}%`,
              animation: `particle-float-${i + 1} ${4 + i}s ease-in-out infinite`,
              opacity: 0.6
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// Add these keyframes to your globals.css
export const floatingBoxStyles = `
  @keyframes morph {
    0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
    25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
    50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
    75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
  }

  @keyframes particle-float-1 {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
    50% { transform: translateY(-10px) rotate(180deg); opacity: 0.3; }
  }

  @keyframes particle-float-2 {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
    50% { transform: translateY(-15px) rotate(270deg); opacity: 0.7; }
  }

  @keyframes particle-float-3 {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
    50% { transform: translateY(-8px) rotate(90deg); opacity: 0.2; }
  }

  /* Enhanced dimension float animations */
  @keyframes dimensionFloat1 {
    0%, 100% { transform: perspective(800px) rotateY(var(--scroll-rotation-1)) translateY(0px) translateZ(0px); }
    33% { transform: perspective(800px) rotateY(var(--scroll-rotation-1)) translateY(-10px) translateZ(20px); }
    66% { transform: perspective(800px) rotateY(var(--scroll-rotation-1)) translateY(5px) translateZ(10px); }
  }

  @keyframes dimensionFloat2 {
    0%, 100% { transform: perspective(800px) rotateY(var(--scroll-rotation-2)) translateY(0px) translateZ(20px); }
    33% { transform: perspective(800px) rotateY(var(--scroll-rotation-2)) translateY(8px) translateZ(40px); }
    66% { transform: perspective(800px) rotateY(var(--scroll-rotation-2)) translateY(-12px) translateZ(30px); }
  }

  @keyframes dimensionFloat3 {
    0%, 100% { transform: perspective(800px) rotateY(var(--scroll-rotation-3)) translateY(0px) translateZ(40px); }
    33% { transform: perspective(800px) rotateY(var(--scroll-rotation-3)) translateY(-15px) translateZ(60px); }
    66% { transform: perspective(800px) rotateY(var(--scroll-rotation-3)) translateY(7px) translateZ(50px); }
  }

  @keyframes dimensionFloat4 {
    0%, 100% { transform: perspective(800px) rotateY(var(--scroll-rotation-4)) translateY(0px) translateZ(60px); }
    33% { transform: perspective(800px) rotateY(var(--scroll-rotation-4)) translateY(12px) translateZ(80px); }
    66% { transform: perspective(800px) rotateY(var(--scroll-rotation-4)) translateY(-8px) translateZ(70px); }
  }
`