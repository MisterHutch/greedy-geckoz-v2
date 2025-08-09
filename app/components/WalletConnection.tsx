'use client'

import { useState, useCallback } from 'react'
import { Wallet, RefreshCw, AlertCircle } from 'lucide-react'

// Mock wallet connection for demo purposes
// In production, this would integrate with @solana/wallet-adapter-react

interface WalletConnectionProps {
  onConnect: (address: string) => void
  onDisconnect: () => void
  isConnected: boolean
  walletAddress: string | null
}

export default function WalletConnection({ 
  onConnect, 
  onDisconnect, 
  isConnected, 
  walletAddress 
}: WalletConnectionProps) {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    setError(null)

    try {
      // Simulate wallet connection process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful connection
      if (Math.random() > 0.1) { // 90% success rate for demo
        const mockAddress = generateMockWalletAddress()
        onConnect(mockAddress)
      } else {
        throw new Error('User rejected the connection')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }, [onConnect])

  const handleDisconnect = useCallback(() => {
    onDisconnect()
    setError(null)
  }, [onDisconnect])

  // Generate a mock Solana wallet address for demo
  const generateMockWalletAddress = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'
    let result = ''
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const formatWalletAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-lg border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Connected Wallet</p>
            <p className="font-mono font-bold text-green-700">
              {formatWalletAddress(walletAddress)}
            </p>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-red-500 hover:text-red-600 font-medium text-sm"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">Connection Failed</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="p-6 bg-white rounded-lg shadow-lg border text-center">
        <Wallet className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 mb-6">
          Connect your Solana wallet to view your portfolio performance and get roasted by our gecko
        </p>
        
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {connecting ? (
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

        <div className="mt-4 text-xs text-gray-500">
          <p>Supports: Phantom, Solflare, and other Solana wallets</p>
        </div>
      </div>
    </div>
  )
}