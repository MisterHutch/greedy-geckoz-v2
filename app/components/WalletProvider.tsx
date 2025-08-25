'use client'

import { ReactNode, useMemo, useState } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets'

// CSS styles are imported in layout.tsx to avoid HMR issues

interface Props {
  children: ReactNode
}

export default function WalletContextProvider({ children }: Props) {
  // Dynamic network based on environment
  const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet) // Default to devnet for testing
  
  const endpoint = useMemo(() => {
    // Check environment from localStorage
    const env = typeof window !== 'undefined' ? localStorage.getItem('gecko-environment') : null
    const currentNetwork = env === 'mainnet' ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet
    
    if (currentNetwork !== network) {
      setNetwork(currentNetwork)
    }
    
    return clusterApiUrl(currentNetwork)
  }, [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    [network]
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}