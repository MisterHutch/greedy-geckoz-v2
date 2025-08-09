'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Calendar, RefreshCw, Eye, EyeOff, BarChart3, Activity } from 'lucide-react'
import Header from '../components/Header'
import PnLChart from '../components/PnLChart'

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
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('1m')
  const [showBalance, setShowBalance] = useState(false)
  const [chartData, setChartData] = useState<DataPoint[]>([])

  const periods = [
    { value: '1d', label: '24H', days: 1 },
    { value: '1w', label: '1W', days: 7 },
    { value: '1m', label: '1M', days: 30 },
    { value: '6m', label: '6M', days: 180 },
    { value: '12m', label: '1Y', days: 365 }
  ]

  // Mock wallet connection
  const handleConnectWallet = async () => {
    setLoading(true)
    // Simulate wallet connection
    setTimeout(() => {
      setConnected(true)
      setWalletAddress('7xKx...9pQe')
      generateMockData()
      setLoading(false)
    }, 2000)
  }

  const handleDisconnectWallet = () => {
    setConnected(false)
    setWalletAddress('')
    setTransactions([])
    setWalletStats(null)
  }

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
    generateChartData(selectedPeriod)
  }

  // Generate chart data for the selected time period
  const generateChartData = (period: string) => {
    const periodConfig = periods.find(p => p.value === period) || periods[2] // Default to 1m
    const days = periodConfig.days
    
    const points: DataPoint[] = []
    let cumulative = 0
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Generate realistic daily P&L with some volatility
      const dailyChange = (Math.random() - 0.45) * (200 + Math.random() * 300) // Bias toward losses, realistic volatility
      cumulative += dailyChange
      
      points.push({
        date: date.toISOString().split('T')[0],
        value: dailyChange,
        cumulative
      })
    }
    
    setChartData(points)
  }

  // Update chart data when period changes
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (connected) {
      generateChartData(period)
    }
  }

  const getSassyMessage = (pnl: number, winRate: number) => {
    if (pnl > 1000) return "Holy gecko! You're actually making money? 🦎💎"
    if (pnl > 100) return "Not terrible! Your losses could be worse 📈"
    if (pnl > 0) return "Congrats on breaking even... barely 😅"
    if (pnl > -100) return "Only down a little! Could be worse 📉"
    if (pnl > -1000) return "Oof, someone's been buying the top 💸"
    return "RIP portfolio. Time to sell everything and buy geckos? 🪦"
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
    <div className="min-h-screen psychedelic-gradient-hero fly-cursor">
      <Header />
      
      <main className="relative py-8 px-4">
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-white/70"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4 trippy-text neon-glow-multicolor"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Portfolio Tracker
            </motion.h1>
            <motion.p
              className="text-xl text-gray-700 max-w-2xl mx-auto"
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
                <button
                  onClick={handleConnectWallet}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      <span>Connect Wallet (If You Dare)</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            /* Dashboard Content */
            <div className="space-y-8">
              {/* Wallet Info & Disconnect */}
              <motion.div
                className="flex justify-between items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Connected Wallet</p>
                    <p className="font-mono font-bold">{walletAddress}</p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Disconnect
                </button>
              </motion.div>

              {/* Stats Cards */}
              {walletStats && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">Portfolio Value</h3>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {showBalance ? formatCurrency(walletStats.totalBalance) : '****'}
                    </p>
                  </div>

                  <div className="card">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total P&L</h3>
                    <p className={`text-2xl font-bold ${getPerformanceColor(walletStats.totalPnl)}`}>
                      {showBalance ? formatCurrency(walletStats.totalPnl) : '****'}
                    </p>
                    <p className={`text-sm ${getPerformanceColor(walletStats.totalPnlPercentage)}`}>
                      {walletStats.totalPnlPercentage.toFixed(2)}%
                    </p>
                  </div>

                  <div className="card">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Win Rate</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {walletStats.winRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.floor(walletStats.winRate * walletStats.totalTransactions / 100)} wins
                    </p>
                  </div>

                  <div className="card">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Trades</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {walletStats.totalTransactions}
                    </p>
                    <p className="text-sm text-gray-500">transactions</p>
                  </div>
                </motion.div>
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
                  <div className="flex space-x-2">
                    {periods.map((period) => (
                      <button
                        key={period.value}
                        onClick={() => handlePeriodChange(period.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
  )
}