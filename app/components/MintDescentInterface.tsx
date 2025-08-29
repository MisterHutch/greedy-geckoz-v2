'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Trophy, Zap, Clock, DollarSign, Users, Wallet, ExternalLink } from 'lucide-react'
import WalletButton from './WalletButton'
import GeckoMintService, { MINT_CONFIG } from '../../lib/solana/gecko-mint-service'
import GeckoNotification, { useGeckoNotifications } from './GeckoNotification'
import EnvironmentToggle, { useEnvironment } from './EnvironmentToggle'
import { useScrollValue } from '../../lib/paradox/scroll-controller'
import TimeWarpAnimation from './TimeWarpAnimation'
import CoinFlipGamble from './CoinFlipGamble'
import CoinFlipAnimation from './CoinFlipAnimation'
import MintResultsDisplay from './MintResultsDisplay'
import { GamblingErrorBoundary } from './ErrorBoundary'

interface MintDescentProps {
  mintStats: {
    totalMinted: number
    totalSupply: number
    lotteryWinnersCount: number
    lotteryWinnersRemaining: number
    lotteryPool: number
    availableGeckoz?: number
  }
}

interface MintLayer {
  id: string
  depth: number
  title: string
  description: string
  component: 'connect' | 'quantity' | 'preview' | 'payment' | 'success'
}

