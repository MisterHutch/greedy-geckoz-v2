'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Mock wallet hook for demo purposes
const useWallet = () => ({
  publicKey: null,
  connected: false,
  signTransaction: null
})
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Trophy, Zap, Clock, DollarSign, Users, Wallet, ExternalLink } from 'lucide-react'
import { GeckoMintProgram, MINT_CONFIG, validateMintConditions } from '../../lib/solana/mint-program'

interface MintInterfaceProps {
  mintStats: {
    totalMinted: number
    totalSupply: number
    lotteryWinnersCount: number
    lotteryWinnersRemaining: number
    lotteryPool: number
  }
}

export default function MintInterface({ mintStats }: MintInterfaceProps) {
  const { publicKey, connected, signTransaction } = useWallet()
  const [isMinting, setIsMinting] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [mintResult, setMintResult] = useState<any>(null)
  const [showLotteryWin, setShowLotteryWin] = useState(false)
  const [mintProgram, setMintProgram] = useState<GeckoMintProgram | null>(null)
  const [quantity, setQuantity] = useState(1)

  const lotteryWinnersLeft = mintStats.lotteryWinnersRemaining
  const lotteryProgress = ((5 - lotteryWinnersLeft) / 5) * 100

  // Initialize connection and program
  useEffect(() => {
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com')
    const program = new GeckoMintProgram(connection)
    setMintProgram(program)
  }, [])

  // Load user balance
  useEffect(() => {
    if (!publicKey || !mintProgram) return

    const loadBalance = async () => {
      try {
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com')
        const balance = await connection.getBalance(publicKey)
        setUserBalance(balance / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error('Failed to load balance:', error)
      }
    }

    loadBalance()
  }, [publicKey, mintProgram])

  const handleMint = async () => {
    if (!connected || !publicKey || !mintProgram) {
      alert('Please connect your wallet first!')
      return
    }

    const validation = validateMintConditions(mintStats.totalMinted, userBalance, quantity)
    if (!validation.canMint) {
      alert(validation.reason)
      return
    }

    setIsMinting(true)
    try {
      const results = []
      
      for (let i = 0; i < quantity; i++) {
        const geckoNumber = mintStats.totalMinted + i + 1
        const metadata = {
          name: `Greedy Gecko #${geckoNumber}`,
          symbol: 'GECKO',
          description: 'An entrepreneurial gecko ready to dominate Solana',
          image: `https://your-ipfs-gateway.com/gecko-${geckoNumber}.png`,
          attributes: [
            { trait_type: 'Background', value: 'Cosmic Green' },
            { trait_type: 'Eyes', value: 'Diamond Vision' },
            { trait_type: 'Attitude', value: 'Greedy' },
            { trait_type: 'Rarity', value: 'Epic' }
          ],
          properties: {
            files: [
              {
                uri: `https://your-ipfs-gateway.com/gecko-${geckoNumber}.png`,
                type: 'image/png'
              }
            ],
            category: 'image'
          }
        }

        const result = await mintProgram.mintGecko(publicKey, metadata, geckoNumber)
        results.push(result)

        if (result.lotteryWon) {
          setShowLotteryWin(true)
          setTimeout(() => setShowLotteryWin(false), 8000)
        }
      }

      setMintResult(results[results.length - 1]) // Show last mint result

    } catch (error) {
      console.error('Mint failed:', error)
      alert('Mint failed! Check console for details.')
    } finally {
      setIsMinting(false)
    }
  }

  const totalCost = MINT_CONFIG.PRICE * quantity
  const canAfford = userBalance >= totalCost
  const soldOut = mintStats.totalMinted >= mintStats.totalSupply

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
                +{mintResult.lotteryAmount?.toFixed(4)} SOL
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
              {mintStats.totalMinted.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Minted</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {MINT_CONFIG.PRICE} SOL
            </div>
            <div className="text-sm text-gray-600">Each</div>
          </div>

          <div className="text-center p-4 bg-primary-50 rounded-lg lottery-glow">
            <Trophy className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-primary-600">
              ~{mintStats.lotteryPool} SOL
            </div>
            <div className="text-sm text-gray-600">Prize Pool</div>
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
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How Many Bad Decisions? (Max 10)
          </label>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 transition-colors"
            >
              +
            </button>
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            Total: {totalCost.toFixed(4)} SOL
          </div>
        </div>

        {/* Mint Button */}
        <div className="text-center mb-6">
          {!connected ? (
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">Connect your wallet to make questionable financial decisions</p>
              <button className="btn-outline">Connect Wallet (Do It)</button>
            </div>
          ) : soldOut ? (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700 font-bold">SOLD OUT! All 2,222 overpriced JPEGs have found new homes 🦎 (You snooze, you lose!)</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Your balance: {userBalance.toFixed(4)} SOL (not much, but we'll take it)
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
                    <span>Minting {quantity} Gecko{quantity > 1 ? 's' : ''}...</span>
                  </div>
                ) : !canAfford ? (
                  `Insufficient SOL (Need ${totalCost.toFixed(4)} SOL)`
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🦎</span>
                    <span>Buy {quantity} Overpriced JPEG{quantity > 1 ? 's' : ''}</span>
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
                🚨 LOTTERY ALERT: {lotteryWinnersLeft} more winners can still win ~{mintStats.lotteryPool} SOL each! (Could be you... probably not, but could be!)
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
              🎉 Mint Successful!
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">NFT Address:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-gray-800">
                    {mintResult.mintAddress.slice(0, 8)}...{mintResult.mintAddress.slice(-8)}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {mintResult.lotteryWon && (
                <div className="p-2 bg-primary-100 border border-primary-300 rounded">
                  <span className="text-primary-800 font-bold">
                    🏆 LOTTERY WON: +{mintResult.lotteryAmount} SOL!
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}