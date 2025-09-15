'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GeckoNotification, { useGeckoNotifications } from '../components/GeckoNotification'
import { useWallet } from '@solana/wallet-adapter-react'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Calendar, RefreshCw, Eye, EyeOff, BarChart3, Activity, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import PnLChart from '../components/PnLChart'
import WalletButton from '../components/WalletButton'
import FloatingBox from '../components/FloatingBox'
import FullScreenPopup from '../components/FullScreenPopup'
import { GatedAccess } from '../components/GatedAccess'
import { solscanAPI } from '../../lib/solscan-api'

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

interface DataPoint {
  date: string
  value: number
  cumulative: number
}

export default function Dashboard() {
  const { connected, publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('6h')
  const notifications = useGeckoNotifications()
  const [showBalance, setShowBalance] = useState(false)
  const [chartData, setChartData] = useState<DataPoint[]>([])

  const periods = [
    { value: '1h', label: '1H', minutes: 60 },
    { value: '6h', label: '6H', minutes: 360 },
    { value: '12h', label: '12H', hours: 12 },
    { value: '24h', label: '24H', hours: 24 },
    { value: '48h', label: '48H', hours: 48 },
    { value: '1w', label: '1W', days: 7 },
    { value: '1m', label: '1M', days: 30 },
    { value: '1y', label: '1Y', days: 365 },
    { value: 'lt', label: 'LT', days: 3650 },
  ]

  // Load data when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      loadWalletData(selectedPeriod)
    } else {
      setTransactions([])
      setWalletStats(null)
      setChartData([])
    }
  }, [connected, publicKey, selectedPeriod]) // eslint-disable-line react-hooks/exhaustive-deps

  // Generate mock transaction data for demo
  const generateMockData = () => {
    const mockTransactions: Transaction[] = []
    const tokens = ['SOL', 'BONK', 'WIF', 'GECKO', 'PEPE', 'DOGE']
    
    for (let i = 0; i < 50; i++) {
      const token = tokens[Math.floor(Math.random() * tokens.length)]
      const type = Math.random() > 0.5 ? 'buy' : 'sell'
      const amount = Math.random() * 1000 + 10
      const price = Math.random() * 200 + 1
      const currentPrice = price * (0.5 + Math.random() * 1.5) // -50% to +50% from original
      const pnl = (currentPrice - price) * amount
      const pnlPercentage = ((currentPrice - price) / price) * 100
      
      mockTransactions.push({
        signature: `mock-tx-${i}`,
        timestamp: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000),
        type,
        amount,
        tokenSymbol: token,
        price,
        currentPrice,
        pnl,
        pnlPercentage
      })
    }

    setTransactions(mockTransactions)
    
    // Calculate stats
    const totalPnl = mockTransactions.reduce((sum, tx) => sum + tx.pnl, 0)
    const wins = mockTransactions.filter(tx => tx.pnl > 0).length
    const winRate = (wins / mockTransactions.length) * 100
    
    setWalletStats({
      totalBalance: 1234.56,
      totalPnl,
      totalPnlPercentage: (totalPnl / 10000) * 100,
      winRate,
      totalTransactions: mockTransactions.length
    })

    // Generate chart data based on selected period
    generateDemoChartData(selectedPeriod)
  }

  // Load real wallet data and generate chart
  const loadWalletData = async (period: string) => {
    if (!publicKey || !connected) return
    
    setIsScanning(true)
    setLoading(true)
    
    try {
      const walletAddress = publicKey.toString()
      const periodConfig = periods.find(p => p.value === period) || periods[1]
      
      setScanProgress('Connecting to blockchain...')
      await new Promise(resolve => setTimeout(resolve, 800)) // UX delay
      
      setScanProgress('Scanning transaction history...')
      const days = (periodConfig as any).days || ((periodConfig as any).hours || ((periodConfig as any).minutes || 0) / 60) / 24
      const walletData = await solscanAPI.calculateWalletPnL(walletAddress, days)
      
      setScanProgress('Processing transaction data...')
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setScanProgress('Generating charts and analytics...')
      
      // Convert transactions to our format
      const convertedTransactions: Transaction[] = walletData.transactions.map(tx => ({
        signature: tx.signature,
        timestamp: tx.timestamp,
        type: tx.type,
        amount: tx.amount,
        tokenSymbol: tx.tokenSymbol,
        price: tx.price,
        currentPrice: tx.price, // Simplified for now
        pnl: 0, // Will be calculated
        pnlPercentage: 0 // Will be calculated
      }))
      
      setTransactions(convertedTransactions)
      setWalletStats({
        totalBalance: walletData.summary.totalInvested || 0,
        totalPnl: walletData.totalPnl,
        totalPnlPercentage: walletData.totalPnlPercentage,
        winRate: walletData.winRate,
        totalTransactions: walletData.transactions.length
      })
      
      // Generate chart data from real transactions
      generateChartDataFromTransactions(walletData.transactions, periodConfig.days)
      
      setScanProgress('Analysis complete!')
      await new Promise(resolve => setTimeout(resolve, 400))
      
    } catch (error) {
      console.error('Error loading wallet data:', error)
      setScanProgress('Error: Could not scan wallet. Using demo data.')
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Fallback to demo data
      generateDemoChartData(period)
    } finally {
      setIsScanning(false)
      setLoading(false)
    }
  }



  // Generate chart data from real transactions
  const generateChartDataFromTransactions = (txs: any[], days: number) => {
    const points: DataPoint[] = []
    const dailyPnL: Record<string, number> = {}
    
    // Initialize daily buckets
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyPnL[dateStr] = 0
    }
    
    // Aggregate transactions by day
    txs.forEach(tx => {
      const txDate = new Date(tx.timestamp).toISOString().split('T')[0]
      if (dailyPnL.hasOwnProperty(txDate)) {
        const pnl = tx.type === 'sell' ? tx.solAmount : -tx.solAmount
        dailyPnL[txDate] += pnl
      }
    })
    
    // Convert to chart data points
    let cumulative = 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dailyChange = dailyPnL[dateStr]
      cumulative += dailyChange
      
      points.push({
        date: dateStr,
        value: dailyChange,
        cumulative
      })
    }
    
    setChartData(points)
  }

  // Fallback demo data generation
  const generateDemoChartData = (period: string) => {
    const periodConfig = periods.find(p => p.value === period) || periods[2]
    const days = periodConfig.days
    
    const points: DataPoint[] = []
    let cumulative = 0
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const dailyChange = (Math.random() - 0.45) * (200 + Math.random() * 300)
      cumulative += dailyChange
      
      points.push({
        date: date.toISOString().split('T')[0],
        value: dailyChange,
        cumulative
      })
    }
    
    setChartData(points)
  }

  // Update chart data when period changes (with deep-sync notice)
  const handlePeriodChange = (period: string) => {
    if (['1w', '1m', '1y', 'lt'].includes(period)) {
      notifications.addNotification(
        'info',
        'Deep Sync Requested',
        'Fetching 1W+ of activity may take longer depending on your transaction count.'
      )
    }
    setSelectedPeriod(period)
    if (connected && publicKey) {
      loadWalletData(period)
    }
  }

  const getSassyMessage = (pnl: number, winRate: number) => {
    if (pnl > 1000) return "Holy gecko! You're actually making money? 🦎💎"
    if (pnl > 100) return "Not terrible! Your losses could be worse 📈"
    if (pnl > 0) return "Congrats on breaking even... barely 😅"
    if (pnl > -100) return "Only down a little! Could be worse 📉"
    if (pnl > -1000) return "Oof, someone's been buying the top 💸"
    return "RIP portfolio. Time to sell everything and buy geckoz? 🪦"
  }

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'text-green-500'
    if (value < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <GatedAccess>
      <div className="min-h-screen psychedelic-gradient-hero fly-cursor">
        <GeckoNotification 
          notifications={notifications.notifications} 
          onDismiss={notifications.removeNotification} 
        />
        <Header />
      
      {/* Wallet Scanning Full-Screen Popup */}
      <FullScreenPopup
        isOpen={isScanning}
        onClose={() => {}} // Cannot close while scanning
        title="Scanning Your Wallet"
        variant="cosmic"
      >
        <div className="text-center py-8">
          <div className="mb-8">
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
              <Loader2 className="w-20 h-20 mx-auto text-purple-400" />
            </motion.div>
          </div>
          
          <h3 className="text-3xl font-bold mb-6 text-white">
            Analyzing Your Blockchain History
          </h3>
          
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            We're diving deep into your transaction history across multiple dimensions to calculate 
            your real P&L. This interdimensional scan might take a moment...
          </p>
          
          <FloatingBox
            value={scanProgress}
            label="Current Process"
            color="var(--dimension-2)"
            size="lg"
            variant="glass"
          />
          
          <div className="mt-8">
            <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
              <motion.div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-3 rounded-full"
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
            
            <p className="text-sm text-purple-300 mt-4">
              Transcending reality to access your financial data...
            </p>
          </div>
        </div>
      </FullScreenPopup>
      
      <main className="relative py-4 sm:py-6 lg:py-8 px-3 sm:px-4">
        {/* Overlay for readability (ignore pointer events) */}
        <div className="absolute inset-0 bg-white/70 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <motion.h1
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 trippy-text neon-glow-multicolor px-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Portfolio Tracker
            </motion.h1>
            <motion.p
              className="text-sm sm:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Connect your wallet to see how broke you really are (or aren't, if you're lucky)
            </motion.p>
          </div>

          {!connected ? (
            /* Wallet Connection Section */
            <motion.div
              className="max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card text-center">
                <Wallet className="w-16 h-16 text-primary-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready for the Truth?
                </h2>
                <p className="text-gray-600 mb-6">
                  Connect your Solana wallet to see your P&L and get roasted by our AI gecko
                </p>
                <div className="flex justify-center">
                  <WalletButton />
                </div>
                {loading && (
                  <div className="mt-4 flex items-center justify-center space-x-2 text-primary-600">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Loading your financial disasters...</span>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Dashboard Content */
            <div className="space-y-8">
              {/* Wallet Info & Disconnect */}
              <motion.div
                className="flex flex-wrap gap-3 justify-between items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Connected Wallet</p>
                    <p className="font-mono font-bold truncate max-w-[60vw] sm:max-w-none">
                      {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="ml-auto">
                  <WalletButton />
                </div>
              </motion.div>

              {/* Floating Stats Boxes */}
              {walletStats && (
                <div className="floating-box-grid mb-12">
                  <FloatingBox
                    value={showBalance ? formatCurrency(walletStats.totalBalance) : '••••••'}
                    label="Portfolio Value"
                    color="var(--reality-primary)"
                    index={0}
                    variant="glass"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center flex-1">
                        <div 
                          style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'var(--reality-primary)',
                            marginBottom: '0.5rem',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                          }}
                        >
                          {showBalance ? formatCurrency(walletStats.totalBalance) : '••••••'}
                        </div>
                        <div 
                          style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.875rem',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Portfolio Value
                        </div>
                      </div>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                      >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FloatingBox>

                  <FloatingBox
                    value={showBalance ? formatCurrency(walletStats.totalPnl) : '••••••'}
                    label="Total P&L"
                    color={walletStats.totalPnl >= 0 ? 'var(--dimension-3)' : 'var(--dimension-1)'}
                    index={1}
                    variant="neon"
                  >
                    <div className="text-center">
                      <div 
                        style={{
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: walletStats.totalPnl >= 0 ? 'var(--dimension-3)' : 'var(--dimension-1)',
                          marginBottom: '0.25rem',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}
                      >
                        {showBalance ? formatCurrency(walletStats.totalPnl) : '••••••'}
                      </div>
                      <div 
                        style={{
                          color: walletStats.totalPnl >= 0 ? 'rgba(6, 255, 165, 0.8)' : 'rgba(255, 0, 110, 0.8)',
                          fontSize: '0.875rem',
                          marginBottom: '0.25rem'
                        }}
                      >
                        {walletStats.totalPnlPercentage.toFixed(2)}%
                      </div>
                      <div 
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Total P&L
                      </div>
                    </div>
                  </FloatingBox>

                  <FloatingBox
                    value={`${walletStats.winRate.toFixed(1)}%`}
                    label="Win Rate"
                    color={walletStats.winRate > 50 ? 'var(--dimension-3)' : 'var(--dimension-2)'}
                    index={2}
                    variant="organic"
                  >
                    <div className="text-center">
                      <div 
                        style={{
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: walletStats.winRate > 50 ? 'var(--dimension-3)' : 'var(--dimension-2)',
                          marginBottom: '0.25rem',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}
                      >
                        {walletStats.winRate.toFixed(1)}%
                      </div>
                      <div 
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.75rem',
                          marginBottom: '0.25rem'
                        }}
                      >
                        {Math.floor(walletStats.winRate * walletStats.totalTransactions / 100)} wins
                      </div>
                      <div 
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Win Rate
                      </div>
                    </div>
                  </FloatingBox>

                  <FloatingBox
                    value={walletStats.totalTransactions}
                    label="Total Trades"
                    color="var(--dimension-4)"
                    index={3}
                    variant="glass"
                  />
                </div>
              )}

              {/* Sassy AI Commentary */}
              {walletStats && (
                <motion.div
                  className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-4xl">🦎</div>
                    <div>
                      <h3 className="font-bold text-purple-900 mb-2">Gecko's Honest Opinion:</h3>
                      <p className="text-purple-700 italic">
                        {getSassyMessage(walletStats.totalPnl, walletStats.winRate)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Time Period Selector */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white rounded-xl p-2 shadow-lg border">
                  <div className="flex flex-wrap gap-2">
                    {periods.map((period) => (
                      <button
                        key={period.value}
                        onClick={() => handlePeriodChange(period.value)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                          selectedPeriod === period.value
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* P&L Chart */}
              {walletStats && chartData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <PnLChart 
                    data={chartData}
                    period={periods.find(p => p.value === selectedPeriod)?.label || selectedPeriod}
                    totalPnl={walletStats.totalPnl}
                  />
                </motion.div>
              )}

              {/* Transactions Table */}
              <motion.div
                className="card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Activity className="w-5 h-5" />
                    <span>Last {selectedPeriod}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Token</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Entry Price</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Current Price</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 20).map((tx) => (
                        <motion.tr
                          key={tx.signature}
                          className="border-b border-gray-100 hover:bg-gray-50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(tx.timestamp)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tx.type === 'buy' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {tx.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{tx.tokenSymbol}</td>
                          <td className="py-3 px-4 text-right">{tx.amount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">${tx.price.toFixed(4)}</td>
                          <td className="py-3 px-4 text-right">${tx.currentPrice.toFixed(4)}</td>
                          <td className={`py-3 px-4 text-right font-medium ${getPerformanceColor(tx.pnl)}`}>
                            {formatCurrency(tx.pnl)}
                            <div className="text-xs">
                              ({tx.pnlPercentage.toFixed(1)}%)
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      </div>
    </GatedAccess>
  )
}