export default function MintDescentInterface({ mintStats }: MintDescentProps) {
  const wallet = useWallet()
  const { publicKey, connected } = wallet
  const [isMinting, setIsMinting] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [mintResult, setMintResult] = useState<any>(null)
  const [mintQuantity, setMintQuantity] = useState(1)
  const [currentLayer, setCurrentLayer] = useState(0)
  const [showMintPopup, setShowMintPopup] = useState(false)
  const [mintService, setMintService] = useState<GeckoMintService | null>(null)
  const [realMintStats, setRealMintStats] = useState(mintStats)
  const [showTimeWarp, setShowTimeWarp] = useState(false)
  const [showGambleChoice, setShowGambleChoice] = useState(false)
  const [showCoinFlip, setShowCoinFlip] = useState(false)
  const [userGambleChoice, setUserGambleChoice] = useState<'heads' | 'tails' | null>(null)
  const [coinFlipResult, setCoinFlipResult] = useState<'heads' | 'tails' | null>(null)
  const [mintResult, setMintResult] = useState<any>(null)
  const [showMintResults, setShowMintResults] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY, paradoxIntensity } = useScrollValue()
  const notifications = useGeckoNotifications()
  const environment = useEnvironment()
  
  const layers: MintLayer[] = [
    { id: 'connect', depth: 0, title: 'Enter the Gecko Dimension', description: 'Connect your wallet to begin the descent', component: 'connect' },
    { id: 'quantity', depth: -200, title: 'Choose Your Descent Depth', description: 'How many geckoz will you manifest?', component: 'quantity' },
    { id: 'preview', depth: -400, title: 'Witness Your Gecko', description: 'Behold what shall become reality', component: 'preview' },
    { id: 'payment', depth: -600, title: 'Transcend Reality', description: 'Complete the dimensional transfer', component: 'payment' },
    { id: 'success', depth: -800, title: 'Welcome to Infinity', description: 'Your geckoz now exist across all realities', component: 'success' }
  ]
  
  const descentProgress = Math.max(0, Math.min(1, currentLayer / (layers.length - 1)))
  const totalCost = MINT_CONFIG.PRICE_SOL * mintQuantity
  const canAfford = userBalance >= totalCost
  const availableCount = realMintStats.availableGeckoz || 769 // Fallback to default available count
  const soldOut = availableCount === 0
  const maxQuantity = Math.max(1, Math.min(10, availableCount)) // Ensure at least 1 option
  const lotteryWinnersLeft = realMintStats.lotteryWinnersRemaining
  
  // Mint stats calculated

  // Initialize connection and mint service based on environment
  useEffect(() => {
    const connection = new Connection(environment.getEndpoint())
    const service = new GeckoMintService(connection, environment.getTreasuryAddress())
    setMintService(service)
    
    const stats = service.getMintStats()
    setRealMintStats(stats)
  }, [environment.environment])

  // Update stats periodically
  useEffect(() => {
    if (mintService) {
      const updateStats = () => {
        const stats = mintService.getMintStats()
        setRealMintStats(stats)
      }
      
      updateStats()
      const interval = setInterval(updateStats, 5000)
      return () => clearInterval(interval)
    }
  }, [mintService])

  // Load user balance
  useEffect(() => {
    if (!publicKey || !mintService) return

    const loadBalance = async () => {
      try {
        const connection = new Connection(environment.getEndpoint())
        const balance = await connection.getBalance(publicKey)
        setUserBalance(balance / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error('Failed to load balance:', error)
        notifications.addNotification('error', 'Balance Load Failed', 'Could not load wallet balance')
      }
    }

    loadBalance()
    const interval = setInterval(loadBalance, 10000)
    return () => clearInterval(interval)
  }, [publicKey, mintService])

  // Phase 1: Initial mint button click - show gamble choice
  const handleMint = async () => {
    if (!connected || !publicKey || !mintService) {
      notifications.showWalletNotConnected()
      return
    }

    if (userBalance < totalCost) {
      notifications.showInsufficientFunds(totalCost, userBalance)
      return
    }

    if (soldOut) {
      notifications.showSoldOut()
      return
    }

    // Show gambling choice modal first
    setShowGambleChoice(true)
  }

  // Phase 2a: User chooses to gamble
  const handleGambleChoice = async (choice: 'heads' | 'tails') => {
    if (!mintService || !connected || !publicKey) {
      notifications.showWalletNotConnected()
      return
    }

    setShowGambleChoice(false)
    setUserGambleChoice(choice)
    setIsMinting(true)

    try {
      console.log(`🎰 Starting gambling flow: ${mintQuantity} geckoz, chose ${choice}`)
      
      // Step 1: Process initial payment
      const paymentLoadingId = notifications.addNotification(
        'info',
        `💰 Processing payment for ${mintQuantity} geckoz...`,
        `Cost: ${totalCost} SOL`,
        0
      )
      
      const paymentResult = await mintService.processPaymentOnly(wallet, mintQuantity)
      notifications.removeNotification(paymentLoadingId)
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed')
      }

      console.log(`✅ Initial payment successful: ${paymentResult.transactionId}`)
      
      // Step 2: Execute coin flip gamble
      setShowCoinFlip(true)
      
      const gambleResult = await mintService.coinFlipGamble(wallet, mintQuantity, choice)
      setCoinFlipResult(gambleResult.result)
      
      console.log(`🎯 Gamble result:`, gambleResult)
      
      // Store the complete result for later processing
      setMintResult(gambleResult)
      
    } catch (error) {
      console.error('Gambling flow failed:', error)
      notifications.addNotification(
        'error',
        'Gambling Failed 😞',
        (error as Error)?.message || 'Unknown error occurred',
        5000
      )
      resetGamblingState()
    }
  }

  // Phase 2b: User chooses to skip gambling (normal mint)
  const handleSkipGambling = async () => {
    if (!mintService || !connected || !publicKey) {
      notifications.showWalletNotConnected()
      return
    }

    setShowGambleChoice(false)
    setIsMinting(true)
    setShowTimeWarp(true) // Use time warp for normal minting
    setCurrentLayer(4)

    try {
      console.log(`🔄 Standard minting flow: ${mintQuantity} geckoz`)
      
      const loadingId = notifications.addNotification(
        'info',
        `Processing Mint on ${environment.environment.toUpperCase()}...`,
        environment.isDevnet 
          ? "Using devnet - free fake SOL for testing! 🧪" 
          : "Using mainnet - this costs real SOL! 💰",
        0
      )
      
      const result = mintQuantity === 1 
        ? await mintService.mintGecko(wallet)
        : await mintService.mintMultipleGeckos(wallet, mintQuantity)
      
      notifications.removeNotification(loadingId)
      
      await processMintSuccess(result)
      
    } catch (error) {
      console.error('Standard mint failed:', error)
      await processMintError(error)
    } finally {
      setIsMinting(false)
    }
  }

  // Phase 3: Coin flip animation completes - process results
  const handleCoinFlipComplete = async () => {
    console.log('🎯 Coin flip animation completed! Starting result processing...')
    console.log('🔍 Debug - mintResult:', mintResult)
    console.log('🔍 Debug - userGambleChoice:', userGambleChoice)
    console.log('🔍 Debug - coinFlipResult:', coinFlipResult)
    
    setShowCoinFlip(false)
    
    if (!mintResult || !userGambleChoice || !coinFlipResult) {
      console.error('❌ Missing data for coin flip completion - resetting state')
      resetGamblingState()
      return
    }

    const won = userGambleChoice === coinFlipResult
    
    try {
      if (won && mintResult.success) {
        console.log(`🎉 User won gamble! Minted ${mintResult.finalQuantity} geckoz`)
        setCurrentLayer(4)
        await processMintSuccess(mintResult, true)
      } else if (!won) {
        console.log(`💀 User lost gamble! Paid double, got nothing`)
        notifications.addNotification(
          'error',
          '💀 You Lost the Coin Flip!',
          `Paid ${(totalCost * 2).toFixed(4)} SOL but received no geckoz. Better luck next time!`,
          8000
        )
        setCurrentLayer(0)
      } else {
        throw new Error(mintResult.error || 'Mint failed after winning gamble')
      }
    } catch (error) {
      console.error('Post-flip processing failed:', error)
      await processMintError(error)
    } finally {
      resetGamblingState()
    }
  }

  // Utility: Process successful mint (gambling or normal)
  const processMintSuccess = async (result: any, isGambleWin = false) => {
    const updatedStats = mintService?.getMintStats()
    if (updatedStats) {
      setRealMintStats(updatedStats)
    }
    
    setMintResult(result)
    setShowMintPopup(true)
    
    // Handle lottery wins
    if (result.lotteryWon || result.lotteryWinner) {
      const winCount = result.lotteryWinners?.length || 1
      const totalWinnings = result.totalLotteryWinnings || result.lotteryPrize || 0
      
      if (winCount > 1) {
        notifications.addNotification(
          'success',
          `🎉 MULTIPLE LOTTERY WINS! 🎉`,
          `You won ${winCount} lotteries! +${totalWinnings} SOL + ${result.totalGeckoz || result.finalQuantity || mintQuantity} total geckoz!`,
          8000
        )
      } else {
        notifications.showLotteryWin(result.totalGeckoz || result.finalQuantity || 3, result.solReceived || totalWinnings || 0.98)
      }
    } else {
      // Enhanced success notification with transaction details
      const geckoCount = result.totalGeckoz || result.finalQuantity || mintQuantity
      const txSignature = result.transactionSignature || result.txHash || result.nftTxSignature
      const network = process.env.NEXT_PUBLIC_NETWORK || 'devnet'
      
      // Log detailed results for debugging
      console.log('🎯 MINT SUCCESS DETAILS:', {
        geckoCount,
        txSignature,
        mintAddresses: result.nftMintResults?.map((r: any) => r.mintAddress) || [result.nftMintAddress],
        tokenAccounts: result.nftMintResults?.map((r: any) => r.tokenAddress) || [result.tokenAddress],
        geckos: result.geckos || result.mintedGeckoz || result.generatedGeckoz,
        fullResult: result
      })
      
      if (geckoCount > 1) {
        const successMsg = isGambleWin 
          ? `🎰 GAMBLE WON! Successfully minted ${geckoCount} geckoz!`
          : `🦎 Successfully minted ${geckoCount} geckoz!`
        
        // Create detailed message with transaction info
        let detailMessage = `Your ${geckoCount} geckoz have been added to your wallet.`
        
        if (txSignature) {
          detailMessage += `\n\n📋 Transaction: ${txSignature.substring(0, 20)}...`
          detailMessage += `\n🔗 View on Explorer: https://explorer.solana.com/tx/${txSignature}?cluster=${network}`
        }
        
        // Show mint addresses if available
        const mintAddresses = result.nftMintResults?.map((r: any) => r.mintAddress) || (result.nftMintAddress ? [result.nftMintAddress] : [])
        if (mintAddresses.length > 0) {
          detailMessage += `\n\n📍 Mint Address${mintAddresses.length > 1 ? 'es' : ''}:`
          mintAddresses.forEach((addr: string, i: number) => {
            if (addr) {
              detailMessage += `\n  ${i + 1}. ${addr.substring(0, 20)}...`
            }
          })
        }
        
        detailMessage += isGambleWin ? '\n\n🎲 Gambling pays off!' : '\n\n💎 Check your wallet!'
          
        notifications.addNotification(
          'success',
          successMsg,
          detailMessage,
          12000 // Longer display time for important info
        )
        
        // Show detailed mint results display
        setMintResult(result)
        setShowMintResults(true)
        
        // Trigger wallet refresh after a delay
        setTimeout(() => {
          refreshWalletNFTs()
        }, 3000)
      } else {
        notifications.showMintSuccess(result.geckoId || 0)
      }
    }
    
    // Refresh balance
    setTimeout(async () => {
      try {
        const connection = new Connection(environment.getEndpoint())
        const balance = await connection.getBalance(publicKey!)
        setUserBalance(balance / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error('Failed to refresh balance:', error)
      }
    }, 2000)
  }

  // Utility: Process mint error
  const processMintError = async (error: any) => {
    notifications.showMintFailed((error as Error)?.message)
    setCurrentLayer(0)
    setIsMinting(false)
    resetGamblingState()
  }

  // Utility: Refresh wallet NFTs (triggers wallet refresh)
  const refreshWalletNFTs = async () => {
    try {
      if (!publicKey || !connected) return
      
      console.log('🔄 Refreshing wallet NFTs...')
      
      // Create connection to check for new tokens
      const connection = new Connection(environment.getEndpoint())
      
      // Get all token accounts for the wallet
      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        programId: new (await import('@solana/web3.js')).PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })
      
      console.log(`✅ Found ${tokenAccounts.value.length} token accounts in wallet`)
      
      // Trigger wallet adapter refresh if available
      if ('refreshTokenAccounts' in wallet && typeof wallet.refreshTokenAccounts === 'function') {
        await wallet.refreshTokenAccounts()
        console.log('✅ Wallet adapter refreshed')
      }
      
      // Add notification to check wallet
      notifications.addNotification(
        'info',
        '👛 Wallet Refresh',
        'NFTs should now be visible in your wallet. If not, try refreshing your wallet app.',
        5000
      )
      
    } catch (error) {
      console.error('❌ Wallet refresh failed:', error)
    }
  }

  // Utility: Reset all gambling state
  const resetGamblingState = () => {
    console.log('🔄 Resetting gambling state - clearing all states')
    setIsMinting(false)
    setShowGambleChoice(false)
    setShowCoinFlip(false)
    setShowTimeWarp(false)
    setShowMintResults(false)
    setUserGambleChoice(null)
    setCoinFlipResult(null)
    setMintResult(null)
    console.log('✅ Gambling state reset complete')
  }

  const LayerComponent = ({ layer, index }: { layer: MintLayer, index: number }) => {
    const isActive = index === currentLayer
    const layerProgress = Math.max(0, Math.min(1, (scrollY - 2000 + index * 300) / 400))
    
    return (
      <motion.div
        className="mint-layer"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '600px',
          maxWidth: '90vw',
          minHeight: '400px',
          transformOrigin: 'center center',
          transform: `
            translate(-50%, -50%) 
            translateZ(${layer.depth + descentProgress * 200}px)
            rotateX(${layerProgress * 5}deg)
          `,
          opacity: isActive ? 1 : 0,
          display: isActive ? 'block' : 'none',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          border: `1px solid rgba(86, 236, 106, ${0.2 + layerProgress * 0.3})`,
          borderRadius: '24px',
          padding: '3rem',
          transformStyle: 'preserve-3d',
          zIndex: isActive ? 10 : Math.max(1, 5 - index)
        }}
        animate={{
          scale: isActive ? 1 : 0.9,
          rotateY: isActive ? 0 : (index % 2 === 0 ? -5 : 5)
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Layer Title */}
        <h3 
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1rem',
            background: `linear-gradient(45deg, var(--dimension-${(index % 4) + 1}), var(--reality-primary))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'paradoxTextShift 6s ease-in-out infinite'
          }}
        >
          {layer.title}
        </h3>
        
        <p 
          style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '2rem',
            fontSize: '1.125rem'
          }}
        >
          {layer.description}
        </p>

        {/* Layer Content */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          {layer.component === 'connect' && (
            <div style={{ textAlign: 'center' }}>
              {!connected ? (
                <div>
                  <Wallet style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', color: 'var(--dimension-2)' }} />
                  <WalletButton />
                  <p style={{ marginTop: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Connect your wallet to enter the gecko dimension
                  </p>
                </div>
              ) : (
                <div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    ✅
                  </motion.div>
                  <p style={{ color: 'var(--reality-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    Wallet Connected
                  </p>
                  <button
                    onClick={() => setCurrentLayer(1)}
                    style={{
                      marginTop: '1rem',
                      padding: '1rem 2rem',
                      background: 'var(--dimension-2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Begin Descent
                  </button>
                </div>
              )}
            </div>
          )}

          {layer.component === 'quantity' && connected && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '1rem', 
                  color: 'var(--dimension-3)',
                  fontSize: '1.25rem',
                  fontWeight: 'bold'
                }}>
                  How many geckoz shall manifest? 🦎
                </label>
                <select
                  value={mintQuantity}
                  onChange={(e) => setMintQuantity(Math.min(parseInt(e.target.value), maxQuantity))}
                  style={{
                    padding: '1rem',
                    fontSize: '1.125rem',
                    borderRadius: '12px',
                    border: '2px solid var(--dimension-3)',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  disabled={soldOut}
                >
                  {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} geckoz {num > 1 ? '(Higher chance of lottery!)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <p style={{ color: 'var(--dimension-1)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  Total Cost: {totalCost.toFixed(4)} SOL
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Your Balance: {userBalance.toFixed(4)} SOL
                </p>
                {!canAfford && (
                  <p style={{ color: 'var(--dimension-1)', marginTop: '0.5rem' }}>
                    Need {(totalCost - userBalance).toFixed(4)} more SOL
                  </p>
                )}
              </div>
              
              <button
                onClick={() => setCurrentLayer(2)}
                disabled={!canAfford || soldOut}
                style={{
                  padding: '1rem 2rem',
                  background: canAfford ? 'var(--dimension-3)' : 'rgba(255, 255, 255, 0.1)',
                  color: canAfford ? 'black' : 'rgba(255, 255, 255, 0.5)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  cursor: canAfford ? 'pointer' : 'not-allowed'
                }}
              >
                {soldOut ? 'SOLD OUT' : canAfford ? 'Preview Manifest' : 'Insufficient Funds'}
              </button>
            </div>
          )}

          {layer.component === 'preview' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '6rem', 
                marginBottom: '1rem',
                filter: 'drop-shadow(0 0 20px var(--reality-primary))',
                animation: 'gecko-blink 3s ease-in-out infinite'
              }}>
                🦎
              </div>
              <p style={{ color: 'var(--reality-primary)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {mintQuantity} Geckoz Ready to Manifest
              </p>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
                Each gecko has a chance to win the lottery: {MINT_CONFIG.LOTTERY_PRIZE_SOL} SOL + 3 geckoz total!
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setCurrentLayer(1)}
                  style={{
                    padding: '1rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid var(--dimension-2)',
                    color: 'var(--dimension-2)',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Modify
                </button>
                <button
                  onClick={() => setCurrentLayer(3)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'var(--reality-primary)',
                    color: 'black',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Proceed to Transcendence
                </button>
              </div>
            </div>
          )}

          {layer.component === 'payment' && (
            <div style={{ textAlign: 'center' }}>
              <Trophy style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', color: 'var(--dimension-4)' }} />
              <p style={{ color: 'var(--dimension-4)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                Final Step: Complete the Ritual
              </p>
              
              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Geckoz:</p>
                    <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>{mintQuantity}</p>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Total Cost:</p>
                    <p style={{ color: 'var(--dimension-4)', fontWeight: 'bold', fontSize: '1.25rem' }}>{totalCost.toFixed(4)} SOL</p>
                  </div>
                </div>
                
                {lotteryWinnersLeft > 0 && (
                  <div style={{ padding: '1rem', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '8px', marginTop: '1rem' }}>
                    <p style={{ color: 'var(--dimension-4)', fontSize: '0.875rem' }}>
                      🎰 {lotteryWinnersLeft} lottery spots remaining! Each gecko has a chance to win!
                    </p>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleMint}
                disabled={isMinting}
                style={{
                  padding: '1.5rem 3rem',
                  background: isMinting ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(45deg, var(--dimension-1), var(--dimension-4))',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  cursor: isMinting ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isMinting ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Transcending Reality...
                  </div>
                ) : (
                  `🚀 MINT ${mintQuantity} GECKOZ`
                )}
              </button>
            </div>
          )}

          {layer.component === 'success' && mintResult && (
            <div style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ fontSize: '6rem', marginBottom: '1rem' }}
              >
                {mintResult.lotteryWon ? '🏆' : '🦎'}
              </motion.div>
              
              <h3 style={{ 
                color: mintResult.lotteryWon ? 'var(--dimension-4)' : 'var(--reality-primary)',
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                {mintResult.lotteryWon ? 'LOTTERY WINNER!' : 'Manifest Complete!'}
              </h3>
              
              {mintResult.lotteryWon ? (
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ color: 'var(--dimension-4)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    +{mintResult.solReceived} SOL + {mintResult.totalGeckoz} Total Geckoz!
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    The gecko gods have smiled upon you!
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ color: 'var(--reality-primary)', fontSize: '1.25rem' }}>
                    {mintQuantity} Geckoz successfully minted!
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Your geckoz now exist across infinite dimensions.
                  </p>
                </div>
              )}

              {mintResult.txHash && (
                <div style={{ marginBottom: '2rem' }}>
                  <a
                    href={`https://solscan.io/tx/${mintResult.txHash}${environment.isDevnet ? '?cluster=devnet' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--dimension-3)',
                      textDecoration: 'none',
                      fontSize: '1rem'
                    }}
                  >
                    View Transaction <ExternalLink size={16} />
                  </a>
                </div>
              )}
              
              <button
                onClick={() => {
                  setCurrentLayer(0)
                  setMintResult(null)
                  setMintQuantity(1)
                }}
                style={{
                  padding: '1rem 2rem',
                  background: 'var(--reality-primary)',
                  color: 'black',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Mint More Geckoz
              </button>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <section 
      ref={containerRef}
      id="mint-descent"
      data-paradox-section="descent-interface"
      style={{
        position: 'relative',
        width: '100vw',
        height: '300vh',
        perspective: '2000px',
        overflow: 'hidden',
        background: `
          linear-gradient(180deg, 
            rgba(0, 0, 0, 0.9) 0%, 
            rgba(131, 56, 236, ${0.2 + paradoxIntensity * 0.1}) 50%, 
            rgba(0, 0, 0, 0.95) 100%)
        `
      }}
    >
      {/* Infinite Tunnel Effect */}
      <div 
        className="descent-tunnel"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d'
        }}
      >
        <div 
          className="tunnel-rings"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)'
          }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="tunnel-ring"
              style={{
                position: 'absolute',
                width: '800px',
                height: '800px',
                border: `2px solid rgba(86, 236, 106, ${0.1 - i * 0.005})`,
                borderRadius: '50%',
                transform: `translateZ(${-i * 100}px) scale(${1 + i * 0.1})`,
                opacity: Math.max(0, 1 - i * 0.1),
                animation: 'tunnelPulse 8s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>

        {/* Mint Layers */}
        {layers.map((layer, index) => (
          <LayerComponent key={layer.id} layer={layer} index={index} />
        ))}

        {/* Floating Particles */}
        <div className="floating-particles">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`particle particle-${i % 5}`}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                background: `var(--dimension-${(i % 4) + 1})`,
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float${['Up', 'Down', 'Left', 'Right', 'Spiral'][i % 5]} ${5 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 10}s`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      </div>

      {/* Layer Progress Indicator */}
      <div
        style={{
          position: 'fixed',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 20
        }}
      >
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: index === currentLayer 
                ? `var(--dimension-${(index % 4) + 1})`
                : 'rgba(255, 255, 255, 0.3)',
              border: index === currentLayer ? `2px solid white` : 'none',
              cursor: connected && index <= currentLayer ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              opacity: index <= currentLayer ? 1 : 0.3
            }}
            onClick={() => {
              if (connected && index <= currentLayer) {
                setCurrentLayer(index)
              }
            }}
          />
        ))}
      </div>

      {/* Modal Overlays - Proper z-index management */}
      <AnimatePresence>
        {showTimeWarp && (
          <TimeWarpAnimation
            isActive={showTimeWarp}
            mintQuantity={mintQuantity}
            onComplete={() => setShowTimeWarp(false)}
          />
        )}
        
        {showGambleChoice && (
          <GamblingErrorBoundary>
            <CoinFlipGamble
              isActive={showGambleChoice}
              mintQuantity={mintQuantity}
              onChoice={handleGambleChoice}
              onSkip={handleSkipGambling}
            />
          </GamblingErrorBoundary>
        )}
        
        {showCoinFlip && userGambleChoice && coinFlipResult && (
          <GamblingErrorBoundary>
            <CoinFlipAnimation
              isActive={showCoinFlip}
              userChoice={userGambleChoice}
              result={coinFlipResult}
              onComplete={handleCoinFlipComplete}
            />
          </GamblingErrorBoundary>
        )}
      </AnimatePresence>
      
      {/* Mint Results Display */}
      <MintResultsDisplay
        isVisible={showMintResults}
        onClose={() => setShowMintResults(false)}
        result={mintResult}
        isGambleWin={mintResult?.won || false}
      />
    </section>
  )
}