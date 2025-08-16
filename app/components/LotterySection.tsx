'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Timer, Coins, Users } from 'lucide-react'

interface LotterySectionProps {
  mintStats: {
    totalMinted: number
    totalSupply: number
    lotteryWinnersCount: number
    lotteryWinnersRemaining: number
    lotteryPool: number
  }
}

export default function LotterySection({ mintStats }: LotterySectionProps) {
  const lotteryProgress = ((5 - mintStats.lotteryWinnersRemaining) / 5) * 100

  // Mock previous winners - updated for random system
  const recentWinners = [
    { wallet: '7xKx...9pQe', amount: 0.93, gecko: '#1337', time: '2 hours ago' },
    { wallet: '3mRt...7nBx', amount: 0.93, gecko: '#420', time: '1 day ago' },
    { wallet: '9kLp...2cVn', amount: 0.93, gecko: '#69', time: '3 days ago' },
  ]

  return (
    <section id="lottery" className="py-16 px-4 psychedelic-gradient-3 relative">
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-white/70"></div>
      <div className="relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🎰 Random Gecko Lottery
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Out of 2222 geckos, 5 lucky winners will be randomly selected to win ~0.93 SOL each! 
              No gaming, no timing—just pure dumb luck (your specialty).
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Live Lottery Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="card lottery-glow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Random Lottery Status</h3>
                <Trophy className="w-8 h-8 text-primary-500" />
              </div>

              {/* Winners Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Winners Found</span>
                  <span className="text-sm font-bold text-primary-600">
                    {5 - mintStats.lotteryWinnersRemaining}/5 winners
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div 
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-4 rounded-full lottery-glow"
                    initial={{ width: 0 }}
                    animate={{ width: `${lotteryProgress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>{mintStats.lotteryWinnersRemaining > 0 ? "Still randomly picking winners" : "All lottery spots filled!"}</span>
                  <span>{mintStats.lotteryWinnersRemaining} spots left</span>
                </div>
              </div>

              {/* Current Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <Coins className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary-600">~{mintStats.lotteryPool}</div>
                  <div className="text-sm text-gray-600">SOL Each Winner</div>
                </div>
                <div className="text-center p-4 bg-accent-50 rounded-lg">
                  <Trophy className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-accent-600">{mintStats.lotteryWinnersRemaining}</div>
                  <div className="text-sm text-gray-600">Spots Remaining</div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="card">
              <h4 className="text-lg font-bold text-gray-900 mb-4">How the Lottery Works (It's Simple, Even for You)</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <p>5 random winners will be chosen from all 2222 gecko minters</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <p>Winners are picked completely randomly—no gaming the system</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <p>Each lucky winner gets ~0.93 SOL (plus bragging rights)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <p>Your odds: roughly 0.22% per gecko (better than the stock market)</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Winners */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Recent Winners</h3>
                <Users className="w-8 h-8 text-accent-500" />
              </div>

              <div className="space-y-4">
                {recentWinners.map((winner, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg"
                  >
                    <div>
                      <div className="font-bold text-gray-900">{winner.wallet}</div>
                      <div className="text-sm text-gray-600">
                        Won with Gecko {winner.gecko} • {winner.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        +{winner.amount} SOL
                      </div>
                      <div className="text-xs text-gray-500">Prize</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">Pro Tip (Not Really):</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  More geckos = more chances to win. Math is hard, but this part isn't!
                </p>
              </div>
            </div>

            {/* Lottery Stats */}
            <div className="card">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Lottery Math (Don't Worry, We Did It for You)</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-primary-600">5</div>
                  <div className="text-xs text-gray-600">Total Winners</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-accent-500">~4.6</div>
                  <div className="text-xs text-gray-600">Total SOL Prizes</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gecko-green">Random</div>
                  <div className="text-xs text-gray-600">Selection Method</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-500">0.22%</div>
                  <div className="text-xs text-gray-600">Win Chance Each</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </section>
  )
}