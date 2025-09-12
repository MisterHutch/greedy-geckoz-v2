'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Calendar, RefreshCw, Eye, EyeOff, BarChart3, Activity, Loader2 } from 'lucide-react'
import Header from './Header'
import WalletButton from './WalletButton'
import FloatingBox from './FloatingBox'
import FullScreenPopup from './FullScreenPopup'
import ResponsiveContainer, { ResponsiveText, ResponsiveGrid, ResponsiveButton } from './ResponsiveContainer'

interface Transaction {
  signature: string
  timestamp: number
  type: string
  amount: number
  tokenSymbol: string
  price: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
}

interface WalletStats {
  totalBalance: number
  totalPnl: number
  totalPnlPercentage: number
  winRate: number
  totalTransactions: number
}

export default function MobileOptimizedDashboard() {
  const { connected, publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('1m')
  const [showBalance, setShowBalance] = useState(false)

  return (
    <>
      <Header />
      
      {/* Loading/Scanning Overlay */}
      <FullScreenPopup isOpen={isScanning} onClose={() => {}}>
        <div className="text-center">
          {/* Responsive loading spinner */}
          <div className="mb-6 sm:mb-8">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1] 
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto text-purple-400" />
            </motion.div>
          </div>
          
          <ResponsiveText variant="h3" className="mb-4 sm:mb-6 text-white">
            Analyzing Your Blockchain History
          </ResponsiveText>
          
          <ResponsiveText variant="body" className="text-purple-200 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            We're diving deep into your transaction history across multiple dimensions to calculate 
            your real P&L. This interdimensional scan might take a moment...
          </ResponsiveText>
          
          <div className="px-4 sm:px-0">
            <FloatingBox
              value={scanProgress}
              label="Current Process"
              color="var(--dimension-2)"
              size="lg"
              variant="glass"
            />
          </div>
          
          {/* Responsive progress bar */}
          <div className="mt-6 sm:mt-8 px-4 sm:px-0">
            <div className="w-full bg-white/10 rounded-full h-2 sm:h-3 backdrop-blur-sm">
              <motion.div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-2 sm:h-3 rounded-full"
                style={{
                  backgroundSize: '200% 100%'
                }}
                initial={{ width: "0%" }}
                animate={{ 
                  width: "100%",
                  backgroundPosition: ['0% 50%', '100% 50%']
                }}
                transition={{ 
                  width: { duration: 8, ease: "easeInOut" },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
              />
            </div>
            
            <ResponsiveText variant="small" className="text-purple-300 mt-3 sm:mt-4">
              Transcending reality to access your financial data...
            </ResponsiveText>
          </div>
        </div>
      </FullScreenPopup>
      
      <ResponsiveContainer padding="md">
        {/* Responsive overlay for readability */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
        
        <div className="relative z-10">
          {/* Page Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="gecko-text-container"
            >
              <ResponsiveText variant="h1" className="mb-2 sm:mb-4 trippy-text neon-glow-multicolor">
                Portfolio Tracker
              </ResponsiveText>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="gecko-text-container"
            >
              <ResponsiveText variant="body" className="text-gray-700 max-w-2xl mx-auto">
                Connect your wallet to see how broke you really are (or aren't, if you're lucky)
              </ResponsiveText>
            </motion.div>
          </div>

          {!connected ? (
            /* Wallet Connection Section - Mobile Optimized */
            <motion.div
              className="max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="gecko-text-container text-center">
                <Wallet className="w-12 h-12 sm:w-16 sm:h-16 text-primary-500 mx-auto mb-4 sm:mb-6" />
                
                <ResponsiveText variant="h4" className="text-gray-900 mb-3 sm:mb-4">
                  Ready for the Truth?
                </ResponsiveText>
                
                <ResponsiveText variant="body" className="text-gray-600 mb-4 sm:mb-6">
                  Connect your Solana wallet to see your P&L and get roasted by our AI gecko
                </ResponsiveText>
                
                <div className="flex justify-center">
                  <WalletButton />
                </div>
                
                {loading && (
                  <div className="mt-4 sm:mt-6">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto animate-spin text-primary-500" />
                    <ResponsiveText variant="small" className="text-gray-500 mt-2">
                      Connecting...
                    </ResponsiveText>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Connected Dashboard - Mobile Optimized */
            <div className="space-y-6 sm:space-y-8">
              {/* Action Buttons - Responsive Grid */}
              <div className="gecko-text-container">
                <ResponsiveGrid 
                  cols={{ mobile: 1, tablet: 2, desktop: 2 }}
                  gap="sm"
                >
                  <ResponsiveButton
                    onClick={() => {/* scan function */}}
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Analyze Portfolio
                      </>
                    )}
                  </ResponsiveButton>
                  
                  <ResponsiveButton
                    onClick={() => setShowBalance(!showBalance)}
                    variant="outline"
                    size="lg"
                    fullWidth
                  >
                    {showBalance ? (
                      <>
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Hide Balance
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Show Balance
                      </>
                    )}
                  </ResponsiveButton>
                </ResponsiveGrid>
              </div>

              {/* Stats Cards - Responsive Grid */}
              {walletStats && (
                <ResponsiveGrid 
                  cols={{ mobile: 1, tablet: 2, desktop: 4 }}
                  gap="md"
                >
                  {/* Total Balance Card */}
                  <motion.div 
                    className="gecko-text-container"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <ResponsiveText variant="small" className="text-gray-600">
                        Total Balance
                      </ResponsiveText>
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    </div>
                    <ResponsiveText variant="h4" className="font-bold">
                      {showBalance ? `$${walletStats.totalBalance.toLocaleString()}` : '••••••'}
                    </ResponsiveText>
                  </motion.div>

                  {/* P&L Card */}
                  <motion.div 
                    className="gecko-text-container"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <ResponsiveText variant="small" className="text-gray-600">
                        Total P&L
                      </ResponsiveText>
                      {walletStats.totalPnl >= 0 ? (
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      )}
                    </div>
                    <ResponsiveText 
                      variant="h4" 
                      className={`font-bold ${walletStats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {showBalance ? (
                        <>
                          ${Math.abs(walletStats.totalPnl).toLocaleString()} 
                          <span className="text-sm ml-1">
                            ({walletStats.totalPnlPercentage.toFixed(2)}%)
                          </span>
                        </>
                      ) : '••••••'}
                    </ResponsiveText>
                  </motion.div>

                  {/* Win Rate Card */}
                  <motion.div 
                    className="gecko-text-container"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <ResponsiveText variant="small" className="text-gray-600">
                        Win Rate
                      </ResponsiveText>
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    </div>
                    <ResponsiveText variant="h4" className="font-bold text-blue-600">
                      {walletStats.winRate.toFixed(1)}%
                    </ResponsiveText>
                  </motion.div>

                  {/* Transactions Card */}
                  <motion.div 
                    className="gecko-text-container"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <ResponsiveText variant="small" className="text-gray-600">
                        Transactions
                      </ResponsiveText>
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                    </div>
                    <ResponsiveText variant="h4" className="font-bold text-purple-600">
                      {walletStats.totalTransactions.toLocaleString()}
                    </ResponsiveText>
                  </motion.div>
                </ResponsiveGrid>
              )}

              {/* Period Selection - Mobile Optimized */}
              <div className="gecko-text-container">
                <ResponsiveText variant="h4" className="mb-3 sm:mb-4">
                  Time Period
                </ResponsiveText>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {['1d', '1w', '1m', '3m', '6m', '1y'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`
                        px-3 py-2 text-sm sm:text-base rounded-lg transition-all duration-200
                        ${selectedPeriod === period 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                        touch-manipulation active:scale-95
                      `}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions List - Mobile Optimized */}
              {transactions.length > 0 && (
                <div className="gecko-text-container">
                  <ResponsiveText variant="h4" className="mb-3 sm:mb-4">
                    Recent Transactions
                  </ResponsiveText>
                  
                  <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                    {transactions.slice(0, 10).map((tx, index) => (
                      <motion.div
                        key={tx.signature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-lg p-3 sm:p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1">
                            <ResponsiveText variant="small" className="font-semibold">
                              {tx.tokenSymbol}
                            </ResponsiveText>
                            <ResponsiveText variant="small" className="text-gray-500">
                              {new Date(tx.timestamp * 1000).toLocaleDateString()}
                            </ResponsiveText>
                          </div>
                          
                          <div className="text-right">
                            <ResponsiveText 
                              variant="small" 
                              className={`font-bold ${tx.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              ${Math.abs(tx.pnl).toFixed(2)}
                            </ResponsiveText>
                            <ResponsiveText variant="small" className="text-gray-500">
                              ({tx.pnlPercentage.toFixed(1)}%)
                            </ResponsiveText>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </>
  )
}
