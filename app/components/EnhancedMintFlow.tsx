'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Trophy, Zap, Coins, DollarSign, Users, Dice1, Dice6, Crown, Star } from 'lucide-react'
import WalletButton from './WalletButton'
import GeckoNotification, { useGeckoNotifications } from './GeckoNotification'

interface LotteryInfo {
  totalWinners: number
  winnersRemaining: number
  prizePool: number
}

interface MintFlowState {
  step: 'selection' | 'payment' | 'coinflip' | 'minting' | 'complete'
  selectedQuantity: number
  totalCost: number
  lotteryEntries: number
  coinflipChoice: 'accept' | 'decline' | null
  coinflipResult: 'win' | 'lose' | null
  finalQuantity: number
  isLotteryWinner: boolean
}

interface EnhancedMintFlowProps {
  lotteryInfo: LotteryInfo
  mintPrice: number // SOL per gecko
  availableGeckos: number
}

export default function EnhancedMintFlow({ 
  lotteryInfo, 
  mintPrice = 0.0169,
  availableGeckos = 5000 
}: EnhancedMintFlowProps) {
  const { publicKey, connected } = useWallet()
  const [userBalance, setUserBalance] = useState(0)
  const [mintFlow, setMintFlow] = useState<MintFlowState>({
    step: 'selection',
    selectedQuantity: 1,
    totalCost: mintPrice,
    lotteryEntries: 1,
    coinflipChoice: null,
    coinflipResult: null,
    finalQuantity: 0,
    isLotteryWinner: false
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [coinflipAnimation, setCoinflipAnimation] = useState(false)
  
  const notifications = useGeckoNotifications()

  // Update costs when quantity changes
  useEffect(() => {
    setMintFlow(prev => ({
      ...prev,
      totalCost: prev.selectedQuantity * mintPrice,
      lotteryEntries: prev.selectedQuantity
    }))
  }, [mintFlow.selectedQuantity, mintPrice])

  // Load user balance
  useEffect(() => {
    if (!publicKey) return

    const loadBalance = async () => {
      try {
        const connection = new Connection('https://api.mainnet-beta.solana.com')
        const balance = await connection.getBalance(publicKey)
        setUserBalance(balance / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error('Failed to load balance:', error)
      }
    }

    loadBalance()
    const interval = setInterval(loadBalance, 10000)
    return () => clearInterval(interval)
  }, [publicKey])

  const handleQuantitySelect = (quantity: number) => {
    setMintFlow(prev => ({
      ...prev,
      selectedQuantity: quantity,
      totalCost: quantity * mintPrice,
      lotteryEntries: quantity
    }))
  }

  const proceedToPayment = () => {
    if (!connected) {
      notifications.addNotification('error', 'Wallet Required', 'Please connect your wallet to continue')
      return
    }

    if (userBalance < mintFlow.totalCost) {
      notifications.addNotification('error', 'Insufficient Funds', 
        `You need ${mintFlow.totalCost.toFixed(4)} SOL but only have ${userBalance.toFixed(4)} SOL`)
      return
    }

    setMintFlow(prev => ({ ...prev, step: 'payment' }))
  }

  const proceedToCoinflip = () => {
    setMintFlow(prev => ({ ...prev, step: 'coinflip' }))
  }

  const handleCoinflipChoice = (choice: 'accept' | 'decline') => {
    setMintFlow(prev => ({ ...prev, coinflipChoice: choice }))
    
    if (choice === 'decline') {
      // Skip coinflip, mint original quantity
      setMintFlow(prev => ({
        ...prev,
        step: 'minting',
        finalQuantity: prev.selectedQuantity
      }))
      executeMinting(mintFlow.selectedQuantity)
    } else {
      // Execute coinflip
      executeCoinflip()
    }
  }

  const executeCoinflip = async () => {
    setIsProcessing(true)
    setCoinflipAnimation(true)

    // Simulate coinflip with animation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const isWin = Math.random() > 0.5
    const result = isWin ? 'win' : 'lose'
    const finalQuantity = isWin ? mintFlow.selectedQuantity * 2 : 0

    setCoinflipAnimation(false)
    setMintFlow(prev => ({
      ...prev,
      coinflipResult: result,
      finalQuantity,
      step: finalQuantity > 0 ? 'minting' : 'complete'
    }))

    if (finalQuantity > 0) {
      setTimeout(() => executeMinting(finalQuantity), 1500)
    } else {
      setIsProcessing(false)
    }
  }

  const executeMinting = async (quantity: number) => {
    setIsProcessing(true)
    
    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check for lottery win (5% chance per entry)
      const lotteryChance = quantity * 0.05
      const isLotteryWinner = Math.random() < lotteryChance
      
      setMintFlow(prev => ({
        ...prev,
        step: 'complete',
        isLotteryWinner
      }))
      
      if (isLotteryWinner) {
        notifications.addNotification('success', '🏆 LOTTERY WINNER! 🏆', 
          `Congratulations! You've won the lottery prize!`)
      }
      
      notifications.addNotification('success', 'Minting Complete!', 
        `Successfully minted ${quantity} Greedy Gecko${quantity !== 1 ? 's' : ''}!`)
        
    } catch (error) {
      console.error('Minting failed:', error)
      notifications.addNotification('error', 'Minting Failed', 'Please try again')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetFlow = () => {
    setMintFlow({
      step: 'selection',
      selectedQuantity: 1,
      totalCost: mintPrice,
      lotteryEntries: 1,
      coinflipChoice: null,
      coinflipResult: null,
      finalQuantity: 0,
      isLotteryWinner: false
    })
  }

  const renderQuantitySelection = () => (
    <motion.div
      className="card max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🦎 Mint Your Greedy Geckoz
        </h2>
        <p className="text-gray-600 text-lg">
          Each gecko = 1 lottery entry • {mintPrice} SOL per gecko
        </p>
      </div>

      {/* Lottery Info */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8 border border-yellow-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="text-xl font-bold text-yellow-900">🎰 Lottery System</h3>
              <p className="text-yellow-700">5 winners will be randomly selected!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-900">{lotteryInfo.winnersRemaining}</p>
            <p className="text-sm text-yellow-700">winners left</p>
          </div>
        </div>
        <div className="w-full bg-yellow-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((5 - lotteryInfo.winnersRemaining) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Quantity Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((quantity) => (
          <button
            key={quantity}
            onClick={() => handleQuantitySelect(quantity)}
            className={`p-6 rounded-xl border-2 transition-all ${
              mintFlow.selectedQuantity === quantity
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">{quantity}</div>
              <div className="text-sm text-gray-600 mb-2">
                {(quantity * mintPrice).toFixed(4)} SOL
              </div>
              <div className="flex items-center justify-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-yellow-600">{quantity} entries</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selection Summary */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Selected Quantity:</span>
          <span className="text-xl font-bold text-primary-600">{mintFlow.selectedQuantity} gecko{mintFlow.selectedQuantity !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total Cost:</span>
          <span className="text-xl font-bold">{mintFlow.totalCost.toFixed(4)} SOL</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Lottery Entries:</span>
          <span className="text-lg font-bold text-yellow-600">{mintFlow.lotteryEntries} entries</span>
        </div>
      </div>

      {!connected ? (
        <div className="text-center">
          <WalletButton />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            Your balance: {userBalance.toFixed(4)} SOL
          </div>
          <button
            onClick={proceedToPayment}
            disabled={userBalance < mintFlow.totalCost}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
              userBalance >= mintFlow.totalCost
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {userBalance >= mintFlow.totalCost ? 'Continue to Payment' : 'Insufficient Funds'}
          </button>
        </div>
      )}
    </motion.div>
  )

  const renderPaymentConfirmation = () => (
    <motion.div
      className="card max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          💰 Confirm Payment
        </h2>
        <p className="text-gray-600">
          Review your order before proceeding to the coin flip challenge
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Geckos:</span>
            <span>{mintFlow.selectedQuantity}</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Price per Gecko:</span>
            <span>{mintPrice} SOL</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Lottery Entries:</span>
            <span className="text-yellow-600 font-bold">{mintFlow.lotteryEntries}</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Cost:</span>
              <span className="text-primary-600">{mintFlow.totalCost.toFixed(4)} SOL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setMintFlow(prev => ({ ...prev, step: 'selection' }))}
          className="flex-1 py-3 px-6 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={proceedToCoinflip}
          className="flex-1 py-3 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors"
        >
          Proceed to Coin Flip 🪙
        </button>
      </div>
    </motion.div>
  )

  const renderCoinflip = () => (
    <motion.div
      className="card max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🪙 Double or Nothing Challenge!
        </h2>
        <p className="text-gray-600 text-lg">
          Take the risk for double the geckos and double the lottery entries!
        </p>
      </div>

      {!coinflipAnimation ? (
        <>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 mb-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">🪙</div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">Coin Flip Options:</p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-green-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-800 mb-2">WIN</div>
                    <div className="text-green-700">
                      <div className="font-semibold">{mintFlow.selectedQuantity * 2} Geckos</div>
                      <div className="text-sm">{mintFlow.selectedQuantity * 2} lottery entries</div>
                    </div>
                  </div>
                  <div className="bg-red-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-800 mb-2">LOSE</div>
                    <div className="text-red-700">
                      <div className="font-semibold">0 Geckos</div>
                      <div className="text-sm">0 lottery entries</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleCoinflipChoice('accept')}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-lg transition-all"
            >
              🎲 Take the Risk! Double or Nothing!
            </button>
            <button
              onClick={() => handleCoinflipChoice('decline')}
              className="w-full py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              🛡️ Play it Safe - Get {mintFlow.selectedQuantity} Gecko{mintFlow.selectedQuantity !== 1 ? 's' : ''}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <motion.div
            className="text-8xl mb-8"
            animate={{ 
              rotateY: [0, 180, 360, 540, 720],
              scale: [1, 1.2, 1, 1.2, 1]
            }}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
            🪙
          </motion.div>
          <p className="text-2xl font-bold text-gray-700 mb-4">Flipping coin...</p>
          <p className="text-gray-600">The fates are deciding your gecko destiny!</p>
        </div>
      )}
    </motion.div>
  )

  const renderComplete = () => (
    <motion.div
      className="card max-w-2xl mx-auto text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {mintFlow.coinflipResult === 'lose' ? (
        <div>
          <div className="text-8xl mb-6">😢</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">Better Luck Next Time!</h2>
          <p className="text-gray-600 text-lg mb-8">
            The coin flip didn't go your way this time. But hey, that's the thrill of the gamble!
          </p>
          <button
            onClick={resetFlow}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Try Again 🎲
          </button>
        </div>
      ) : (
        <div>
          <div className="text-8xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            Congratulations! 🦎
          </h2>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 mb-8">
            <div className="space-y-4">
              <div className="text-2xl font-bold text-gray-900">
                You received {mintFlow.finalQuantity} Greedy Gecko{mintFlow.finalQuantity !== 1 ? 's' : ''}!
              </div>
              <div className="text-lg text-yellow-700">
                ⭐ {mintFlow.finalQuantity} lottery entries added
              </div>
              {mintFlow.isLotteryWinner && (
                <div className="bg-yellow-100 rounded-lg p-4 border border-yellow-300">
                  <div className="text-2xl font-bold text-yellow-800">🏆 LOTTERY WINNER! 🏆</div>
                  <p className="text-yellow-700">You've won the special lottery prize!</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600 text-lg">
              🔓 You now have access to exclusive member areas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="/dashboard" 
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                📊 Portfolio Tracker
              </a>
              <a 
                href="/playground" 
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                🌊 Fluid Playground
              </a>
            </div>
            <button
              onClick={resetFlow}
              className="w-full mt-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Mint More Geckos 🦎
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="min-h-screen py-8 px-4">
      <GeckoNotification />
      
      <AnimatePresence mode="wait">
        {mintFlow.step === 'selection' && (
          <div key="selection">{renderQuantitySelection()}</div>
        )}
        {mintFlow.step === 'payment' && (
          <div key="payment">{renderPaymentConfirmation()}</div>
        )}
        {mintFlow.step === 'coinflip' && (
          <div key="coinflip">{renderCoinflip()}</div>
        )}
        {mintFlow.step === 'minting' && (
          <motion.div
            key="minting"
            className="card max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="py-12">
              <motion.div
                className="text-8xl mb-6"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                🦎
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Minting Your Geckos...</h2>
              <p className="text-gray-600">
                Creating {mintFlow.finalQuantity} unique gecko{mintFlow.finalQuantity !== 1 ? 's' : ''} across the multiverse!
              </p>
            </div>
          </motion.div>
        )}
        {mintFlow.step === 'complete' && (
          <div key="complete">{renderComplete()}</div>
        )}
      </AnimatePresence>
    </div>
  )
}