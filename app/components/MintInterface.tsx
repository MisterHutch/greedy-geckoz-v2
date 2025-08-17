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
    availableGeckos?: number
  }
}

export default function MintInterface({ mintStats }: MintInterfaceProps) {
  const wallet = useWallet()
  const { publicKey, connected } = wallet
  const [isMinting, setIsMinting] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [mintResult, setMintResult] = useState<any>(null)
  const [showLotteryWin, setShowLotteryWin] = useState(false)
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

    if ((realMintStats.availableGeckos || 0) === 0) {
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
        
        if (result.lotteryWon) {
          setShowLotteryWin(true)
          setTimeout(() => setShowLotteryWin(false), 10000)
          
          if (result.lotteryWinners && result.lotteryWinners.length > 1) {
            // Multiple lottery wins in bulk mint
            notifications.addNotification(
              'success',
              `🎉 MULTIPLE LOTTERY WINS! 🎉`,
              `You won ${result.lotteryWinners.length} lotteries! +${result.totalLotteryWinnings} SOL + ${result.totalGeckos} total geckos!`,
              8000
            )
          } else {
            notifications.showLotteryWin(result.totalGeckos || 3, result.solReceived || 0.98)
          }
        } else {
          if (mintQuantity > 1) {
            notifications.addNotification(
              'success',
              `🦎 Successfully minted ${mintQuantity} geckos!`,
              `Your ${mintQuantity} geckos have been added to your wallet. No lottery wins this time, but hey, you've got some sweet JPEGs!`,
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
  const soldOut = (realMintStats.availableGeckos || 0) === 0
  const maxQuantity = Math.min(10, realMintStats.availableGeckos || 0) // Max 10 or available geckos

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
                +{mintResult.solReceived?.toFixed(4)} SOL + {mintResult.totalGeckos} Geckos!
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
              How many geckos? (Each has individual lottery chance!)
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
                    {num} gecko{num > 1 ? 's' : ''}
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
            {mintQuantity === 1 ? 'Mint Price' : `Total Cost (${mintQuantity} geckos)`}
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
            Available Geckos: {realMintStats.availableGeckos || 'Loading...'}
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
              <p className="text-red-700 font-bold">SOLD OUT! All geckos have found new homes 🦎 (You snooze, you lose!)</p>
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
                        ? 'Minting Your Gecko...' 
                        : `Minting ${mintQuantity} Geckos...`}
                    </span>
                  </div>
                ) : !canAfford ? (
                  `Need ${totalCost.toFixed(4)} SOL (Go get more!)`
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🦎</span>
                    <span>
                      {mintQuantity === 1 
                        ? `Mint Gecko for ${MINT_CONFIG.PRICE_SOL} SOL`
                        : `Mint ${mintQuantity} Geckos for ${totalCost.toFixed(4)} SOL`}
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
                🚨 LOTTERY ALERT: {lotteryWinnersLeft} more winners can still win {MINT_CONFIG.LOTTERY_PRIZE_SOL} SOL + 3 geckos each! 
                {mintQuantity > 1 && ` With ${mintQuantity} geckos, you have ${mintQuantity} chances to win!`}
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
                ? `Bulk Mint Successful! (${mintResult.mintedGeckos.length} geckos)`
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
                    <span className="text-gray-600">Geckos Minted:</span>
                    <span className="font-bold text-gray-800">{mintResult.mintedGeckos.length}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Gecko IDs: {mintResult.mintedGeckos.map(g => `#${g.id}`).join(', ')}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Gecko ID:</span>
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
                        Total winnings: +{mintResult.totalLotteryWinnings} SOL + {mintResult.totalGeckos} Geckos Total!
                      </span>
                    </div>
                  ) : (
                    <span className="text-yellow-800 font-bold">
                      🏆 LOTTERY WINNER: +{mintResult.solReceived} SOL + {mintResult.totalGeckos} Geckos Total!
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
                          ? `First of your ${mintResult.mintedGeckos.length} new geckos!`
                          : 'Your new gecko companion!'}
                      </p>
                    </div>
                  </div>
                  {mintResult.mintedGeckos?.length > 1 && (
                    <div className="mt-2 text-xs text-gray-500">
                      + {mintResult.mintedGeckos.length - 1} more gecko{mintResult.mintedGeckos.length > 2 ? 's' : ''} in your wallet!
                    </div>
                  )}
                </div>
              )}

              {/* NFT Delivery Notice */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800 mb-2">
                  <span className="font-semibold">📦 NFT Delivery Status:</span>
                </div>
                <p className="text-xs text-blue-700">
                  Your SOL payment has been processed successfully! 🎉<br/>
                  <strong>NFT minting is currently in development.</strong> Your geckos will be delivered to your wallet once the Metaplex NFT minting system is implemented.
                </p>
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