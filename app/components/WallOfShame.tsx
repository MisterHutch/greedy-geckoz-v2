'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingDown, Crown, Skull } from 'lucide-react'

export default function WallOfShame() {
  const [activeTab, setActiveTab] = useState<'fame' | 'shame'>('shame')

  const shameEntries = [
    {
      user: 'PanicSellPete',
      action: 'Sold entire bag at 0.1 SOL',
      loss: '-89.5%',
      gecko: '#420',
      time: '2h ago',
      reactions: 42
    },
    {
      user: 'FomoFred',
      action: 'Bought at ATH for 15 SOL',
      loss: '-94.6%',
      gecko: '#69',
      time: '1d ago',
      reactions: 69
    },
    {
      user: 'RuggedRonnie',
      action: 'Transferred to wrong wallet',
      loss: '-100%',
      gecko: '#1337',
      time: '3d ago',
      reactions: 420
    }
  ]

  const fameEntries = [
    {
      user: 'DiamondDave',
      action: 'Held through -90% drawdown',
      gain: '+420%',
      gecko: '#1',
      time: '1w ago',
      reactions: 1337
    },
    {
      user: 'TimingTina',
      action: 'Perfect entry at floor',
      gain: '+200%',
      gecko: '#888',
      time: '2d ago',
      reactions: 888
    }
  ]

  const currentEntries = activeTab === 'shame' ? shameEntries : fameEntries

  return (
    <motion.div
      className="bg-void border border-degen-green rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header with Tabs */}
      <div className="bg-gray-900 border-b border-degen-green p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xl font-bold text-degen-green flex items-center">
            {activeTab === 'shame' ? <Skull className="mr-2" size={20} /> : <Crown className="mr-2" size={20} />}
            WALL OF {activeTab.toUpperCase()}
          </h4>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('shame')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              activeTab === 'shame' 
                ? 'bg-rug-red text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            💀 SHAME
          </button>
          <button
            onClick={() => setActiveTab('fame')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              activeTab === 'fame' 
                ? 'bg-degen-green text-black' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            👑 FAME
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="p-4 space-y-4">
        {currentEntries.map((entry, index) => (
          <motion.div
            key={entry.user}
            className={`p-4 rounded-lg border-l-4 ${
              activeTab === 'shame' 
                ? 'border-rug-red bg-rug-red/10' 
                : 'border-degen-green bg-degen-green/10'
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-bold text-white text-sm">
                    #{index + 1} {entry.user}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    activeTab === 'shame' 
                      ? 'bg-rug-red text-white' 
                      : 'bg-degen-green text-black'
                  }`}>
                    {activeTab === 'shame' ? entry.loss : entry.gain}
                  </span>
                </div>
                <p className="text-gray-300 text-sm font-body mb-2">
                  {entry.action}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Gecko {entry.gecko}</span>
                  <span>{entry.time}</span>
                  <span className="flex items-center space-x-1">
                    <span>{activeTab === 'shame' ? '😂' : '🔥'}</span>
                    <span>{entry.reactions}</span>
                  </span>
                </div>
              </div>
              
              <div className="text-2xl">
                {activeTab === 'shame' ? '💀' : '👑'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submit Section */}
      <div className="border-t border-degen-green p-4 bg-gray-900/50">
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2 font-body">
            Got a legendary {activeTab} story?
          </p>
          <motion.button
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              activeTab === 'shame'
                ? 'bg-rug-red hover:bg-red-600 text-white'
                : 'bg-degen-green hover:bg-green-400 text-black'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            SUBMIT YOUR {activeTab.toUpperCase()}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}