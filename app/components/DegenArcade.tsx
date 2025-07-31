'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Dice1, TrendingUp, TrendingDown, Zap, Star } from 'lucide-react'

export default function DegenArcade() {
  const [activeGame, setActiveGame] = useState<'slots' | 'prediction' | 'rarity' | null>(null)
  const [slotResult, setSlotResult] = useState<string[]>(['🦎', '🦎', '🦎'])
  const [isSpinning, setIsSpinning] = useState(false)
  const [credits, setCredits] = useState(420)
  const [prediction, setPrediction] = useState<'pump' | 'dump' | null>(null)
  const [showResult, setShowResult] = useState(false)

  const slotSymbols = ['🦎', '💎', '🔥', '💀', '🚀', '📉', '💰', '🤡']
  
  const games = [
    {
      id: 'slots' as const,
      title: 'Gecko Slots',
      description: 'Spin to win (or lose everything)',
      icon: Dice1,
      color: 'bg-degen-green'
    },
    {
      id: 'prediction' as const,
      title: 'Pump or Dump',
      description: 'Predict the next move',
      icon: TrendingUp,
      color: 'bg-solana-purple'
    },
    {
      id: 'rarity' as const,
      title: 'Trait Gambler',
      description: 'Guess the rarity odds',
      icon: Star,
      color: 'bg-fomo-gold'
    }
  ]

  const spinSlots = () => {
    if (credits < 10) return
    
    setIsSpinning(true)
    setCredits(prev => prev - 10)

    // Animate spinning
    const spinInterval = setInterval(() => {
      setSlotResult(prev => prev.map(() => 
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)]
      ))
    }, 100)

    setTimeout(() => {
      clearInterval(spinInterval)
      const finalResult = [
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)]
      ]
      
      setSlotResult(finalResult)
      setIsSpinning(false)

      // Check for wins
      const allSame = finalResult.every(symbol => symbol === finalResult[0])
      const hasGecko = finalResult.includes('🦎')
      
      if (allSame) {
        if (finalResult[0] === '🦎') {
          setCredits(prev => prev + 1000) // Jackpot
        } else {
          setCredits(prev => prev + 100)
        }
      } else if (hasGecko && finalResult.filter(s => s === '🦎').length === 2) {
        setCredits(prev => prev + 50)
      }
    }, 2000)
  }

  const makePrediction = (choice: 'pump' | 'dump') => {
    setPrediction(choice)
    setShowResult(true)
    
    setTimeout(() => {
      const isCorrect = Math.random() > 0.5
      if (isCorrect) {
        setCredits(prev => prev + 50)
      } else {
        setCredits(prev => Math.max(0, prev - 25))
      }
      
      setTimeout(() => {
        setShowResult(false)
        setPrediction(null)
      }, 2000)
    }, 1000)
  }

  const GameModal = ({ game }: { game: typeof games[0] }) => (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-void border border-degen-green rounded-lg p-6 max-w-md w-full"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-degen-green">{game.title}</h3>
          <button
            onClick={() => setActiveGame(null)}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-sm text-gray-400 mb-2">Credits: {credits}</div>
        </div>

        {game.id === 'slots' && (
          <div className="text-center">
            <div className="bg-gray-900 rounded-lg p-6 mb-4">
              <div className="flex justify-center space-x-4 text-4xl mb-4">
                {slotResult.map((symbol, index) => (
                  <motion.div
                    key={index}
                    className={`w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center ${
                      isSpinning ? 'animate-bounce' : ''
                    }`}
                    animate={isSpinning ? { rotateY: 360 } : {}}
                    transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
                  >
                    {symbol}
                  </motion.div>
                ))}
              </div>
              <motion.button
                onClick={spinSlots}
                disabled={isSpinning || credits < 10}
                className="bg-degen-green text-black px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSpinning ? 'SPINNING...' : 'SPIN (10 credits)'}
              </motion.button>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>🦎🦎🦎 = 1000 credits (JACKPOT!)</div>
              <div>Any 3 same = 100 credits</div>
              <div>2 Geckos = 50 credits</div>
            </div>
          </div>
        )}

        {game.id === 'prediction' && (
          <div className="text-center">
            <div className="bg-gray-900 rounded-lg p-6 mb-4">
              <div className="text-lg mb-4">
                Will the floor price go up or down in the next hour?
              </div>
              
              {!prediction && !showResult && (
                <div className="flex space-x-4 justify-center">
                  <motion.button
                    onClick={() => makePrediction('pump')}
                    className="bg-degen-green text-black px-6 py-3 rounded-lg font-bold flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <TrendingUp size={20} />
                    <span>PUMP</span>
                  </motion.button>
                  <motion.button
                    onClick={() => makePrediction('dump')}
                    className="bg-rug-red text-white px-6 py-3 rounded-lg font-bold flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <TrendingDown size={20} />
                    <span>DUMP</span>
                  </motion.button>
                </div>
              )}

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-2xl"
                >
                  {Math.random() > 0.5 ? (
                    <div className="text-degen-green">
                      🚀 CORRECT! +50 credits
                    </div>
                  ) : (
                    <div className="text-rug-red">
                      💀 WRONG! -25 credits
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            <div className="text-xs text-gray-400">
              Correct guess = +50 credits • Wrong guess = -25 credits
            </div>
          </div>
        )}

        {game.id === 'rarity' && (
          <div className="text-center">
            <div className="bg-gray-900 rounded-lg p-6 mb-4">
              <div className="text-lg mb-4">
                Guess the rarity of this trait combination:
              </div>
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="text-2xl mb-2">🦎</div>
                <div className="text-sm space-y-1">
                  <div>Background: Cosmic Purple</div>
                  <div>Eyes: Laser Vision</div>
                  <div>Hat: Diamond Crown</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-degen-green text-black py-2 rounded font-bold">
                  Common (60%+)
                </button>
                <button className="bg-fomo-gold text-black py-2 rounded font-bold">
                  Rare (10-20%)
                </button>
                <button className="bg-solana-purple text-white py-2 rounded font-bold">
                  Epic (3-10%)
                </button>
                <button className="bg-rug-red text-white py-2 rounded font-bold">
                  Legendary (&lt;3%)
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Correct rarity guess wins credits based on difficulty
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )

  return (
    <section className="py-12 px-4 bg-gray-900/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-3xl font-bold text-degen-green mb-2 flex items-center justify-center">
            <Gamepad2 className="mr-3" size={32} />
            🎮 DEGEN ARCADE 🎮
          </h3>
          <p className="text-gray-400 font-body">
            Lose your money in fun new ways! (Results not guaranteed, void where prohibited by common sense)
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              className="bg-void border border-degen-green rounded-lg p-6 cursor-pointer hover:border-solana-purple transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveGame(game.id)}
            >
              <div className="text-center">
                <div className={`${game.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <game.icon size={32} className="text-black" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{game.title}</h4>
                <p className="text-gray-400 text-sm font-body mb-4">{game.description}</p>
                <motion.button
                  className="bg-degen-green text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  PLAY NOW
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Daily Challenges */}
        <motion.div
          className="mt-12 bg-void border border-fomo-gold rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h4 className="text-xl font-bold text-fomo-gold mb-4 flex items-center">
            <Zap className="mr-2" size={20} />
            DAILY DEGEN CHALLENGES
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Win 3 slot spins</div>
              <div className="text-lg font-bold text-white">Progress: 1/3</div>
              <div className="text-xs text-degen-green">Reward: 500 credits</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Make 5 correct predictions</div>
              <div className="text-lg font-bold text-white">Progress: 0/5</div>
              <div className="text-xs text-degen-green">Reward: Rare Gecko trait</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Guess 10 rarities correctly</div>
              <div className="text-lg font-bold text-white">Progress: 0/10</div>
              <div className="text-xs text-degen-green">Reward: 1000 credits</div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {activeGame && (
          <GameModal game={games.find(g => g.id === activeGame)!} />
        )}
      </AnimatePresence>
    </section>
  )
}