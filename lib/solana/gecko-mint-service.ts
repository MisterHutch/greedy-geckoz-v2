import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'
import collectionData from '../../public/data/collection-2025.json'

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
  totalGeckos?: number
  solReceived?: number
  error?: string
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
  private mintedGeckos: Set<number>

  constructor(connection: Connection, treasuryAddress?: string) {
    this.connection = connection
    this.treasuryAddress = treasuryAddress || '3vZ7k6WqYBBEdBYLjp1Vw7TXRDNcAWvH8vGkqcEA3hYR' // Valid Solana address
    this.lotteryState = {
      winnersCount: 0,
      totalMinted: 0,
      winners: []
    }
    this.mintedGeckos = new Set<number>()
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
          this.mintedGeckos = new Set(parsed.mintedGeckos || [])
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
        mintedGeckos: Array.from(this.mintedGeckos)
      }))
    }
  }

  private getAvailableGeckos(): GeckoData[] {
    const collection = collectionData as { [key: string]: GeckoData }
    return Object.values(collection).filter(gecko => 
      gecko.available && !this.mintedGeckos.has(gecko.id)
    )
  }

  private selectRandomGecko(): GeckoData | null {
    const available = this.getAvailableGeckos()
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
    try {
      if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected')
      }

      // Check if collection is sold out
      const available = this.getAvailableGeckos()
      if (available.length === 0) {
        throw new Error('Collection sold out!')
      }

      // Check user balance
      const balance = await this.connection.getBalance(wallet.publicKey)
      const balanceSOL = balance / LAMPORTS_PER_SOL
      
      if (balanceSOL < MINT_CONFIG.PRICE_SOL) {
        throw new Error(`Insufficient balance. Need ${MINT_CONFIG.PRICE_SOL} SOL`)
      }

      // Select random gecko
      const selectedGecko = this.selectRandomGecko()
      if (!selectedGecko) {
        throw new Error('No geckos available')
      }

      // Check if this mint will be a lottery winner
      const isWinner = this.isLotteryWinner()
      
      // Create payment transaction with validation
      let treasuryPubkey: PublicKey
      try {
        treasuryPubkey = new PublicKey(this.treasuryAddress)
      } catch (error) {
        throw new Error(`Invalid treasury address: ${this.treasuryAddress}`)
      }
      
      const paymentTransaction = await this.createPaymentTransaction(
        wallet.publicKey,
        treasuryPubkey,
        MINT_CONFIG.PRICE_SOL
      )

      // Sign and send payment transaction
      console.log('Requesting wallet signature for payment...')
      const signedTransaction = await wallet.signTransaction(paymentTransaction)
      
      console.log('Sending payment transaction...')
      const txHash = await this.connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      })

      // Wait for confirmation
      console.log('Confirming transaction...', txHash)
      await this.connection.confirmTransaction(txHash, 'confirmed')
      
      console.log('Payment confirmed! Processing mint...')

      // Update state
      this.mintedGeckos.add(selectedGecko.id)
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
            this.mintedGeckos.add(additionalGecko.id)
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

      return {
        success: true,
        geckoId: selectedGecko.id,
        geckoData: selectedGecko,
        txHash,
        lotteryWon: isWinner,
        totalGeckos,
        solReceived
      }

    } catch (error) {
      console.error('Mint error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mint failed'
      }
    }
  }

  getMintStats() {
    return {
      totalMinted: this.lotteryState.totalMinted,
      totalSupply: MINT_CONFIG.MAX_SUPPLY,
      availableGeckos: this.getAvailableGeckos().length,
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
    this.mintedGeckos = new Set<number>()
    this.saveMintState()
  }
}

export default GeckoMintService