import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'
import collectionData from '../../public/data/collection-2025.json'
import MetaplexNFTService, { NFTMintResult } from '../metaplex/nft-service'
import GenerativeMintService from '../generative/generative-mint-service'
import { SecureRandomnessService, SecureRandomResult } from '../security/secure-randomness'
import { logger } from '../utils/logger'

export const MINT_CONFIG = {
  PRICE_SOL: 0.0169,
  MAX_SUPPLY: 2222,
  LOTTERY_WINNERS_COUNT: 5,
  LOTTERY_PRIZE_SOL: 0.98,
}

interface GeckoData {
  id: number
  name: string
  image: string
  metadata: string
  available: boolean
}

interface MintResult {
  success: boolean
  geckoId?: number
  geckoData?: GeckoData
  txHash?: string
  lotteryWon?: boolean
  totalGeckoz?: number
  solReceived?: number
  error?: string
  // For bulk minting
  mintedGeckoz?: GeckoData[]
  lotteryWinners?: number[]
  totalLotteryWinnings?: number
  // For NFT minting
  nftMintResults?: NFTMintResult[]
  nftMintAddress?: string
  nftTxSignature?: string
  // For generative system
  generatedTraits?: any
  rarityScore?: number
  isUltraRare?: boolean
  imageIpfsHash?: string
  metadataIpfsHash?: string
  generatedGeckoz?: any[]
}

interface LotteryState {
  winnersCount: number
  totalMinted: number
  winners: number[]
}

class GeckoMintService {
  private connection: Connection
  private treasuryAddress: string
  private lotteryState: LotteryState
  private mintedGeckoz: Set<number>
  private nftService: MetaplexNFTService
  private generativeService: GenerativeMintService

  constructor(connection: Connection, treasuryAddress?: string) {
    this.connection = connection
    this.treasuryAddress = treasuryAddress || 'Cs3etBd1Mw9xptSgFZFmcK41PALcm1XHX6yHmS5HsPLY' // Geckoz treasury wallet
    this.lotteryState = {
      winnersCount: 0,
      totalMinted: 0,
      winners: []
    }
    this.mintedGeckoz = new Set<number>()
    
    // Initialize NFT service and Generative service
    this.nftService = new MetaplexNFTService(connection)
    this.generativeService = new GenerativeMintService(connection)
    
    // Set collection address from environment variables if available
    const collectionAddress = process.env.NEXT_PUBLIC_COLLECTION_NFT_ADDRESS
    if (collectionAddress && collectionAddress !== 'YOUR_COLLECTION_NFT_ADDRESS') {
      this.nftService.setCollectionAddress(collectionAddress)
      console.log('Collection address set:', collectionAddress)
    } else {
      console.log('No collection address configured - using generative system without collection verification')
    }
    
    this.loadMintState()
  }

