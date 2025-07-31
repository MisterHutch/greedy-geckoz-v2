'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface HeroSectionProps {
  mintStats: {
    totalMinted: number
    totalSupply: number
    nextLotteryAt: number
    lotteryPool: number
  }
}

export default function HeroSection({ mintStats }: HeroSectionProps) {
  const [typedText, setTypedText] = useState('')
  const fullText = 'Greed is Good'
  
  useEffect(() => {
    let i = 0
    const typeTimer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeTimer)
      }
    }, 150)
    
    return () => clearInterval(typeTimer)
  }, [])

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-6xl mx-auto text-center">
        {/* Main Logo/Gecko */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block relative">
            <motion.div
              className="text-8xl md:text-9xl float-animation"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🦎
            </motion.div>
          </div>
        </motion.div>

        {/* Brand Title */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Greedy Geckoz
        </motion.h1>

        {/* Typewriter Motto */}
        <motion.div
          className="text-2xl md:text-3xl font-medium text-primary-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="border-r-2 border-primary-500 pr-1">
            {typedText}
          </span>
        </motion.div>

        {/* Collection Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600">
              {mintStats.totalSupply.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm">Total Supply</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-accent-500">
              {mintStats.totalMinted.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm">Minted</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-gecko-green">
              0.0169
            </div>
            <div className="text-gray-600 text-sm">SOL Each</div>
          </div>
          <div className="card text-center lottery-glow">
            <div className="text-3xl font-bold text-primary-600">
              ~{mintStats.lotteryPool}
            </div>
            <div className="text-gray-600 text-sm">SOL Prize</div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <button className="btn-primary">
            🦎 Mint Your Gecko
          </button>
          <button className="btn-outline">
            🎰 View Lottery
          </button>
        </motion.div>

        {/* Live Progress Bar */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 border border-primary-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Collection Progress</span>
              <span className="text-sm font-bold text-primary-600">
                {Math.round((mintStats.totalMinted / mintStats.totalSupply) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <motion.div 
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(mintStats.totalMinted / mintStats.totalSupply) * 100}%` 
                }}
                transition={{ duration: 2, delay: 1.5 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Next Lottery: {mintStats.nextLotteryAt - (mintStats.totalMinted % mintStats.nextLotteryAt)} mints</span>
              <span>{mintStats.totalSupply - mintStats.totalMinted} remaining</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}