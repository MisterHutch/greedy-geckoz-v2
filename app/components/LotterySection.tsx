'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Timer, Coins, Users } from 'lucide-react'

interface LotterySectionProps {
  mintStats: {
    totalMinted: number
    totalSupply: number
    nextLotteryAt: number
    lotteryPool: number
  }
}

export default function LotterySection({ mintStats }: LotterySectionProps) {
  const [timeUntilLottery, setTimeUntilLottery] = useState('')
  
  const mintsUntilLottery = mintStats.nextLotteryAt - (mintStats.totalMinted % mintStats.nextLotteryAt)
  const lotteryProgress = ((mintStats.totalMinted % mintStats.nextLotteryAt) / mintStats.nextLotteryAt) * 100

  // Mock previous winners
  const recentWinners = [
    { wallet: '7xKx...9pQe', amount: 0.93, gecko: '#1776', time: '2 hours ago' },
    { wallet: '3mRt...7nBx', amount: 0.93, gecko: '#890', time: '1 day ago' },
    { wallet: '9kLp...2cVn', amount: 0.93, gecko: '#445', time: '3 days ago' },
  ]

  useEffect(() => {
    // Simulate countdown to next lottery milestone
    const timer = setInterval(() => {
      const estimated = Math.max(0, mintsUntilLottery * 2) // ~2 minutes per mint estimate
      const hours = Math.floor(estimated / 60)
      const minutes = estimated % 60
      setTimeUntilLottery(`~${hours}h ${minutes}m`)
    }, 1000)

    return () => clearInterval(timer)
  }, [mintsUntilLottery])

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🎰 Gecko Lottery System
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every 444 mints, one lucky gecko holder wins the lottery prize pool! 
              Your chances increase with participation.
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
                <h3 className="text-2xl font-bold text-gray-900">Next Lottery</h3>
                <Trophy className="w-8 h-8 text-primary-500" />
              </div>

              {/* Progress to Next Lottery */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress to Lottery</span>
                  <span className="text-sm font-bold text-primary-600">
                    {Math.round(lotteryProgress)}%
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
                  <span>{mintStats.totalMinted % mintStats.nextLotteryAt} / {mintStats.nextLotteryAt} mints</span>
                  <span>{mintsUntilLottery} mints remaining</span>
                </div>
              </div>

              {/* Current Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <Coins className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary-600">~{mintStats.lotteryPool}</div>
                  <div className="text-sm text-gray-600">SOL Prize</div>
                </div>
                <div className="text-center p-4 bg-accent-50 rounded-lg">
                  <Timer className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-accent-600">{timeUntilLottery}</div>
                  <div className="text-sm text-gray-600">Estimated</div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="card">
              <h4 className="text-lg font-bold text-gray-900 mb-4">How It Works</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <p>7% of each mint goes to the lottery pool + 2 SOL from creator</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <p>Every 444th mint automatically triggers a lottery draw</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <p>The 444th minter wins ~0.93 SOL + bragging rights!</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <p>Total of 5 lottery events throughout the collection</p>
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
                  <span className="font-semibold">Pro Tip:</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Mint multiple geckos to increase your chances of hitting a lottery milestone!
                </p>
              </div>
            </div>

            {/* Lottery Stats */}
            <div className="card">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Lottery Economics</h4>
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
                  <div className="text-xl font-bold text-gecko-green">444</div>
                  <div className="text-xs text-gray-600">Mint Interval</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-500">0.22%</div>
                  <div className="text-xs text-gray-600">Win Chance</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}