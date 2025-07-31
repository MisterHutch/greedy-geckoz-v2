'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import MintInterface from './components/MintInterface'
import GeckoCarousel from './components/GeckoCarousel'
import LotterySection from './components/LotterySection'
import TeamSection from './components/TeamSection'

export default function Home() {
  const [mintStats, setMintStats] = useState({
    totalMinted: 0,
    totalSupply: 2222,
    nextLotteryAt: 444,
    lotteryPool: 0.93
  })

  useEffect(() => {
    // Simulate real-time mint updates
    const timer = setInterval(() => {
      setMintStats(prev => ({
        ...prev,
        totalMinted: Math.min(prev.totalSupply, prev.totalMinted + Math.floor(Math.random() * 3))
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Header />
      
      {/* Live Stats Ticker */}
      <div className="bg-primary-500 text-white py-3 overflow-hidden">
        <div className="animate-scroll whitespace-nowrap text-sm font-medium">
          🦎 {mintStats.totalMinted}/{mintStats.totalSupply} Geckos Minted | 
          💰 Next Lottery at {mintStats.nextLotteryAt} mints (~{mintStats.lotteryPool} SOL Prize) | 
          ⚡ 0.0169 SOL each | 
          🎯 "Greed is Good" | 
          Follow @greedygeckoz for updates
        </div>
      </div>

      <main className="relative">
        {/* Hero Section */}
        <HeroSection mintStats={mintStats} />
        
        {/* Gecko Carousel */}
        <GeckoCarousel />
        
        {/* Mint Interface */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Mint Your Greedy Gecko
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join 2222 unique gecko collectors • 0.0169 SOL each • Lottery every 444 mints with ~0.93 SOL prizes!
              </p>
            </div>
            <MintInterface mintStats={mintStats} />
          </div>
        </section>
        
        {/* Lottery Section */}
        <LotterySection mintStats={mintStats} />
        
        {/* Team Section */}
        <TeamSection />
        
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary-500">Greedy Geckoz</h3>
                <p className="text-gray-400 mb-4">
                  The most entrepreneurial gecko collection on Solana. Greed is Good.
                </p>
                <div className="text-sm text-gray-500">
                  Built with 💚 for the gecko community
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Collection Info</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Supply: 2,222 Unique Geckos</li>
                  <li>Price: 0.0169 SOL</li>
                  <li>Lottery: Every 444 mints</li>
                  <li>Prize Pool: ~0.93 SOL each</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Community</h4>
                <div className="flex space-x-4">
                  <a 
                    href="https://twitter.com/greedygeckoz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    Twitter
                  </a>
                  <a 
                    href="https://t.me/+TjyUbcWEorNlNDcx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    Telegram
                  </a>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    Magic Eden
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
              © 2025 Greedy Geckoz. All rights reserved. Remember: This is not financial advice.
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}