'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Trophy, Zap, Clock, DollarSign, Users, Wallet, ExternalLink } from 'lucide-react'
import WalletButton from './WalletButton'
import GeckoMintService, { MINT_CONFIG } from '../../lib/solana/gecko-mint-service'
import GeckoNotification, { useGeckoNotifications } from './GeckoNotification'
import EnvironmentToggle, { useEnvironment } from './EnvironmentToggle'

interface MintInterfaceProps {
  mintStats: {
    totalMinted: number
    totalSupply: number
    lotteryWinnersCount: number
    lotteryWinnersRemaining: number
    lotteryPool: number
    availableGeckoz?: number
  }
}

export default function MintInterface({ mintStats }: MintInterfaceProps) {
  const wallet = useWallet()
  const { publicKey, connected } = wallet
  const [isMinting, setIsMinting] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [mintResult, setMintResult] = useState<any>(null)
  const [showLotteryWin, setShowLotteryWin] = useState(false)
  const [showMintPopup, setShowMintPopup] = useState(false)
  const [mintService, setMintService] = useState<GeckoMintService | null>(null)
  const [realMintStats, setRealMintStats] = useState(mintStats)
  const [mintQuantity, setMintQuantity] = useState(1)
  
  // Use our custom notification system and environment toggle
  const notifications = useGeckoNotifications()
  const environment = useEnvironment()

  const lotteryWinnersLeft = realMintStats.lotteryWinnersRemaining
  const lotteryProgress = ((5 - lotteryWinnersLeft) / 5) * 100

  // Initialize connection and mint service based on environment
  useEffect(() => {
    const connection = new Connection(environment.getEndpoint())
    const service = new GeckoMintService(connection, environment.getTreasuryAddress())
    setMintService(service)
    
    // Update stats from service
    const stats = service.getMintStats()
    setRealMintStats(stats)
  }, [environment.environment]) // Recreate service when environment changes

  // Update stats periodically
  useEffect(() => {
    if (mintService) {
      const updateStats = () => {
        const stats = mintService.getMintStats()
        setRealMintStats(stats)
      }
      
      updateStats()
      const interval = setInterval(updateStats, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [mintService])

  // Load user balance
  useEffect(() => {
    if (!publicKey || !mintService) return

    const loadBalance = async () => {
      try {
        const connection = new Connection(environment.getEndpoint())
        const balance = await connection.getBalance(publicKey)
        setUserBalance(balance / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error('Failed to load balance:', error)
        notifications.addNotification('error', 'Balance Load Failed', 'Could not load wallet balance')
      }
    }

    loadBalance()
    const interval = setInterval(loadBalance, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [publicKey, mintService])

  const handleMint = async () => {
    if (!connected || !publicKey || !mintService) {
      notifications.showWalletNotConnected()
      return
    }

    if (userBalance < totalCost) {
      notifications.showInsufficientFunds(totalCost, userBalance)
      return
    }

    if ((realMintStats.availableGeckoz || 0) === 0) {
      notifications.showSoldOut()
      return
    }

    setIsMinting(true)
    
    try {
      // Show processing notification with environment info
      const loadingId = notifications.addNotification(
        'info',
        `Processing Mint on ${environment.environment.toUpperCase()}...`,
        environment.isDevnet 
          ? "Using devnet - free fake SOL for testing! 🧪" 
          : "Using mainnet - this costs real SOL! 💰",
        0 // Don't auto-dismiss
      )
      
      const result = mintQuantity === 1 
        ? await mintService.mintGecko(wallet)
        : await mintService.mintMultipleGeckos(wallet, mintQuantity)
      
      notifications.removeNotification(loadingId)
      
      if (result.success) {
        // Update local stats
        const updatedStats = mintService.getMintStats()
        setRealMintStats(updatedStats)
        
        setMintResult(result)
        
        // Show the detailed mint popup
        setShowMintPopup(true)
        
        if (result.lotteryWon) {
          setShowLotteryWin(true)
          setTimeout(() => setShowLotteryWin(false), 10000)
          
          if (result.lotteryWinners && result.lotteryWinners.length > 1) {
            // Multiple lottery wins in bulk mint
            notifications.addNotification(
              'success',
              `🎉 MULTIPLE LOTTERY WINS! 🎉`,
              `You won ${result.lotteryWinners.length} lotteries! +${result.totalLotteryWinnings} SOL + ${result.totalGeckoz} total geckoz!`,
              8000
            )
          } else {
            notifications.showLotteryWin(result.totalGeckoz || 3, result.solReceived || 0.98)
          }
        } else {
          if (mintQuantity > 1) {
            notifications.addNotification(
              'success',
              `🦎 Successfully minted ${mintQuantity} geckoz!`,
              `Your ${mintQuantity} geckoz have been added to your wallet. No lottery wins this time, but hey, you've got some sweet JPEGs!`,
              5000
            )
          } else {
            notifications.showMintSuccess(result.geckoId || 0)
          }
        }
        
        // Refresh balance
        setTimeout(async () => {
          try {
            const connection = new Connection(environment.getEndpoint())
            const balance = await connection.getBalance(publicKey)
            setUserBalance(balance / LAMPORTS_PER_SOL)
          } catch (error) {
            console.error('Failed to refresh balance:', error)
          }
        }, 2000)
        
      } else {
        notifications.showMintFailed(result.error)
      }

    } catch (error) {
      console.error('Mint failed:', error)
      notifications.showMintFailed((error as Error)?.message)
    } finally {
      setIsMinting(false)
    }
  }

  const totalCost = MINT_CONFIG.PRICE_SOL * mintQuantity
  const canAfford = userBalance >= totalCost
  const soldOut = (realMintStats.availableGeckoz || 0) === 0
  const maxQuantity = Math.min(10, realMintStats.availableGeckoz || 0) // Max 10 or available geckoz

  return (
    <div className="max-w-2xl mx-auto">
      {/* Lottery Winner Modal */}
      <AnimatePresence>
        {showLotteryWin && mintResult?.lotteryWon && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-2xl"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-primary-600 mb-2">
                LOTTERY WINNER!
              </h3>
              <p className="text-gray-700 text-lg mb-4">
                Congratulations! You just won the lottery jackpot!
              </p>
              <div className="text-4xl font-bold text-primary-500 mb-4">
                +{mintResult.solReceived?.toFixed(4)} SOL + {mintResult.totalGeckoz} Geckos!
              </div>
              <p className="text-gray-600 text-sm mb-6">
                The gecko gods have blessed you! 🦎✨
              </p>
              <button 
                onClick={() => setShowLotteryWin(false)}
                className="btn-primary"
              >
                Amazing! 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trippy Mint Results Popup */}
      <AnimatePresence>
        {showMintPopup && mintResult && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowMintPopup(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border-4 border-primary-500 relative overflow-hidden"
              initial={{ scale: 0.5, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 5 }}
            >
              {/* Trippy Background Animation */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowMintPopup(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold z-10"
              >
                ✕
              </button>

              {/* Header */}
              <div className="relative z-10 text-center mb-6">
                <motion.div
                  className="text-6xl mb-2"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🦎
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {mintResult.lotteryWon ? "🎰 HOLY GECKO! YOU WON!" : "🦎 GECKO ACQUIRED!"}
                </h2>
                <p className="text-white/80 text-lg">
                  {mintResult.lotteryWon 
                    ? "The gecko gods have blessed your degen soul!" 
                    : "Another overpriced JPEG added to your collection!"}
                </p>
              </div>

              {/* Main Content */}
              <div className="relative z-10 space-y-6">
                {/* Gecko Display */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Gecko Image and Info */}
                  <div className="flex-1">
                    {mintResult.geckoData && (
                      <div className="bg-black/40 rounded-xl p-4 border border-primary-500/30">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="relative">
                            <img
                              src={mintResult.imageIpfsHash ? 
                                `https://gateway.pinata.cloud/ipfs/${mintResult.imageIpfsHash}` : 
                                mintResult.geckoData.image
                              }
                              alt={mintResult.geckoData.name}
                              className="w-20 h-20 rounded-lg object-cover border-2 border-primary-500"
                            />
                            <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              #{mintResult.geckoId}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{mintResult.geckoData.name}</h3>
                            <p className="text-primary-300 text-sm">Your new degen companion</p>
                            {mintResult.mintedGeckos?.length > 1 && (
                              <p className="text-yellow-300 text-xs mt-1">
                                + {mintResult.mintedGeckos.length - 1} more gecko{mintResult.mintedGeckos.length > 2 ? 's' : ''}!
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Gecko Characteristics */}
                        <div className="space-y-2 text-sm">
                          <div className="text-white/80 font-semibold mb-2">
                            🧬 Generated Traits:
                            {mintResult.rarityScore && (
                              <span className="ml-2 text-xs bg-primary-500 px-2 py-1 rounded-full">
                                Score: {mintResult.rarityScore}
                              </span>
                            )}
                            {mintResult.isUltraRare && (
                              <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
                                ⭐ ULTRA RARE!
                              </span>
                            )}
                          </div>
                          {mintResult.generatedTraits ? (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(mintResult.generatedTraits).map(([category, trait]) => (
                                trait !== 'None' && (
                                  <div key={category} className="bg-white/10 px-2 py-1 rounded">
                                    <span className="text-gray-300">{category}:</span>{' '}
                                    <span className="text-white font-semibold">{trait as string}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-white/10 px-2 py-1 rounded">
                                <span className="text-gray-300">Rarity:</span> <span className="text-white font-semibold">Epic Degen</span>
                              </div>
                              <div className="bg-white/10 px-2 py-1 rounded">
                                <span className="text-gray-300">Vibes:</span> <span className="text-white font-semibold">Trippy AF</span>
                              </div>
                              <div className="bg-white/10 px-2 py-1 rounded">
                                <span className="text-gray-300">Power Level:</span> <span className="text-white font-semibold">Over 9000</span>
                              </div>
                              <div className="bg-white/10 px-2 py-1 rounded">
                                <span className="text-gray-300">Hopium:</span> <span className="text-white font-semibold">Maximum</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1">
                    <div className="bg-black/40 rounded-xl p-4 border border-primary-500/30 space-y-3">
                      <div className="text-white/80 font-semibold mb-3">📊 Degen Stats:</div>
                      
                      {/* Amount Spent */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">SOL Yeeted:</span>
                        <span className="text-white font-bold">{totalCost.toFixed(4)} SOL</span>
                      </div>

                      {/* Quantity */}
                      {mintQuantity > 1 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Geckos Minted:</span>
                          <span className="text-white font-bold">{mintQuantity}</span>
                        </div>
                      )}

                      {/* NFT Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">NFT Status:</span>
                        <span className={`font-bold ${mintResult.nftMintAddress ? 'text-green-400' : 'text-orange-400'}`}>
                          {mintResult.nftMintAddress ? '✅ Minted' : '⏳ Processing'}
                        </span>
                      </div>

                      {/* Lottery Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Lottery Status:</span>
                        <span className={`font-bold ${mintResult.lotteryWon ? 'text-yellow-400' : 'text-red-400'}`}>
                          {mintResult.lotteryWon ? '🎰 WINNER!' : '💸 REKT'}
                        </span>
                      </div>

                      {/* Lottery Winnings */}
                      {mintResult.lotteryWon && (
                        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-2">
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-300">SOL Won:</span>
                            <span className="text-yellow-400 font-bold">+{mintResult.solReceived || mintResult.totalLotteryWinnings} SOL</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-300">Total Geckos:</span>
                            <span className="text-yellow-400 font-bold">{mintResult.totalGeckoz}</span>
                          </div>
                          {mintResult.lotteryWinners?.length > 1 && (
                            <div className="text-xs text-yellow-200 mt-1">
                              Multiple wins: {mintResult.lotteryWinners.map(id => `#${id}`).join(', ')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Transaction & NFT Links */}
                      <div className="pt-2 border-t border-white/20 space-y-2">
                        <div>
                          <span className="text-gray-300 text-sm">Transaction:</span>
                          <div className="mt-1">
                            <a
                              href={`https://solscan.io/tx/${mintResult.txHash}${environment.isDevnet ? '?cluster=devnet' : ''}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 px-3 py-2 rounded-lg transition-colors group"
                            >
                              <span className="font-mono text-xs text-white">
                                {mintResult.txHash?.slice(0, 12)}...{mintResult.txHash?.slice(-8)}
                              </span>
                              <ExternalLink className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                            </a>
                          </div>
                        </div>

                        {/* NFT Link */}
                        {mintResult.nftMintAddress && (
                          <div>
                            <span className="text-gray-300 text-sm">View NFT:</span>
                            <div className="mt-1">
                              <a
                                href={`https://solscan.io/token/${mintResult.nftMintAddress}${environment.isDevnet ? '?cluster=devnet' : ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors group"
                              >
                                <span className="font-mono text-xs text-white">
                                  NFT #{mintResult.geckoId}
                                </span>
                                <ExternalLink className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sarcastic Footer */}
                <div className="text-center text-white/60 text-sm italic">
                  {mintResult.lotteryWon 
                    ? "Congrats! You beat the odds and won something actually valuable. Don't spend it all on more JPEGs... wait, you probably will. 🤡"
                    : "Welcome to the club of people who pay real money for cartoon lizards. Your mom would be so proud! 🦎💸"}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setShowMintPopup(false)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Close & Cope 😎
                  </button>
                  <button
                    onClick={() => {
                      if (mintQuantity < maxQuantity && userBalance >= totalCost) {
                        setShowMintPopup(false)
                        // User can mint more
                      }
                    }}
                    disabled={mintQuantity >= maxQuantity || userBalance < totalCost}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {userBalance < totalCost ? 'Need More SOL 💸' : 'Mint More JPEGs 🦎'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Ready to Buy a JPEG and Call Yourself an Investor?
          </h3>
          <p className="text-gray-600">
            Mint your gecko and maybe win some SOL back (because let's face it, you need it).
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Users className="w-6 h-6 text-accent-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {realMintStats.totalMinted.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Minted</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {MINT_CONFIG.PRICE_SOL} SOL
            </div>
            <div className="text-sm text-gray-600">Each</div>
          </div>

          <div className="text-center p-4 bg-primary-50 rounded-lg lottery-glow">
            <Trophy className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-primary-600">
              {MINT_CONFIG.LOTTERY_PRIZE_SOL} SOL
            </div>
            <div className="text-sm text-gray-600">Prize Each</div>
          </div>

          <div className="text-center p-4 bg-accent-50 rounded-lg">
            <Clock className="w-6 h-6 text-accent-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-accent-600">
              {lotteryWinnersLeft}
            </div>
            <div className="text-sm text-gray-600">Winners Left</div>
          </div>
        </div>

        {/* Lottery Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Lottery Winners Found</span>
            <span className="text-sm font-bold text-primary-600">
              {5 - lotteryWinnersLeft}/5 winners
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div 
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full lottery-glow"
              initial={{ width: 0 }}
              animate={{ width: `${lotteryProgress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>{lotteryWinnersLeft > 0 ? "Still accepting applications" : "All winners found (sorry!)"}</span>
            <span>{lotteryWinnersLeft} spots left</span>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How many geckoz? (Each has individual lottery chance!)
            </label>
            <div className="flex items-center justify-center space-x-4">
              <select
                value={mintQuantity}
                onChange={(e) => setMintQuantity(Math.min(parseInt(e.target.value), maxQuantity))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 font-medium"
                disabled={soldOut || maxQuantity === 0}
              >
                {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} geckoz{num > 1 ? '' : ''}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-500">
                Max: {maxQuantity}
              </div>
            </div>
          </div>
        </div>

        {/* Mint Price Display */}
        <div className="mb-6 text-center">
          <div className="text-sm text-gray-600 mb-2">
            {mintQuantity === 1 ? 'Mint Price' : `Total Cost (${mintQuantity} geckoz)`}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalCost.toFixed(4)} SOL
          </div>
          {mintQuantity > 1 && (
            <div className="text-sm text-gray-500">
              {MINT_CONFIG.PRICE_SOL} SOL each × {mintQuantity}
            </div>
          )}
          <div className="text-sm text-gray-500 mt-1">
            Available Geckoz: {realMintStats.availableGeckoz || 'Loading...'}
          </div>
        </div>

        {/* Mint Button */}
        <div className="text-center mb-6">
          {!connected ? (
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">Connect your wallet to make questionable financial decisions</p>
              <div className="flex justify-center">
                <WalletButton />
              </div>
            </div>
          ) : soldOut ? (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700 font-bold">SOLD OUT! All geckoz have found new homes 🦎 (You snooze, you lose!)</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  Your balance: {userBalance.toFixed(4)} SOL {!canAfford && '(not enough, but we appreciate the effort)'}
                </div>
                {environment.isDevnet && userBalance < totalCost && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <p className="text-yellow-700 font-semibold">🧪 DEVNET TIP:</p>
                    <p className="text-yellow-600">
                      Get free devnet SOL at{' '}
                      <a 
                        href="https://faucet.solana.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-yellow-800"
                      >
                        faucet.solana.com
                      </a>
                    </p>
                  </div>
                )}
              </div>
              
              <motion.button
                onClick={handleMint}
                disabled={isMinting || !canAfford}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  isMinting || !canAfford
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'btn-primary hover:scale-105 active:scale-95'
                }`}
                whileHover={{ scale: (isMinting || !canAfford) ? 1 : 1.02 }}
                whileTap={{ scale: (isMinting || !canAfford) ? 1 : 0.98 }}
              >
                {isMinting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>
                      {mintQuantity === 1 
                        ? 'Minting Your Geckoz...' 
                        : `Minting ${mintQuantity} Geckoz...`}
                    </span>
                  </div>
                ) : !canAfford ? (
                  `Need ${totalCost.toFixed(4)} SOL (Go get more!)`
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🦎</span>
                    <span>
                      {mintQuantity === 1 
                        ? `Mint Geckoz for ${MINT_CONFIG.PRICE_SOL} SOL`
                        : `Mint ${mintQuantity} Geckoz for ${totalCost.toFixed(4)} SOL`}
                    </span>
                  </div>
                )}
              </motion.button>

              {!canAfford && connected && (
                <p className="text-red-600 text-sm">
                  You need {(totalCost - userBalance).toFixed(4)} more SOL (time to sell something?)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Lottery Alert */}
        {lotteryWinnersLeft > 0 && !soldOut && (
          <motion.div
            className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-lg"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center justify-center space-x-2 text-primary-700">
              <Zap className="w-5 h-5" />
              <span className="font-bold">
                🚨 LOTTERY ALERT: {lotteryWinnersLeft} more winners can still win {MINT_CONFIG.LOTTERY_PRIZE_SOL} SOL + 3 geckoz each! 
                {mintQuantity > 1 && ` With ${mintQuantity} geckoz, you have ${mintQuantity} chances to win!`}
                {mintQuantity === 1 && ` (Could be you... probably not, but could be!)`}
              </span>
            </div>
          </motion.div>
        )}

        {/* Recent Mint Result */}
        {mintResult && (
          <motion.div
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="font-bold text-green-800 mb-2 flex items-center">
              🎉 {mintResult.mintedGeckos?.length > 1 
                ? `Bulk Mint Successful! (${mintResult.mintedGeckos.length} geckoz)`
                : 'Mint Successful!'}
            </h4>
            <div className="space-y-2 text-sm">
              {/* Transaction Info */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Transaction:</span>
                <div className="flex items-center space-x-2">
                  <a
                    href={`https://solscan.io/tx/${mintResult.txHash}${environment.isDevnet ? '?cluster=devnet' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 hover:text-primary-600 transition-colors"
                  >
                    <span className="font-mono text-xs text-gray-800 hover:text-primary-600">
                      {mintResult.txHash?.slice(0, 8)}...{mintResult.txHash?.slice(-8)}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400 hover:text-primary-600" />
                  </a>
                </div>
              </div>

              {/* Bulk mint summary */}
              {mintResult.mintedGeckos?.length > 1 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Geckoz Minted:</span>
                    <span className="font-bold text-gray-800">{mintResult.mintedGeckos.length}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Geckoz IDs: {mintResult.mintedGeckos.map(g => `#${g.id}`).join(', ')}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Geckoz ID:</span>
                  <span className="font-bold text-gray-800">#{mintResult.geckoId}</span>
                </div>
              )}

              {/* Lottery results */}
              {mintResult.lotteryWon && (
                <div className="p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 rounded-lg">
                  {mintResult.lotteryWinners?.length > 1 ? (
                    <div className="text-yellow-800 font-bold">
                      🏆 MULTIPLE LOTTERY WINS! 🏆<br/>
                      <span className="text-sm">
                        Winners: {mintResult.lotteryWinners.map(id => `#${id}`).join(', ')}<br/>
                        Total winnings: +{mintResult.totalLotteryWinnings} SOL + {mintResult.totalGeckoz} Geckoz Total!
                      </span>
                    </div>
                  ) : (
                    <span className="text-yellow-800 font-bold">
                      🏆 LOTTERY WINNER: +{mintResult.solReceived} SOL + {mintResult.totalGeckoz} Geckoz Total!
                    </span>
                  )}
                </div>
              )}

              {/* Display first gecko (or only gecko for single mints) */}
              {mintResult.geckoData && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={mintResult.geckoData.image} 
                      alt={mintResult.geckoData.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{mintResult.geckoData.name}</h4>
                      <p className="text-sm text-gray-600">
                        {mintResult.mintedGeckos?.length > 1 
                          ? `First of your ${mintResult.mintedGeckos.length} new geckoz!`
                          : 'Your new geckoz companion!'}
                      </p>
                    </div>
                  </div>
                  {mintResult.mintedGeckos?.length > 1 && (
                    <div className="mt-2 text-xs text-gray-500">
                      + {mintResult.mintedGeckos.length - 1} more geckoz in your wallet!
                    </div>
                  )}
                </div>
              )}

              {/* NFT Delivery Status */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800 mb-2">
                  <span className="font-semibold">🦎 NFT Status:</span>
                </div>
                {mintResult.nftMintResults && mintResult.nftMintResults.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-green-700 font-semibold">
                      ✅ NFTs minted successfully! Check your wallet.
                    </p>
                    {mintResult.nftMintResults.map((nft, index) => (
                      <div key={index} className="text-xs text-gray-700">
                        {nft.success ? (
                          <div className="flex items-center space-x-2">
                            <span>🎨 NFT #{index + 1}:</span>
                            <a 
                              href={`https://solscan.io/token/${nft.mintAddress}${environment.isDevnet ? '?cluster=devnet' : ''}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline font-mono text-xs"
                            >
                              {nft.mintAddress?.slice(0, 8)}...{nft.mintAddress?.slice(-6)}
                            </a>
                          </div>
                        ) : (
                          <p className="text-red-600">❌ NFT #{index + 1} failed: {nft.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs space-y-2">
                    <p className="text-blue-700">
                      Your SOL payment was successful! 🎉
                    </p>
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 font-semibold">⚠️ NFT System Status:</p>
                      <p className="text-yellow-700 text-xs mt-1">
                        Metaplex NFT minting is implemented but requires collection deployment.<br/>
                        Contact admin to complete setup with treasury wallet private key.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Environment Toggle */}
      <EnvironmentToggle 
        currentEnv={environment.environment}
        onEnvChange={environment.changeEnvironment}
      />
      
      {/* Custom Gecko Notifications */}
      <GeckoNotification
        notifications={notifications.notifications}
        onDismiss={notifications.removeNotification}
      />
    </div>
  )
}