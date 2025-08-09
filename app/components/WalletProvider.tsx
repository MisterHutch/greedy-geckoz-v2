'use client'

import { ReactNode } from 'react'

// Mock WalletProvider for demo purposes
// This will be replaced with actual Solana wallet adapter when ready for production

interface Props {
  children: ReactNode
}

export default function WalletContextProvider({ children }: Props) {
  return <>{children}</>
}