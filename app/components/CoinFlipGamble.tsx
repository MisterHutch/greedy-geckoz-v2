'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface CoinFlipGambleProps {
  isActive: boolean
  mintQuantity: number
  onChoice: (choice: 'heads' | 'tails') => void
  onSkip: () => void
}

export default function CoinFlipGamble({ isActive, mintQuantity, onChoice, onSkip }: CoinFlipGambleProps) {
  if (!isActive) return null

  const gambleCost = (0.0169 * mintQuantity).toFixed(4)
  const potentialReward = mintQuantity * 2

  return (
    <>
      {/* Modal Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        style={{ zIndex: 50 }}
        onClick={onSkip}
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 51 }}
      >
        <div 
          className="bg-black/90 backdrop-blur-xl border-2 border-yellow-400/30 rounded-2xl p-8 mx-4 max-w-2xl w-full pointer-events-auto"
          style={{
            boxShadow: '0 25px 50px -12px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 215, 0, 0.1)',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(255, 215, 0, 0.05) 50%, rgba(0, 0, 0, 0.95) 100%)'
          }}
        >
          {/* Floating Particles Inside Modal */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Modal Content */}
          <div className="relative text-center text-white z-10">
            {/* Spinning Coin Preview */}
            <motion.div
              className="text-8xl mb-6"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))'
              }}
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotateY: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              🪙
            </motion.div>

            <div className="mb-2 text-sm text-yellow-400/80 font-medium uppercase tracking-wider">
              🎰 Gambling Opportunity
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent animate-pulse">
              DOUBLE OR NOTHING
            </h2>

            <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4 mb-6">
              <div className="text-lg text-white/90 leading-relaxed space-y-2">
                <p>🎲 You've secured <span className="font-bold text-yellow-400">{mintQuantity} geckoz</span> for <span className="font-bold text-yellow-400">{gambleCost} SOL</span></p>
                <p>💰 Risk another <span className="font-bold text-yellow-400">{gambleCost} SOL</span> to gamble for <span className="font-bold text-green-400">{potentialReward} geckoz</span> total!</p>
              </div>
            </div>
            
            <div className="bg-orange-900/20 border border-orange-400/30 rounded-lg p-3 mb-6">
              <p className="text-orange-300 text-sm">⚠️ <strong>Risk:</strong> Win = Get {potentialReward} geckoz + lottery chances | Lose = Get nothing & pay double</p>
            </div>

            {/* Risk/Reward Display */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-6 bg-black/40 rounded-xl border border-yellow-400/30">
              <div className="text-center">
                <div className="text-xl text-red-400 mb-2">😈 RISK</div>
                <div className="text-lg font-bold">
                  <div>Lose {mintQuantity} geckoz</div>
                  <div className="text-red-300">Pay {(parseFloat(gambleCost) * 2).toFixed(4)} SOL</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl text-green-400 mb-2">🚀 REWARD</div>
                <div className="text-lg font-bold">
                  <div>Get {potentialReward} geckoz</div>
                  <div className="text-green-300">+ {mintQuantity * 2}x lottery chances!</div>
                </div>
              </div>
            </div>

            {/* Choice Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <motion.button
                onClick={() => onChoice('heads')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-4 px-8 rounded-xl text-xl shadow-lg hover:shadow-yellow-400/50 transition-shadow"
              >
                🌟 HEADS
              </motion.button>
              
              <motion.button
                onClick={() => onChoice('tails')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-orange-400 to-orange-500 text-black font-bold py-4 px-8 rounded-xl text-xl shadow-lg hover:shadow-orange-400/50 transition-shadow"
              >
                ⚡ TAILS
              </motion.button>
            </div>

            {/* Skip Button */}
            <div className="border-t border-white/20 pt-4 mt-4">
              <motion.button
                onClick={onSkip}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/10 hover:bg-white/20 text-white/80 border-2 border-white/30 rounded-lg py-3 px-6 text-base backdrop-blur-sm transition-colors"
              >
                😇 Keep My {mintQuantity} Geckoz (Safe Choice)
              </motion.button>
              <p className="text-xs text-white/60 text-center mt-2">Click anywhere outside to skip gambling</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