  private loadMintState() {
    // Load from localStorage if available (in production, this would be from blockchain)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gecko-mint-state')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          this.lotteryState = parsed.lotteryState || this.lotteryState
          this.mintedGeckoz = new Set(parsed.mintedGeckoz || [])
        } catch (error) {
          console.error('Error loading mint state:', error)
        }
      }
    }
  }

  private saveMintState() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gecko-mint-state', JSON.stringify({
        lotteryState: this.lotteryState,
        mintedGeckoz: Array.from(this.mintedGeckoz)
      }))
    }
  }

  private getAvailableGeckoz(): GeckoData[] {
    const collection = collectionData as { [key: string]: GeckoData }
    return Object.values(collection).filter(gecko => 
      gecko.available && !this.mintedGeckoz.has(gecko.id)
    )
  }

  private selectRandomGecko(): GeckoData | null {
    const available = this.getAvailableGeckoz()
    if (available.length === 0) return null
    
    const randomIndex = Math.floor(Math.random() * available.length)
    return available[randomIndex]
  }

  private isLotteryWinner(): boolean {
    if (this.lotteryState.winnersCount >= MINT_CONFIG.LOTTERY_WINNERS_COUNT) {
      return false
    }

    // Calculate lottery probability based on remaining mints and winners
    const remainingMints = MINT_CONFIG.MAX_SUPPLY - this.lotteryState.totalMinted
    const remainingWinners = MINT_CONFIG.LOTTERY_WINNERS_COUNT - this.lotteryState.winnersCount
    
    if (remainingWinners <= 0) return false
    
    // Dynamic probability to ensure we get exactly 5 winners across 2222 mints
    let probability = remainingWinners / remainingMints
    
    // Add some randomness but keep it fair
    if (remainingMints > 1000) {
      probability *= 0.7 // Lower chance early on
    } else if (remainingMints < 100) {
      probability *= 1.5 // Higher chance near the end
    }

    return Math.random() < probability
  }

  async createPaymentTransaction(
    fromPubkey: PublicKey,
    toPubkey: PublicKey,
    amountSOL: number
  ): Promise<Transaction> {
    try {
      console.log('Creating payment transaction:', {
        from: fromPubkey.toString(),
        to: toPubkey.toString(),
        amount: amountSOL
      })

      const transaction = new Transaction()
      const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL)

      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      )

      const { blockhash } = await this.connection.getLatestBlockhash('confirmed')
      transaction.recentBlockhash = blockhash
      transaction.feePayer = fromPubkey

      console.log('Transaction created successfully')
      return transaction
    } catch (error) {
      console.error('Failed to create payment transaction:', error)
      throw error
    }
  }

  async mintGecko(wallet: WalletContextState): Promise<MintResult> {
    const startTime = Date.now()
    const walletAddress = wallet.publicKey?.toString()
    const attemptId = `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Log mint attempt start
    logger.logInfo('mint', 'Mint attempt started', {
      attemptId,
      walletAddress,
      timestamp: new Date().toISOString()
    }, undefined, walletAddress)

    try {
      // Step 1: Wallet Connection Check
      logger.logDebug('mint', 'Checking wallet connection', { attemptId }, undefined, walletAddress)
      
      if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
        logger.logMintFailure('wallet_connect', 'Wallet not connected or missing capabilities', {
          attemptId,
          walletType: wallet.wallet?.adapter?.name || 'unknown',
          connected: wallet.connected,
          hasPublicKey: !!wallet.publicKey,
          hasSignTransaction: !!wallet.signTransaction,
          timeElapsed: Date.now() - startTime
        }, walletAddress)
        throw new Error('Wallet not connected')
      }

      // Step 2: Collection Availability Check
      logger.logDebug('mint', 'Checking collection availability', { attemptId }, undefined, walletAddress)
      
      const available = this.getAvailableGeckoz()
      if (available.length === 0) {
        logger.logMintFailure('balance_check', 'Collection sold out', {
          attemptId,
          availableCount: available.length,
          totalSupply: MINT_CONFIG.MAX_SUPPLY,
          timeElapsed: Date.now() - startTime
        }, walletAddress)
        throw new Error('Collection sold out!')
      }

      logger.logInfo('mint', 'Collection availability confirmed', {
        attemptId,
        availableCount: available.length,
        totalSupply: MINT_CONFIG.MAX_SUPPLY
      }, undefined, walletAddress)

      // Step 3: Balance Check
      logger.logDebug('mint', 'Checking wallet balance', { attemptId }, undefined, walletAddress)
      
      const balance = await this.connection.getBalance(wallet.publicKey)
      const balanceSOL = balance / LAMPORTS_PER_SOL
      
      logger.logInfo('mint', 'Balance retrieved', {
        attemptId,
        balanceSOL: balanceSOL,
        requiredSOL: MINT_CONFIG.PRICE_SOL,
        sufficient: balanceSOL >= MINT_CONFIG.PRICE_SOL
      }, undefined, walletAddress)
      
      if (balanceSOL < MINT_CONFIG.PRICE_SOL) {
        logger.logMintFailure('balance_check', 'Insufficient balance for mint', {
          attemptId,
          balanceSOL,
          requiredSOL: MINT_CONFIG.PRICE_SOL,
          shortfall: MINT_CONFIG.PRICE_SOL - balanceSOL,
          timeElapsed: Date.now() - startTime
        }, walletAddress)
        throw new Error(`Insufficient balance. Need ${MINT_CONFIG.PRICE_SOL} SOL`)
      }

      // Step 4: Gecko Selection
      logger.logDebug('mint', 'Selecting random gecko', { attemptId }, undefined, walletAddress)
      
      const selectedGecko = this.selectRandomGecko()
      if (!selectedGecko) {
        logger.logMintFailure('nft_generation', 'No geckos available for selection', {
          attemptId,
          availableCount: available.length,
          timeElapsed: Date.now() - startTime
        }, walletAddress)
        throw new Error('No geckos available')
      }

      logger.logInfo('mint', 'Gecko selected for mint', {
        attemptId,
        geckoId: selectedGecko.id,
        geckoName: selectedGecko.name
      }, undefined, walletAddress)

      // Step 5: Lottery Check
      logger.logDebug('mint', 'Checking lottery status', { attemptId }, undefined, walletAddress)
      
      const isWinner = this.isLotteryWinner()
      
      logger.logInfo('mint', 'Lottery status determined', {
        attemptId,
        isLotteryWinner: isWinner,
        currentWinnersCount: this.lotteryState.winnersCount,
        maxWinners: MINT_CONFIG.LOTTERY_WINNERS_COUNT
      }, undefined, walletAddress)

      // Step 6: Payment Transaction Creation
      logger.logDebug('mint', 'Creating payment transaction', { attemptId }, undefined, walletAddress)
      
      let treasuryPubkey: PublicKey
      try {
        treasuryPubkey = new PublicKey(this.treasuryAddress)
      } catch (error) {
        logger.logMintFailure('payment_tx', 'Invalid treasury address', {
          attemptId,
          treasuryAddress: this.treasuryAddress,
          error: error.message,
          timeElapsed: Date.now() - startTime
        }, walletAddress)
        throw new Error(`Invalid treasury address: ${this.treasuryAddress}`)
      }
      
      const paymentTransaction = await this.createPaymentTransaction(
        wallet.publicKey,
        treasuryPubkey,
        MINT_CONFIG.PRICE_SOL
      )

      logger.logInfo('mint', 'Payment transaction created', {
        attemptId,
        treasuryAddress: this.treasuryAddress,
        amount: MINT_CONFIG.PRICE_SOL
      }, undefined, walletAddress)

      // Step 7: Transaction Signing
      logger.logDebug('mint', 'Requesting wallet signature for payment', { attemptId }, undefined, walletAddress)
      
      let signedTransaction: Transaction
      try {
        signedTransaction = await wallet.signTransaction(paymentTransaction)
        logger.logInfo('mint', 'Transaction signed successfully', { attemptId }, undefined, walletAddress)
      } catch (error) {
        logger.logMintFailure('payment_tx', 'Transaction signing failed', {
          attemptId,
          error: error.message,
          walletType: wallet.wallet?.adapter?.name || 'unknown',
          timeElapsed: Date.now() - startTime
        }, walletAddress)
        throw error
      }
      
      // Step 8: Transaction Submission
      logger.logDebug('mint', 'Submitting payment transaction', { attemptId }, undefined, walletAddress)
      
      let txHash: string
      try {
        txHash = await this.connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        })
        
        logger.logTransactionState(txHash, 'submitted', {
          attemptId,
          geckoId: selectedGecko.id,
          amount: MINT_CONFIG.PRICE_SOL
        }, walletAddress)
        
      } catch (error) {
        logger.logMintFailure('payment_tx', 'Transaction submission failed', {
          attemptId,
          error: error.message,
          rpcEndpoint: this.connection.rpcEndpoint,
          timeElapsed: Date.now() - startTime
        }, walletAddress)
        throw error
      }

      // Step 9: Transaction Confirmation
      logger.logDebug('mint', 'Awaiting transaction confirmation', { 
        attemptId, 
        transactionHash: txHash 
      }, undefined, walletAddress)
      
      try {
        await this.connection.confirmTransaction(txHash, 'confirmed')
        
        logger.logTransactionState(txHash, 'confirmed', {
          attemptId,
          geckoId: selectedGecko.id,
          confirmationTime: Date.now() - startTime
        }, walletAddress)
        
      } catch (error) {
        logger.logMintFailure('confirmation', 'Transaction confirmation failed', {
          attemptId,
          transactionHash: txHash,
          error: error.message,
          timeElapsed: Date.now() - startTime
        }, walletAddress)
        throw error
      }
      
      logger.logInfo('mint', 'Payment confirmed successfully', {
        attemptId,
        transactionHash: txHash,
        paymentTime: Date.now() - startTime
      }, undefined, walletAddress)

      // Update state
      this.mintedGeckoz.add(selectedGecko.id)
      this.lotteryState.totalMinted++

      let totalGeckos = 1
      let solReceived = 0

      if (isWinner) {
        this.lotteryState.winnersCount++
        this.lotteryState.winners.push(selectedGecko.id)
        
        // Lottery winner gets 3 total geckos and 0.98 SOL back
        totalGeckos = 3
        solReceived = MINT_CONFIG.LOTTERY_PRIZE_SOL

        // Select 2 additional random geckos for the winner
        for (let i = 0; i < 2; i++) {
          const additionalGecko = this.selectRandomGecko()
          if (additionalGecko) {
            this.mintedGeckoz.add(additionalGecko.id)
          }
        }

        // Send prize SOL back to winner (in production, this would be automated)
        console.log(`🎉 LOTTERY WINNER! Sending ${MINT_CONFIG.LOTTERY_PRIZE_SOL} SOL back...`)
        
        try {
          const prizeTransaction = await this.createPaymentTransaction(
            treasuryPubkey,
            wallet.publicKey,
            MINT_CONFIG.LOTTERY_PRIZE_SOL
          )
          // Note: In production, this would be signed by the treasury wallet, not user wallet
          // For demo purposes, we'll just log it
          console.log('Prize transaction prepared:', prizeTransaction)
        } catch (error) {
          console.log('Prize transaction preparation failed:', error)
        }
      }

      this.saveMintState()

      // Step 4: Generate and mint unique NFT using generative system
      console.log('Payment confirmed! Now generating unique NFT...')
      let generativeResult: any = undefined
      
      try {
        // Use selectedGecko.id as mint ID for generative system
        generativeResult = await this.generativeService.generateAndMintGecko(wallet, selectedGecko.id)
        
        if (generativeResult.success) {
          console.log(`✅ Generative NFT minted successfully: ${generativeResult.nftMintResult?.mintAddress}`)
          console.log(`🎨 Generated traits:`, generativeResult.gecko?.traits)
          console.log(`⭐ Rarity score: ${generativeResult.gecko?.rarityScore}`)
          if (generativeResult.gecko?.isUltraRare) {
            console.log('🌟 ULTRA RARE GECKO GENERATED!')
          }
        } else {
          console.error('❌ Generative NFT minting failed:', generativeResult.error)
        }
      } catch (error) {
        console.error('Generative NFT minting error:', error)
        generativeResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Generative NFT minting failed'
        }
      }

      return {
        success: true,
        geckoId: selectedGecko.id,
        geckoData: generativeResult?.gecko || selectedGecko, // Use generated gecko if available
        txHash,
        lotteryWon: isWinner,
        totalGeckoz: totalGeckos,
        solReceived,
        nftMintAddress: generativeResult?.nftMintResult?.mintAddress,
        nftTxSignature: generativeResult?.nftMintResult?.txSignature,
        nftMintResults: generativeResult?.nftMintResult ? [generativeResult.nftMintResult] : undefined,
        // Additional generative data
        generatedTraits: generativeResult?.gecko?.traits,
        rarityScore: generativeResult?.gecko?.rarityScore,
        isUltraRare: generativeResult?.gecko?.isUltraRare,
        imageIpfsHash: generativeResult?.imageIpfsHash,
        metadataIpfsHash: generativeResult?.metadataIpfsHash
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mint failed'
      const totalTime = Date.now() - startTime
      
      // Comprehensive error logging
      logger.logError('mint', 'Mint attempt failed completely', {
        attemptId,
        error: errorMessage,
        stackTrace: error instanceof Error ? error.stack : undefined,
        walletType: wallet.wallet?.adapter?.name || 'unknown',
        walletConnected: wallet.connected,
        walletAddress,
        totalTimeElapsed: totalTime,
        rpcEndpoint: this.connection.rpcEndpoint,
        network: process.env.NEXT_PUBLIC_NETWORK,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }, undefined, walletAddress)
      
      console.error('Mint error:', error)
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async mintMultipleGeckos(wallet: WalletContextState, quantity: number, skipPayment: boolean = false): Promise<MintResult> {
    try {
      if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected')
      }

      if (quantity < 1 || quantity > 10) {
        throw new Error('Quantity must be between 1 and 10')
      }

      // Check if we have enough geckos available
      const available = this.getAvailableGeckoz()
      if (available.length < quantity) {
        throw new Error(`Only ${available.length} geckos available, you requested ${quantity}`)
      }

      let txHash = 'no-payment-tx'
      
      if (!skipPayment) {
        // Check user balance for total cost
        const balance = await this.connection.getBalance(wallet.publicKey)
        const balanceSOL = balance / LAMPORTS_PER_SOL
        const totalCost = MINT_CONFIG.PRICE_SOL * quantity
        
        if (balanceSOL < totalCost) {
          throw new Error(`Insufficient balance. Need ${totalCost} SOL`)
        }

        // Create payment transaction for total amount
        let treasuryPubkey: PublicKey
        try {
          treasuryPubkey = new PublicKey(this.treasuryAddress)
        } catch (error) {
          throw new Error(`Invalid treasury address: ${this.treasuryAddress}`)
        }
        
        const paymentTransaction = await this.createPaymentTransaction(
          wallet.publicKey,
          treasuryPubkey,
          totalCost
        )

        // Sign and send payment transaction
        console.log(`Requesting wallet signature for ${quantity} geckos (${totalCost} SOL)...`)
        const signedTransaction = await wallet.signTransaction(paymentTransaction)
        
        console.log('Sending payment transaction...')
        txHash = await this.connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        })

        // Wait for confirmation
        console.log('Confirming transaction...', txHash)
        await this.connection.confirmTransaction(txHash, 'confirmed')
        
        console.log('Payment confirmed! Processing bulk mint...')
      } else {
        console.log('🎁 Skipping payment - minting NFTs for free (gambling win)...')
      }

      // Now mint each gecko individually and check lottery for each
      const mintedGeckos: GeckoData[] = []
      const lotteryWinners: number[] = []
      let totalLotteryWinnings = 0
      let totalGeckosReceived = 0

      for (let i = 0; i < quantity; i++) {
        // Select random gecko for this mint
        const selectedGecko = this.selectRandomGecko()
        if (!selectedGecko) {
          console.warn(`Could not select gecko for mint ${i + 1}`)
          continue
        }

        // Mark as minted
        this.mintedGeckoz.add(selectedGecko.id)
        this.lotteryState.totalMinted++
        mintedGeckos.push(selectedGecko)
        totalGeckosReceived++

        // Check lottery for this individual mint
        const isWinner = this.isLotteryWinner()
        
        if (isWinner) {
          this.lotteryState.winnersCount++
          this.lotteryState.winners.push(selectedGecko.id)
          lotteryWinners.push(selectedGecko.id)
          
          // Lottery winner gets 3 total geckos for this winning mint
          totalGeckosReceived += 2 // Add 2 more (they already got 1)
          totalLotteryWinnings += MINT_CONFIG.LOTTERY_PRIZE_SOL

          // Select 2 additional random geckos for the winner
          for (let j = 0; j < 2; j++) {
            const additionalGecko = this.selectRandomGecko()
            if (additionalGecko) {
              this.mintedGeckoz.add(additionalGecko.id)
              mintedGeckos.push(additionalGecko)
            }
          }

          console.log(`🎉 LOTTERY WINNER on mint ${i + 1}! Gecko #${selectedGecko.id}`)
        }
      }

      this.saveMintState()

      // Step 4: Generate and mint unique NFTs for all minted geckos
      console.log(`🎨 Payment confirmed! Now generating ${mintedGeckos.length} unique NFTs...`)
      console.log(`🔍 Debug - Wallet address: ${wallet.publicKey?.toString()}`)
      console.log(`🔍 Debug - Network: ${process.env.NEXT_PUBLIC_NETWORK}`)
      console.log(`🔍 Debug - RPC: ${this.connection.rpcEndpoint}`)
      
      const generativeResults: any[] = []
      
      try {
        // Generate starting ID for bulk mint
        const startingId = mintedGeckos[0]?.id || 1
        
        const bulkResults = await this.generativeService.generateAndMintMultipleGeckos(
          wallet,
          startingId,
          mintedGeckos.length
        )
        
        bulkResults.forEach((result, index) => {
          if (result.success) {
            console.log(`✅ Generative NFT ${index + 1} minted successfully!`)
            console.log(`📍 Mint Address: ${result.nftMintResult?.mintAddress}`)
            console.log(`📝 Metadata Address: ${result.nftMintResult?.metadataAddress}`)
            console.log(`🏦 Token Account: ${result.nftMintResult?.tokenAddress}`)
            console.log(`📋 TX Signature: ${result.nftMintResult?.txSignature}`)
            console.log(`🎨 Traits: ${Object.values(result.gecko?.traits || {}).join(', ')}`)
            if (result.gecko?.isUltraRare) {
              console.log(`🌟 ULTRA RARE GECKO #${index + 1}!`)
            }
            
            // Log explorer link
            const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet-beta'
            console.log(`🔗 View in Explorer: https://explorer.solana.com/address/${result.nftMintResult?.mintAddress}?cluster=${network}`)
          } else {
            console.error(`❌ Generative NFT ${index + 1} failed:`, result.error)
            console.error(`🔍 Full error details:`, result)
          }
        })
        
        generativeResults.push(...bulkResults)
      } catch (error) {
        console.error('Bulk generative NFT minting error:', error)
      }

      const hasLotteryWins = lotteryWinners.length > 0
      const nftMintResults = generativeResults.map(r => r.nftMintResult).filter(Boolean)

      return {
        success: true,
        txHash,
        mintedGeckoz: mintedGeckos,
        lotteryWon: hasLotteryWins,
        lotteryWinners,
        totalGeckoz: totalGeckosReceived,
        solReceived: totalLotteryWinnings,
        totalLotteryWinnings,
        nftMintResults,
        nftMintAddress: nftMintResults[0]?.mintAddress,
        nftTxSignature: nftMintResults[0]?.txSignature,
        // Generative system data
        generatedGeckoz: generativeResults.map(r => r.gecko).filter(Boolean),
        // For backwards compatibility
        geckoId: mintedGeckos[0]?.id,
        geckoData: mintedGeckos[0]
      }

    } catch (error) {
      console.error('Bulk mint error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk mint failed'
      }
    }
  }

  getMintStats() {
    return {
      totalMinted: this.lotteryState.totalMinted,
      totalSupply: MINT_CONFIG.MAX_SUPPLY,
      availableGeckoz: this.getAvailableGeckoz().length,
      lotteryWinnersCount: this.lotteryState.winnersCount,
      lotteryWinnersRemaining: MINT_CONFIG.LOTTERY_WINNERS_COUNT - this.lotteryState.winnersCount,
      lotteryPool: MINT_CONFIG.LOTTERY_PRIZE_SOL,
      lotteryWinners: this.lotteryState.winners
    }
  }

  resetMintState() {
    this.lotteryState = {
      winnersCount: 0,
      totalMinted: 0,
      winners: []
    }
    this.mintedGeckoz = new Set<number>()
    this.saveMintState()
  }

  // Double-or-Nothing Gambling System
  async processPaymentOnly(wallet: WalletContextState, quantity: number = 1): Promise<{ success: boolean, transactionId?: string, error?: string }> {
    try {
      if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected')
      }

      const totalCost = MINT_CONFIG.PRICE_SOL * quantity
      console.log(`💰 Processing payment for ${quantity} geckoz (${totalCost} SOL)`)

      // Create and send payment transaction
      const treasuryPubkey = new PublicKey(this.treasuryAddress)
      const transaction = await this.createPaymentTransaction(wallet.publicKey, treasuryPubkey, totalCost)
      const signedTx = await wallet.signTransaction(transaction)
      
      const txId = await this.connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'processed'
      })

      const confirmation = await this.connection.confirmTransaction(txId, 'confirmed')
      if (confirmation.value.err) {
        throw new Error('Payment transaction failed')
      }

      console.log(`✅ Payment successful: ${txId}`)
      return { success: true, transactionId: txId }
    } catch (error) {
      console.error('Payment processing failed:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async coinFlipGamble(
    wallet: WalletContextState, 
    quantity: number, 
    userChoice: 'heads' | 'tails'
  ): Promise<{ 
    success: boolean, 
    result: 'heads' | 'tails', 
    won: boolean, 
    finalQuantity: number,
    geckos?: any[],
    transactionSignature?: string,
    error?: string,
    totalCostPaid?: number
  }> {
    try {
      console.log(`🎰 Coin flip gamble: ${quantity} geckoz, user chose ${userChoice}`)
      
      // Use secure randomness service for improved security
      const randomnessService = SecureRandomnessService.getInstance()
      const secureRandom: SecureRandomResult = await randomnessService.generateSecureRandom({
        connection: this.connection,
        userPublicKey: wallet.publicKey?.toString()
      })
      
      const result = secureRandom.result
      const won = userChoice === result
      
      // Log gambling details for audit trail
      console.log('🎰 Gambling audit trail:', {
        userChoice,
        result,
        won,
        timestamp: secureRandom.timestamp,
        isSecure: secureRandom.isSecure,
        proofHash: secureRandom.proof.substring(0, 16) + '...'
      })

      console.log(`🪙 Coin landed: ${result}, User ${won ? 'WON' : 'LOST'}`)
      
      const baseCost = MINT_CONFIG.PRICE_SOL * quantity

      if (won) {
        // User won - NO additional payment needed, mint double quantity
        // They already paid baseCost upfront, now they get 2x value
        console.log(`🚀 User won! Minting ${quantity * 2} geckoz for the ${baseCost} SOL already paid`)
        
        const finalQuantity = quantity * 2
        const mintResult = await this.mintMultipleGeckos(wallet, finalQuantity, true) // Skip payment - already paid!
        
        if (mintResult.success) {
          console.log(`🎉 Successfully minted ${finalQuantity} geckoz! Great value - you got 2x for your money!`)
        }
        
        return { 
          success: mintResult.success, 
          result, 
          won: true, 
          finalQuantity,
          geckos: mintResult.mintedGeckoz || mintResult.generatedGeckoz,
          transactionSignature: mintResult.txHash || mintResult.nftTxSignature,
          error: mintResult.error,
          totalCostPaid: baseCost
        }
      } else {
        // User lost - they forfeit their initial payment, get nothing
        // This is the fair "double or nothing" - they lose their original payment
        console.log(`💀 User lost! No additional charge, but they forfeit their ${baseCost} SOL payment and get 0 geckoz`)
        
        return { 
          success: true, 
          result, 
          won: false, 
          finalQuantity: 0,
          geckos: [],
          transactionSignature: 'gambling_loss_no_additional_tx',
          error: 'You lost the coin flip - original payment forfeited, no geckoz minted',
          totalCostPaid: baseCost
        }
      }
    } catch (error) {
      console.error('Coin flip gamble failed:', error)
      return { 
        success: false, 
        result: 'heads', 
        won: false, 
        finalQuantity: 0, 
        error: (error as Error).message,
        totalCostPaid: 0
      }
    }
  }
}

export default GeckoMintService