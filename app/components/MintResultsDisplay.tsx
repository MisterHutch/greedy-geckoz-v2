'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Copy, CheckCircle, Wallet } from 'lucide-react'

interface MintResult {
  success: boolean
  finalQuantity?: number
  totalGeckoz?: number
  transactionSignature?: string
  txHash?: string
  nftTxSignature?: string
  mintAddresses?: string[]
  nftMintResults?: Array<{
    mintAddress?: string
    tokenAddress?: string
    txSignature?: string
  }>
  nftMintAddress?: string
  geckos?: any[]
  mintedGeckoz?: any[]
  generatedGeckoz?: any[]
  error?: string
}

interface MintResultsDisplayProps {
  isVisible: boolean
  onClose: () => void
  result: MintResult | null
  isGambleWin?: boolean
}

export default function MintResultsDisplay({ isVisible, onClose, result, isGambleWin = false }: MintResultsDisplayProps) {
  const [copiedItems, setCopiedItems] = useState<{ [key: string]: boolean }>({})

  if (!isVisible || !result) return null

  const geckoCount = result.finalQuantity || result.totalGeckoz || 0
  const txSignature = result.transactionSignature || result.txHash || result.nftTxSignature
  const network = process.env.NEXT_PUBLIC_NETWORK || 'devnet'
  
  // Collect all mint addresses
  const mintAddresses = result.nftMintResults?.map(r => r.mintAddress).filter(Boolean) || 
                       (result.nftMintAddress ? [result.nftMintAddress] : [])

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const CopyButton = ({ text, itemKey }: { text: string, itemKey: string }) => (
    <button
      onClick={() => copyToClipboard(text, itemKey)}
      className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
      title="Copy to clipboard"
    >
      {copiedItems[itemKey] ? (
        <CheckCircle size={16} className="text-green-400" />
      ) : (
        <Copy size={16} className="text-white/60" />
      )}
    </button>
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {result.success ? (
            <>
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">
                  {isGambleWin ? '🎰' : '🦎'}
                </div>
                <h2 className="text-3xl font-bold text-green-400 mb-2">
                  {isGambleWin ? 'GAMBLE WON!' : 'MINT SUCCESSFUL!'}
                </h2>
                <p className="text-xl text-white/80">
                  {geckoCount} Gecko{geckoCount > 1 ? 's' : ''} Minted Successfully
                </p>
              </div>

              {/* Transaction Details */}
              <div className="space-y-6">
                {txSignature && (
                  <div className="bg-black/40 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      📋 Transaction Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">TX Signature:</span>
                        <div className="flex items-center">
                          <code className="bg-black/60 px-3 py-1 rounded text-sm text-green-400">
                            {txSignature.substring(0, 20)}...{txSignature.substring(-20)}
                          </code>
                          <CopyButton text={txSignature} itemKey="txSignature" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <a
                          href={`https://explorer.solana.com/tx/${txSignature}?cluster=${network}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View on Solana Explorer <ExternalLink size={16} className="ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mint Addresses */}
                {mintAddresses.length > 0 && (
                  <div className="bg-black/40 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      📍 NFT Mint Address{mintAddresses.length > 1 ? 'es' : ''}
                    </h3>
                    <div className="space-y-3">
                      {mintAddresses.map((address, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-white/70">Gecko #{index + 1}:</span>
                          <div className="flex items-center">
                            <code className="bg-black/60 px-3 py-1 rounded text-sm text-yellow-400">
                              {address.substring(0, 20)}...{address.substring(-20)}
                            </code>
                            <CopyButton text={address} itemKey={`mint-${index}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                    <Wallet size={20} className="mr-2" />
                    Check Your Wallet
                  </h3>
                  <div className="space-y-2 text-white/80">
                    <p>• Your {geckoCount} NFT{geckoCount > 1 ? 's' : ''} should now appear in your Phantom wallet</p>
                    <p>• You may need to refresh your wallet or wait a few seconds</p>
                    <p>• Look for "Gecko" or "TEST" tokens in your collectibles</p>
                    {network === 'devnet' && (
                      <p className="text-orange-400">• Note: These are devnet NFTs for testing purposes</p>
                    )}
                  </div>
                </div>

                {/* Gecko Details */}
                {(result.geckos || result.mintedGeckoz || result.generatedGeckoz) && (
                  <div className="bg-black/40 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      🎨 Your Geckos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(result.geckos || result.mintedGeckoz || result.generatedGeckoz || []).map((gecko: any, index: number) => (
                        <div key={index} className="bg-black/60 rounded-lg p-3">
                          <div className="font-semibold text-green-400">
                            {gecko.name || `Gecko #${gecko.id || index + 1}`}
                          </div>
                          {gecko.traits && (
                            <div className="text-sm text-white/70 mt-1">
                              {Object.entries(gecko.traits).slice(0, 2).map(([key, value]: [string, any]) => (
                                <div key={key}>{key}: {value}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Error Display */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-3xl font-bold text-red-400 mb-2">Mint Failed</h2>
                <p className="text-xl text-white/80">{result.error || 'Unknown error occurred'}</p>
              </div>
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}