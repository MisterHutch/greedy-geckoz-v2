'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Info, X } from 'lucide-react'
import { useScrollValue } from '../../lib/paradox/scroll-controller'

interface GeckoData {
  id: number
  name: string
  image: string
  rarity: string
  traits: {
    head: string
    body: string
    eyes: string
    outfit: string
    background: string
    special?: string
  }
  description: string
}

export default function EnhancedGeckoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showTraits, setShowTraits] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY, paradoxIntensity } = useScrollValue()
  
  // Expanded gecko collection with proper trait categories
  const geckoz: GeckoData[] = [
    { 
      id: 1337, 
      name: 'Gecko #1337', 
      image: '/geckoz/gecko-1337.png',
      rarity: 'Legendary', 
      traits: {
        head: 'Golden Horn',
        body: 'Diamond Skin',
        eyes: 'Laser',
        outfit: 'Space Suit',
        background: 'Studded Diamonds',
        special: 'Elite Hacker'
      },
      description: "This gecko wrote the smart contract for your portfolio (it's in the red)"
    },
    { 
      id: 420, 
      name: 'Gecko #420', 
      image: '/geckoz/gecko-420.png',
      rarity: 'Epic', 
      traits: {
        head: 'Beanie',
        body: 'Green',
        eyes: 'Complacent',
        outfit: 'Green Polo',
        background: 'Chill'
      },
      description: "The most relaxed gecko in the collection. Probably high on hopium."
    },
    { 
      id: 69, 
      name: 'Gecko #69', 
      image: '/geckoz/gecko-69.png',
      rarity: 'Rare', 
      traits: {
        head: 'Backwards Cap',
        body: 'Pale Cerulean',
        eyes: 'Bored',
        outfit: 'Sleeveless',
        background: 'Seafoam',
        special: 'Meme Lord'
      },
      description: "Nice. This gecko gets it. Peak internet culture appreciation."
    },
    { 
      id: 1776, 
      name: 'Gecko #1776', 
      image: '/geckoz/gecko-1776.png',
      rarity: 'Patriotic', 
      traits: {
        head: 'None',
        body: 'Rose',
        eyes: 'Hopeful',
        outfit: 'Tuxedo',
        background: 'Salmon'
      },
      description: "This gecko believes in life, liberty, and the pursuit of moon missions."
    },
    { 
      id: 2222, 
      name: 'Gecko #2222', 
      image: '/geckoz/gecko-2222.png',
      rarity: 'Legendary', 
      traits: {
        head: 'Tattooz',
        body: 'Trippy',
        eyes: 'Heaven',
        outfit: 'Space Suit',
        background: 'Kollidz',
        special: 'Final Boss'
      },
      description: "The legendary final gecko. If you get this, you've transcended reality."
    },
    { 
      id: 1, 
      name: 'Gecko #1', 
      image: '/geckoz/gecko-1.png',
      rarity: 'Genesis', 
      traits: {
        head: 'Cowboy Hat',
        body: 'Ember',
        eyes: 'Angry',
        outfit: 'Myth',
        background: 'Jasmin',
        special: 'Genesis Power'
      },
      description: "The very first gecko to enter our dimension. Legendary status."
    },
    { 
      id: 888, 
      name: 'Gecko #888', 
      image: '/geckoz/gecko-888.png',
      rarity: 'Lucky', 
      traits: {
        head: 'Golden Horn',
        body: 'Corn',
        eyes: 'Hopeful',
        outfit: 'Pullover Hoodie',
        background: 'Minty'
      },
      description: "Triple 8s = ultimate luck. This gecko brings good fortune to holders."
    },
    { 
      id: 666, 
      name: 'Gecko #666', 
      image: '/geckoz/gecko-666.png',
      rarity: 'Cursed', 
      traits: {
        head: 'Devil',
        body: 'Zombie',
        eyes: 'Evil',
        outfit: 'War Suit',
        background: 'Biloba Flower',
        special: 'Chaos Bringer'
      },
      description: "The cursed gecko. Brings chaos but also massive gains... maybe."
    },
    { 
      id: 1111, 
      name: 'Gecko #1111', 
      image: '/geckoz/gecko-1111.png',
      rarity: 'Angel', 
      traits: {
        head: 'None',
        body: 'Pale Cerulean',
        eyes: 'Heaven',
        outfit: 'Tuxedo',
        background: 'Parchment',
        special: 'Divine Blessed'
      },
      description: "Blessed by the crypto gods. This gecko ensures diamond hands."
    },
    { 
      id: 999, 
      name: 'Gecko #999', 
      image: '/geckoz/gecko-999.png',
      rarity: 'Uncommon', 
      traits: {
        head: 'Rocket',
        body: 'Rusty',
        eyes: 'Exhausted',
        outfit: 'Black Sweater',
        background: 'Aquamarine'
      },
      description: "So close to 1000, yet so far. Story of every degen's life."
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return { main: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)' }
      case 'epic': return { main: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.8)' }
      case 'genesis': return { main: '#56ec6a', glow: 'rgba(86, 236, 106, 0.8)' }
      case 'patriotic': return { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)' }
      case 'lucky': return { main: '#ffbe0b', glow: 'rgba(255, 190, 11, 0.8)' }
      case 'cursed': return { main: '#dc2626', glow: 'rgba(220, 38, 38, 0.8)' }
      case 'angel': return { main: '#06ffa5', glow: 'rgba(6, 255, 165, 0.8)' }
      case 'rare': return { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.8)' }
      case 'uncommon': return { main: '#9ca3af', glow: 'rgba(156, 163, 175, 0.8)' }
      default: return { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.8)' }
    }
  }

  const nextGecko = () => {
    setActiveIndex((prev) => (prev + 1) % geckoz.length)
    setShowTraits(false)
  }

  const prevGecko = () => {
    setActiveIndex((prev) => (prev - 1 + geckoz.length) % geckoz.length)
    setShowTraits(false)
  }

  const goToIndex = (index: number) => {
    setActiveIndex(index)
    setShowTraits(false)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      nextGecko()
    }, 6000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  // Resume auto-play after 10 seconds of inactivity
  useEffect(() => {
    if (isAutoPlaying) return
    
    const timeout = setTimeout(() => {
      setIsAutoPlaying(true)
    }, 10000)
    
    return () => clearTimeout(timeout)
  }, [activeIndex, isAutoPlaying])

  const activeGecko = geckoz[activeIndex]
  const rarityColors = getRarityColor(activeGecko.rarity)

  return (
    <section 
      ref={containerRef}
      id="enhanced-gecko-carousel"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        perspective: '2000px',
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
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 10
        }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'bold',
            background: `linear-gradient(45deg, var(--dimension-1), var(--dimension-2), var(--dimension-3))`,
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'paradoxTextShift 8s ease-in-out infinite',
            marginBottom: '0.5rem'
          }}
        >
          Gecko Dimension Portal
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.25rem' }}>
          Navigate through {geckoz.length} interdimensional geckoz
        </p>
      </motion.div>

      {/* Main Gecko Display */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '4rem',
          width: '90%',
          maxWidth: '1400px',
          height: '70%'
        }}
      >
        {/* Large Gecko Image */}
        <motion.div
          key={activeIndex}
          style={{
            position: 'relative',
            width: '600px',
            height: '600px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${rarityColors.glow}, rgba(0,0,0,0.3))`,
            border: `3px solid ${rarityColors.main}`,
            boxShadow: `0 0 60px ${rarityColors.glow}, 0 0 120px ${rarityColors.glow}`,
            transformStyle: 'preserve-3d'
          }}
          initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateY: 30 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
        >
          <img 
            src={activeGecko.image}
            alt={activeGecko.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '20px',
              filter: `drop-shadow(0 10px 30px ${rarityColors.glow})`
            }}
            onError={(e) => {
              // Fallback to gecko emoji if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.gecko-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'gecko-fallback';
                fallback.style.cssText = `
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  font-size: 200px;
                  text-align: center;
                `;
                fallback.textContent = '🦎';
                parent.appendChild(fallback);
              }
            }}
          />
          
          {/* Rarity Badge */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: `linear-gradient(135deg, ${rarityColors.main}, ${rarityColors.glow})`,
              color: 'white',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              boxShadow: `0 4px 12px ${rarityColors.glow}`
            }}
          >
            {activeGecko.rarity}
          </div>

          {/* Info Button */}
          <button
            onClick={() => setShowTraits(!showTraits)}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${rarityColors.glow}`
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <Info size={20} color="white" />
          </button>
        </motion.div>

        {/* Gecko Info Panel - Positioned Next to Image */}
        <motion.div
          style={{
            width: '400px',
            height: '600px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div>
            <h3 
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: rarityColors.main,
                marginBottom: '0.5rem',
                textShadow: `0 0 20px ${rarityColors.glow}`
              }}
            >
              {activeGecko.name}
            </h3>
            <p 
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}
            >
              {activeGecko.description}
            </p>
          </div>

          {/* Traits Section */}
          <AnimatePresence>
            {showTraits && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <h4 
                  style={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}
                >
                  Traits
                </h4>
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '0.5rem'
                  }}
                >
                  {Object.entries(activeGecko.traits).map(([category, trait]) => (
                    <div
                      key={category}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        background: `rgba(${rarityColors.glow.replace('rgba(', '').replace(')', '').split(',').slice(0, 3).join(', ')}, 0.1)`,
                        border: `1px solid ${rarityColors.main}`,
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.8rem'
                      }}
                    >
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'capitalize' }}>
                        {category}:
                      </span>
                      <span style={{ color: 'white', fontWeight: '500' }}>
                        {trait}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gecko Traits Display */}
          <div 
            style={{
              marginTop: 'auto',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <h5 
              style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}
            >
              Gecko Traits
            </h5>
            {Object.entries(activeGecko.traits).slice(0, 3).map(([category, trait]) => (
              <div 
                key={category}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'capitalize' }}>
                  {category}:
                </span>
                <span style={{ color: rarityColors.main, fontWeight: 'bold' }}>
                  {trait}
                </span>
              </div>
            ))}
            {Object.keys(activeGecko.traits).length > 3 && (
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                  +{Object.keys(activeGecko.traits).length - 3} more traits
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevGecko}
        style={{
          position: 'absolute',
          left: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 20
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--dimension-1)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
        }}
      >
        <ChevronLeft size={24} color="white" />
      </button>

      <button
        onClick={nextGecko}
        style={{
          position: 'absolute',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 20
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--dimension-1)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
        }}
      >
        <ChevronRight size={24} color="white" />
      </button>

      {/* Pagination Wheel */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          padding: '1rem 2rem',
          borderRadius: '50px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10
        }}
      >
        {geckoz.map((gecko, index) => {
          const isActive = index === activeIndex
          const colors = getRarityColor(gecko.rarity)
          
          return (
            <motion.button
              key={gecko.id}
              onClick={() => goToIndex(index)}
              style={{
                width: isActive ? '16px' : '12px',
                height: isActive ? '16px' : '12px',
                borderRadius: '50%',
                background: isActive ? colors.main : 'rgba(255, 255, 255, 0.3)',
                border: isActive ? `2px solid ${colors.main}` : '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 0 20px ${colors.glow}` : 'none',
                position: 'relative'
              }}
              whileHover={{ 
                scale: 1.2,
                boxShadow: `0 0 20px ${colors.glow}`
              }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Tooltip */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '150%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                  zIndex: 100
                }}
              >
                {gecko.name}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Auto-play Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.875rem',
          zIndex: 10
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isAutoPlaying ? 'var(--dimension-3)' : 'rgba(255, 255, 255, 0.3)',
            animation: isAutoPlaying ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        />
        {isAutoPlaying ? 'Auto-Playing' : 'Manual Mode'}
      </div>
    </section>
  )
}