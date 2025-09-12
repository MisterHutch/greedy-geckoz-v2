'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import EnhancedMintFlow from '../components/EnhancedMintFlow'
// Gecko notifications are rendered inside EnhancedMintFlow; no need to duplicate here

export default function MintPage() {
  const [lotteryInfo, setLotteryInfo] = useState({
    totalWinners: 5,
    winnersRemaining: 5,
    prizePool: 0.93
  })

  return (
    <div className="min-h-screen psychedelic-gradient-hero">
      <Header />
      
      <main className="relative py-8">
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-white/10"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 trippy-text neon-glow-multicolor">
              🦎 Mint Greedy Geckoz
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto px-4">
              Enter the interdimensional gecko realm • Each gecko = 1 lottery entry • 5 winners selected randomly
            </p>
          </div>

          <EnhancedMintFlow 
            lotteryInfo={lotteryInfo}
            mintPrice={0.0169}
            availableGeckos={2000}
          />
        </div>
      </main>
    </div>
  )
}
