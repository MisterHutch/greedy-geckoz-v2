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
    lotteryWinnersCount: 0,
    lotteryWinnersRemaining: 5,
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
    <div className="min-h-screen psychedelic-gradient-hero font-sans overflow-x-hidden fly-cursor">
      <Header />
      
      {/* Live Stats Ticker */}
      <div className="psychedelic-gradient-1 text-white py-3 overflow-hidden">
        <div className="animate-scroll whitespace-nowrap text-sm font-medium">
          🦎 {mintStats.totalMinted}/{mintStats.totalSupply} Geckos Claimed by Degens | 
          💰 {mintStats.lotteryWinnersRemaining}/5 Lottery Winners Still Out There (~{mintStats.lotteryPool} SOL each) | 
          ⚡ Only 0.0169 SOL (because we're generous like that) | 
          🎯 "Why be broke when you can own a jpeg gecko?" | 
          Follow @geckoz for the chaos
        </div>
      </div>

      <main className="relative">
        {/* Hero Section */}
        <HeroSection mintStats={mintStats} />
        
        {/* Gecko Carousel */}
        <GeckoCarousel />
        
        {/* Mint Interface */}
        <section className="py-16 px-4 psychedelic-gradient-2 relative">
          {/* Add overlay for better readability */}
          <div className="absolute inset-0 bg-white/80"></div>
          <div className="relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 glitch-text test-green">
                Mint Your Gecko (And Maybe Get Rich?)
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join 2222 gecko degenerates • 0.0169 SOL each • 5 random lottery winners get ~0.93 SOL each (because someone has to get lucky, right?)
              </p>
            </div>
            <MintInterface mintStats={mintStats} />
          </div>
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
                <h3 className="text-xl font-bold mb-4 text-primary-500">Geckoz</h3>
                <p className="text-gray-400 mb-4">
                  2222 gecko degenerates who think owning JPEGs makes them entrepreneurs. Spoiler: it doesn't, but it's fun.
                </p>
                <div className="text-sm text-gray-500">
                  Built with 💚 and questionable life choices
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Collection Info</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Supply: 2,222 Overpriced JPEGs</li>
                  <li>Price: 0.0169 SOL (bargain!)</li>
                  <li>Lottery: 5 random winners total</li>
                  <li>Prize: ~0.93 SOL each (better than your portfolio)</li>
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
              © 2025 Geckoz. All rights reserved. This is definitely not financial advice (seriously, don't listen to geckos about money).
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}