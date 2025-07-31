'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { motion } from 'framer-motion'
import { Wallet, Zap, LogOut } from 'lucide-react'

export default function WalletButton() {
  const { connected, disconnect, publicKey } = useWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (connected && publicKey) {
    return (
      <div className="flex items-center space-x-2">
        <motion.div
          className="bg-degen-green text-black px-3 py-2 rounded-lg font-bold text-sm flex items-center space-x-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Zap size={14} />
          <span>{formatAddress(publicKey.toBase58())}</span>
        </motion.div>
        
        <motion.button
          onClick={disconnect}
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Disconnect Wallet"
        >
          <LogOut size={14} />
        </motion.button>
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <WalletMultiButton 
        style={{
          background: '#ff0050',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '8px 16px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <div className="flex items-center space-x-2">
          <Wallet size={16} />
          <span>CONNECT & GET REKT</span>
        </div>
      </WalletMultiButton>
    </motion.div>
  )
}