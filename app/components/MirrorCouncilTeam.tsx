'use client'

import { motion } from 'framer-motion'
import { Twitter, MessageCircle, Briefcase } from 'lucide-react'
import { useScrollValue } from '../../lib/paradox/scroll-controller'

interface TeamMember {
  name: string
  role: string
  description: string
  traits: string[]
  socials: { twitter: string; telegram: string }
  isAnon?: boolean
}

export default function MirrorCouncilTeam() {
  const { scrollY, paradoxIntensity } = useScrollValue()
  
  const team: TeamMember[] = [
    {
      name: 'Alpha Gecko',
      role: 'Founder & CEO',
      description: 'Serial entrepreneur who turned pocket change into a gecko empire. Believes greed can change the world.',
      traits: ['Visionary', 'Risk Taker', 'Community Builder'],
      socials: { twitter: '@alphagecko', telegram: 'alphagecko' }
    },
    {
      name: 'Beta Gecko',
      role: 'CTO & Dev',
      description: 'Code wizard who builds while others sleep. Makes magic happen behind the scenes.',
      traits: ['Builder', 'Innovator', 'Problem Solver'],
      socials: { twitter: '@betagecko', telegram: 'betagecko' }
    },
    {
      name: 'Sigma Gecko',
      role: 'Community Lead',
      description: 'The voice of the geckoz. Keeps the community hyped and handles all the chaos.',
      traits: ['Communicator', 'Hype Master', 'Community First'],
      socials: { twitter: '@sigmagecko', telegram: 'sigmagecko' }
    },
    {
      name: 'anon hutch',
      role: 'Shadow Architect',
      description: 'The mysterious force behind the code. Builds interdimensional bridges while remaining forever anonymous.',
      traits: ['Ghost Builder', 'Code Whisperer', 'Dimension Walker'],
      socials: { twitter: '@anonhutch', telegram: 'anonhutch' },
      isAnon: true
    }
  ]

  const dimensionalPhase = scrollY * 0.002

  return (
    <section 
      id="mirror-council"
      data-paradox-section="mirror-council"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        perspective: '2500px',
        transformStyle: 'preserve-3d',
        background: `
          radial-gradient(circle at 30% 40%, rgba(131, 56, 236, ${0.15 + paradoxIntensity * 0.05}) 0%, transparent 50%),
          radial-gradient(circle at 70% 60%, rgba(255, 0, 110, ${0.1 + paradoxIntensity * 0.05}) 0%, transparent 50%),
          linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)
        `,
        overflow: 'hidden'
      }}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          top: '5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 20
        }}
      >
        <h2 
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: `linear-gradient(45deg, var(--dimension-1), var(--dimension-2), var(--dimension-3))`,
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'paradoxTextShift 8s ease-in-out infinite'
          }}
        >
          The Gecko Council of Mirrors
        </h2>
        <p 
          style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          The visionary team building the most greedy gecko empire across all dimensions, one JPEG at a time.
        </p>
      </motion.div>

      {/* Impossible Mirrors Grid */}
      <div 
        className="impossible-mirrors"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '4rem',
          padding: '12rem 4rem 4rem',
          height: '100%',
          transformStyle: 'preserve-3d',
          position: 'relative',
          zIndex: 10
        }}
      >
        {team.map((member, index) => {
          const mirrorRotation = [
            { rotateY: -15, rotateX: 5 },
            { rotateY: 15, rotateX: -5 },
            { rotateY: -10, rotateX: 10 },
            { rotateY: 10, rotateX: -10 }
          ][index]
          
          const memberPhase = dimensionalPhase + index * 0.5

          return (
            <motion.div
              key={index}
              className={`council-mirror mirror-${index} ${member.isAnon ? 'phase-shift' : ''}`}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transform: `perspective(1000px) rotateY(${mirrorRotation.rotateY}deg) rotateX(${mirrorRotation.rotateX}deg)`,
                animation: member.isAnon ? 'anonPhaseShift 6s ease-in-out infinite' : undefined
              }}
              initial={{ opacity: 0, scale: 0.5, rotateX: 45 }}
              whileInView={{ opacity: 1, scale: 1, rotateX: mirrorRotation.rotateX }}
              transition={{ 
                delay: index * 0.2,
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{
                scale: 1.05,
                rotateY: mirrorRotation.rotateY + (mirrorRotation.rotateY > 0 ? 5 : -5),
                rotateX: mirrorRotation.rotateX + 5,
                transition: { duration: 0.3 }
              }}
            >
              {/* Primary Member Reality */}
              <div 
                className="member-reality-prime"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  background: `rgba(255, 255, 255, ${member.isAnon ? '0.015' : '0.03'})`,
                  backdropFilter: 'blur(15px)',
                  border: `1px solid rgba(86, 236, 106, ${0.2 + Math.sin(memberPhase) * 0.1})`,
                  borderRadius: '20px',
                  padding: '2rem',
                  transformStyle: 'preserve-3d',
                  zIndex: 10,
                  opacity: member.isAnon ? 0.3 + Math.sin(memberPhase) * 0.4 : 1
                }}
              >
                {/* Member Avatar */}
                <div className="member-avatar" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div 
                    style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto',
                      background: `linear-gradient(45deg, var(--dimension-${(index % 4) + 1}), var(--reality-primary))`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      marginBottom: '1rem',
                      filter: member.isAnon ? `blur(${2 - Math.sin(memberPhase) * 2}px)` : 'none',
                      animation: member.isAnon ? 'anonPhaseShift 4s ease-in-out infinite' : undefined
                    }}
                  >
                    🦎
                  </div>
                  <h3 
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '0.5rem',
                      filter: member.isAnon ? `blur(${1 - Math.sin(memberPhase)}px)` : 'none'
                    }}
                  >
                    {member.name}
                  </h3>
                  <p 
                    style={{
                      color: `var(--dimension-${(index % 4) + 1})`,
                      fontWeight: '600',
                      fontSize: '1.125rem'
                    }}
                  >
                    {member.role}
                  </p>
                </div>

                {/* Description */}
                <p 
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                    filter: member.isAnon ? `blur(${0.5 - Math.sin(memberPhase) * 0.5}px)` : 'none'
                  }}
                >
                  {member.description}
                </p>

                {/* Traits */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'rgba(255, 255, 255, 0.9)',
                      marginBottom: '0.75rem',
                      textAlign: 'center'
                    }}
                  >
                    Core Traits
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                    {member.traits.map((trait, traitIndex) => (
                      <span
                        key={traitIndex}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: `rgba(${index * 50}, ${150 + index * 20}, ${100 + index * 30}, 0.2)`,
                          color: `var(--dimension-${(index % 4) + 1})`,
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          border: `1px solid var(--dimension-${(index % 4) + 1})`,
                          filter: member.isAnon ? `blur(${0.3 - Math.sin(memberPhase + traitIndex) * 0.3}px)` : 'none'
                        }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <a 
                    href={`https://twitter.com/${member.socials.twitter.replace('@', '')}`}
                    style={{
                      padding: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      transition: 'color 0.3s ease',
                      filter: member.isAnon ? `blur(${1 - Math.sin(memberPhase) * 0.8}px)` : 'none'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = `var(--dimension-${(index % 4) + 1})`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    <Twitter size={20} />
                  </a>
                  <a 
                    href={`https://t.me/${member.socials.telegram}`}
                    style={{
                      padding: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      transition: 'color 0.3s ease',
                      filter: member.isAnon ? `blur(${1 - Math.sin(memberPhase) * 0.8}px)` : 'none'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = `var(--dimension-${(index % 4) + 1})`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    <MessageCircle size={20} />
                  </a>
                </div>
              </div>

              {/* Impossible Reflections Matrix */}
              <div 
                className="reflection-matrix"
                style={{
                  position: 'absolute',
                  inset: 0,
                  transformStyle: 'preserve-3d',
                  pointerEvents: 'none'
                }}
              >
                {[...Array(3)].map((_, reflectionIndex) => (
                  <div
                    key={reflectionIndex}
                    className={`member-reflection reflection-${reflectionIndex}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: `1px solid rgba(131, 56, 236, ${0.1 - reflectionIndex * 0.03})`,
                      borderRadius: '20px',
                      transformStyle: 'preserve-3d',
                      transform: `
                        scaleX(-1) 
                        rotateY(${reflectionIndex * 45}deg) 
                        translateZ(-${(reflectionIndex + 1) * 100}px)
                        scale(${0.9 ** (reflectionIndex + 1)})
                      `,
                      opacity: (0.6 - reflectionIndex * 0.2) * (member.isAnon ? 0.5 : 1),
                      filter: `brightness(${0.6 - reflectionIndex * 0.2}) hue-rotate(${reflectionIndex * 45}deg) blur(${reflectionIndex}px)`,
                      animation: `echoShift ${8 + reflectionIndex * 2}s ease-in-out infinite`,
                      animationDelay: `${reflectionIndex * 0.5}s`
                    }}
                  >
                    {/* Reflection Avatar */}
                    <div 
                      style={{
                        width: '80px',
                        height: '80px',
                        margin: '2rem auto 0',
                        background: `linear-gradient(45deg, var(--dimension-${((index + reflectionIndex) % 4) + 1}), var(--reality-primary))`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        transform: `scale(${1 - reflectionIndex * 0.1})`
                      }}
                    >
                      🦎
                    </div>
                  </div>
                ))}
              </div>

              {/* Temporal Echoes */}
              <div className="temporal-echoes">
                <div 
                  className="past-echo"
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: `rgba(255, 0, 110, ${0.3 + Math.sin(memberPhase + 1) * 0.2})`,
                    transform: 'translateZ(-50px) scale(0.8)',
                    filter: 'blur(1px)',
                    pointerEvents: 'none',
                    animation: 'echoShift 10s ease-in-out infinite',
                    animationDelay: '2s'
                  }}
                >
                  {member.name}
                </div>
                <div 
                  className="future-echo"
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: `rgba(131, 56, 236, ${0.3 + Math.sin(memberPhase + 2) * 0.2})`,
                    transform: 'translateZ(50px) scale(1.2)',
                    filter: 'blur(2px)',
                    pointerEvents: 'none',
                    animation: 'echoShift 12s ease-in-out infinite reverse',
                    animationDelay: '1s'
                  }}
                >
                  {member.name}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Company Mission with Paradox Effects */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{
          position: 'absolute',
          bottom: '5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '800px',
          width: '90%',
          background: `
            linear-gradient(45deg, 
              rgba(86, 236, 106, 0.05) 0%, 
              rgba(131, 56, 236, 0.05) 50%, 
              rgba(255, 0, 110, 0.05) 100%)
          `,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(86, 236, 106, 0.2)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          zIndex: 15
        }}
      >
        <Briefcase 
          style={{
            width: '3rem',
            height: '3rem',
            color: 'var(--reality-primary)',
            margin: '0 auto 1rem',
            filter: 'drop-shadow(0 0 10px var(--reality-primary))'
          }}
        />
        <h3 
          style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}
        >
          Our Interdimensional Mission
        </h3>
        <p 
          style={{
            fontSize: '1.125rem',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.6,
            marginBottom: '1.5rem'
          }}
        >
          "To build the most entrepreneurial and community-driven gecko collection across all realities. 
          We believe that when greedy geckoz work together across dimensions, everyone wins. Our lottery system, 
          active community, and innovative approach make collecting geckoz both fun and rewarding across infinite timelines."
        </p>
        
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            fontSize: '0.875rem'
          }}
        >
          <div>
            <div 
              style={{
                fontWeight: 'bold',
                color: 'var(--dimension-1)',
                marginBottom: '0.25rem'
              }}
            >
              Community First
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Always listening
            </div>
          </div>
          <div>
            <div 
              style={{
                fontWeight: 'bold',
                color: 'var(--dimension-2)',
                marginBottom: '0.25rem'
              }}
            >
              Innovation
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Never stopping
            </div>
          </div>
          <div>
            <div 
              style={{
                fontWeight: 'bold',
                color: 'var(--reality-primary)',
                marginBottom: '0.25rem'
              }}
            >
              Transparency
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Always honest
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Dimensional Orbs */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              background: `radial-gradient(circle, var(--dimension-${(i % 4) + 1}), transparent)`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3,
              animation: `float${['Up', 'Down', 'Left', 'Right', 'Spiral'][i % 5]} ${8 + Math.random() * 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
              filter: 'blur(2px)'
            }}
          />
        ))}
      </div>
    </section>
  )
}