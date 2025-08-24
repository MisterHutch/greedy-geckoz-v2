'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import ImpossibleGecko from './components/ImpossibleGecko'
import EnhancedGeckoCarousel from './components/EnhancedGeckoCarousel'
import MintDescentInterface from './components/MintDescentInterface'
import MirrorCouncilTeam from './components/MirrorCouncilTeam'
import LotterySection from './components/LotterySection'
import EnvironmentToggle, { useEnvironment } from './components/EnvironmentToggle'
import GeckoNotification, { useGeckoNotifications } from './components/GeckoNotification'
import { ParadoxScrollMaster } from '../lib/paradox/scroll-controller'

export default function Home() {
  // Global state
  const environment = useEnvironment()
  const notifications = useGeckoNotifications()
  
  const [mintStats, setMintStats] = useState({
    totalMinted: 1453,
    totalSupply: 2222,
    lotteryWinnersCount: 0,
    lotteryWinnersRemaining: 5,
    lotteryPool: 0.93,
    availableGeckoz: 769
  })

  useEffect(() => {
    // Initialize Paradox Scroll Controller
    const paradoxScrollMaster = new ParadoxScrollMaster()
    
    // Simulate real-time mint updates
    const timer = setInterval(() => {
      setMintStats(prev => ({
        ...prev,
        totalMinted: Math.min(prev.totalSupply, prev.totalMinted + Math.floor(Math.random() * 3)),
        availableGeckoz: Math.max(0, prev.availableGeckoz - Math.floor(Math.random() * 2))
      }))
    }, 45000) // Update every 45 seconds

    return () => {
      clearInterval(timer)
      paradoxScrollMaster.destroy()
    }
  }, [])

  return (
    <div 
      className="min-h-screen font-sans overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(131, 56, 236, 0.1) 50%, rgba(0, 0, 0, 0.99) 100%)',
        position: 'relative'
      }}
    >
      <Header />
      
      {/* Paradox Stats Ticker */}
      <div 
        style={{
          background: 'linear-gradient(90deg, var(--dimension-1), var(--dimension-2), var(--dimension-3), var(--dimension-4))',
          backgroundSize: '400% 100%',
          animation: 'paradoxTextShift 12s ease-in-out infinite'
        }}
        className="text-white py-3 overflow-hidden"
      >
        <div className="animate-scroll whitespace-nowrap text-sm font-medium">
          🦎 {mintStats.totalMinted}/{mintStats.totalSupply} Geckoz Transcended Reality | 
          💎 {mintStats.availableGeckoz} Geckoz Awaiting Manifestation |
          💰 {mintStats.lotteryWinnersRemaining}/5 Dimensional Lottery Winners Remaining (~{mintStats.lotteryPool} SOL each) | 
          ⚡ Only 0.0169 SOL to Enter the Gecko Dimension | 
          🌀 "Reality is Optional, Geckoz are Forever" | 
          🔗 Follow @greedygeckoz across all timelines
        </div>
      </div>

      <main className="relative" style={{ transformStyle: 'preserve-3d' }}>
        {/* Impossible Gecko Hero Section */}
        <ImpossibleGecko mintStats={mintStats} />
        
        {/* Enhanced Gecko Portal Carousel */}
        <EnhancedGeckoCarousel />
        
        {/* Mint Descent Interface */}
        <MintDescentInterface mintStats={mintStats} />
        
        {/* Lottery Section */}
        <LotterySection mintStats={mintStats} />
        
        {/* Mirror Council Team */}
        <MirrorCouncilTeam />
        
        {/* Paradox Footer */}
        <footer 
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(0, 0, 0, 0.95) 0%, 
                rgba(131, 56, 236, 0.1) 30%, 
                rgba(255, 0, 110, 0.05) 70%, 
                rgba(0, 0, 0, 0.98) 100%)
            `,
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(86, 236, 106, 0.2)'
          }}
          className="text-white py-12 px-4"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    background: `linear-gradient(45deg, var(--dimension-1), var(--dimension-2), var(--dimension-3))`,
                    backgroundSize: '300% 300%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'paradoxTextShift 8s ease-in-out infinite'
                  }}
                >
                  Greedy Geckoz ∞
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
                  2222 interdimensional geckoz existing across infinite realities. Where greed transcends physics and JPEGs become metaphysical entities.
                </p>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Built with 🌀 paradox energy and impossible geometry
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '1rem', color: 'var(--dimension-2)' }}>
                  Dimensional Stats
                </h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    Supply: 2,222 Impossible Geckoz
                  </li>
                  <li style={{ marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    Price: 0.0169 SOL per reality breach
                  </li>
                  <li style={{ marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    Lottery: 5 dimensional winners
                  </li>
                  <li style={{ marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    Prize: ~{mintStats.lotteryPool} SOL (per dimension)
                  </li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '1rem', color: 'var(--dimension-3)' }}>
                  Cross-Reality Links
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a 
                    href="https://twitter.com/greedygeckoz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dimension-1)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    🐦 Twitter Timeline
                  </a>
                  <a 
                    href="https://t.me/+TjyUbcWEorNlNDcx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dimension-2)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    💬 Telegram Void
                  </a>
                  <a 
                    href="#" 
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dimension-3)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    🎭 Magic Eden Portal
                  </a>
                </div>
              </div>
            </div>
            <div 
              style={{
                borderTop: '1px solid rgba(86, 236, 106, 0.2)',
                paddingTop: '2rem',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.875rem'
              }}
            >
              © 2025 Greedy Geckoz ∞. All rights reserved across infinite dimensions. 
              This is definitely not financial advice in any reality (seriously, don't trust interdimensional geckoz with your portfolio).
            </div>
          </div>
        </footer>
      </main>
      
      {/* Global Environment Toggle */}
      <EnvironmentToggle 
        currentEnv={environment.environment}
        onEnvChange={environment.changeEnvironment}
      />
      
      {/* Global Gecko Notifications */}
      <GeckoNotification
        notifications={notifications.notifications}
        onDismiss={notifications.removeNotification}
      />
    </div>
  )
}