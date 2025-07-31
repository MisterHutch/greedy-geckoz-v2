'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, Users, Flame, Clock, DollarSign, Activity } from 'lucide-react'

interface DegenDashboardProps {
  panicMeter: number
}

export default function DegenDashboard({ panicMeter }: DegenDashboardProps) {
  const [floorPrice, setFloorPrice] = useState(0.69)
  const [volume24h, setVolume24h] = useState(420.69)
  const [holders, setHolders] = useState(1337)
  const [lastRug, setLastRug] = useState('2h ago')

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setFloorPrice(prev => Math.max(0.01, prev + (Math.random() - 0.6) * 0.05))
      setVolume24h(prev => Math.max(0, prev + (Math.random() - 0.5) * 50))
      setHolders(prev => Math.max(100, prev + Math.floor((Math.random() - 0.5) * 10)))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      label: 'FLOOR PRICE',
      value: `${floorPrice.toFixed(3)} SOL`,
      change: -12.5,
      icon: TrendingDown,
      color: 'text-rug-red'
    },
    {
      label: '24H VOLUME',
      value: `${volume24h.toFixed(1)} SOL`,
      change: +5.2,
      icon: Activity,
      color: 'text-degen-green'
    },
    {
      label: 'HOLDERS CRYING',
      value: holders.toLocaleString(),
      change: -3.1,
      icon: Users,
      color: 'text-fomo-gold'
    },
    {
      label: 'LAST RUG',
      value: lastRug,
      change: 0,
      icon: Clock,
      color: 'text-cope-blue'
    }
  ]

  const recentActivity = [
    { type: 'mint', user: 'DegenApe420', action: 'minted', gecko: '#2841', time: '2m ago' },
    { type: 'sale', user: 'PaperHands69', action: 'panic sold', gecko: '#1337', price: '0.42 SOL', time: '5m ago' },
    { type: 'transfer', user: 'DiamondHands', action: 'transferred', gecko: '#420', time: '8m ago' },
    { type: 'mint', user: 'NgmiGuru', action: 'minted', gecko: '#2842', time: '12m ago' },
  ]

  return (
    <section className="py-12 px-4 bg-gray-900/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-3xl font-bold text-degen-green mb-2">
            🚨 LIVE DEGEN METRICS 🚨
          </h3>
          <p className="text-gray-400 font-body">
            Real-time chaos, updated every 5 seconds (probably lies)
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-void border border-degen-green rounded-lg p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Glitch overlay */}
              <div className="absolute inset-0 bg-degen-green opacity-0 hover:opacity-10 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={stat.color} size={20} />
                  {stat.change !== 0 && (
                    <span className={`text-xs font-bold ${stat.change > 0 ? 'text-degen-green' : 'text-rug-red'}`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-1 font-body">
                  {stat.label}
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {stat.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity Feed */}
          <motion.div
            className="bg-void border border-degen-green rounded-lg p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-xl font-bold text-degen-green mb-4 flex items-center">
              <Activity className="mr-2" size={20} />
              RECENT DEGENERACY
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'mint' ? 'bg-degen-green' :
                      activity.type === 'sale' ? 'bg-rug-red' : 'bg-cope-blue'
                    }`} />
                    <div className="text-sm">
                      <span className="text-white font-bold">{activity.user}</span>
                      <span className="text-gray-400"> {activity.action} </span>
                      <span className="text-degen-green">Gecko {activity.gecko}</span>
                      {activity.price && (
                        <span className="text-fomo-gold"> for {activity.price}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Meme of the Day */}
          <motion.div
            className="bg-void border border-degen-green rounded-lg p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-xl font-bold text-degen-green mb-4 flex items-center">
              <Flame className="mr-2" size={20} />
              DAILY DEGEN DOSE
            </h4>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">📉</div>
              <div className="text-lg font-bold text-white mb-2">
                "Buy high, sell low - it's not a bug, it's a feature"
              </div>
              <div className="text-sm text-gray-400 font-body">
                Today's wisdom from @DegenSensei
              </div>
            </div>
            
            {/* Quick Tips */}
            <div className="mt-4 space-y-2">
              <div className="text-sm font-bold text-fomo-gold">💡 TODAY'S DEGEN TIPS:</div>
              <ul className="text-xs text-gray-300 space-y-1 font-body">
                <li>• Always DYOR (Do Your Own Rugpull)</li>
                <li>• Diamond hands beat paper plans</li>
                <li>• If it pumps, you're probably too late</li>
                <li>• Trust the process (of losing money)</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}