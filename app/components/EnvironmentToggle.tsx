'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Globe } from 'lucide-react'

type Environment = 'mainnet' | 'devnet'

interface EnvironmentToggleProps {
  currentEnv: Environment
  onEnvChange: (env: Environment) => void
}

export default function EnvironmentToggle({ currentEnv, onEnvChange }: EnvironmentToggleProps) {
  const [showToggle, setShowToggle] = useState(false)

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Toggle with Ctrl+Shift+E
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault()
        setShowToggle(prev => !prev)
      }
      
      // Quick toggle with Ctrl+Shift+D (for devnet)
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault()
        const newEnv = currentEnv === 'mainnet' ? 'devnet' : 'mainnet'
        onEnvChange(newEnv)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentEnv, onEnvChange])

  return (
    <>
      {/* Environment Indicator */}
      <motion.div
        className={`env-indicator ${currentEnv}`}
        onClick={() => setShowToggle(!showToggle)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Click or press Ctrl+Shift+E to toggle environment"
      >
        {currentEnv === 'mainnet' ? (
          <div className="flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>MAINNET</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>DEVNET</span>
          </div>
        )}
      </motion.div>

      {/* Environment Toggle Panel */}
      {showToggle && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-16 left-4 z-[9998] bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-4 min-w-[200px]"
        >
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Environment Settings</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                onEnvChange('mainnet')
                setShowToggle(false)
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                currentEnv === 'mainnet'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <div>
                  <div className="font-medium">Mainnet</div>
                  <div className="text-xs opacity-75">Real SOL, Real Money</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                onEnvChange('devnet')
                setShowToggle(false)
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                currentEnv === 'devnet'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <div>
                  <div className="font-medium">Devnet</div>
                  <div className="text-xs opacity-75">Free SOL, Test Mode</div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div>Hotkeys:</div>
              <div>Ctrl+Shift+E: Toggle panel</div>
              <div>Ctrl+Shift+D: Quick switch</div>
            </div>
          </div>

          <button
            onClick={() => setShowToggle(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Click outside to close */}
      {showToggle && (
        <div
          className="fixed inset-0 z-[9997]"
          onClick={() => setShowToggle(false)}
        />
      )}
    </>
  )
}

// Hook for managing environment state
export const useEnvironment = () => {
  const [environment, setEnvironment] = useState<Environment>('devnet') // Default to devnet for testing

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('gecko-environment')
    if (saved === 'mainnet' || saved === 'devnet') {
      setEnvironment(saved as Environment)
    }
  }, [])

  const changeEnvironment = (env: Environment) => {
    setEnvironment(env)
    localStorage.setItem('gecko-environment', env)
    
    // Show notification about environment change
    console.log(`🦎 Environment switched to ${env.toUpperCase()}`)
  }

  const getEndpoint = () => {
    return environment === 'mainnet'
      ? process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com'
  }

  const getTreasuryAddress = () => {
    // Use a valid Solana mainnet address (this is the Solana Foundation's address, replace with yours)
    return environment === 'mainnet'
      ? process.env.NEXT_PUBLIC_TREASURY_WALLET || '3vZ7k6WqYBBEdBYLjp1Vw7TXRDNcAWvH8vGkqcEA3hYR'
      : '3vZ7k6WqYBBEdBYLjp1Vw7TXRDNcAWvH8vGkqcEA3hYR' // Same address for testing
  }

  return {
    environment,
    changeEnvironment,
    getEndpoint,
    getTreasuryAddress,
    isMainnet: environment === 'mainnet',
    isDevnet: environment === 'devnet'
  }
}