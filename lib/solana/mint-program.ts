// Temporary mock mint program for demo purposes
// This will be replaced with actual Solana program integration later

export const MINT_CONFIG = {
  PRICE: 0.0169,
  PRICE_PER_TOKEN: 0.0169,
  MAX_SUPPLY: 2222,
  LOTTERY_WINNERS_COUNT: 5,
  LOTTERY_PRIZE: 0.93,
  PROGRAM_ID: 'mock-program-id',
  COLLECTION_ADDRESS: 'mock-collection-address'
}

export interface MintConditions {
  canMint: boolean
  reason?: string
}

export const validateMintConditions = (
  currentSupply: number,
  balance: number,
  quantity: number = 1
): MintConditions => {
  if (currentSupply >= MINT_CONFIG.MAX_SUPPLY) {
    return { canMint: false, reason: 'Collection sold out!' }
  }
  
  const totalCost = MINT_CONFIG.PRICE * quantity
  if (balance < totalCost) {
    return { canMint: false, reason: `Insufficient balance. Need ${totalCost.toFixed(4)} SOL` }
  }
  
  return { canMint: true }
}

// Global lottery state - in production this would be stored on-chain
let lotteryWinners: number[] = []

export class GeckoMintProgram {
  private connection: any

  constructor(connection?: any) {
    this.connection = connection
  }

  async mintGecko(
    publicKey: any,
    metadata: any,
    geckoNumber: number
  ): Promise<{
    success: boolean
    mintAddress?: string
    txHash?: string
    lotteryWon?: boolean
    lotteryAmount?: number
    error?: string
  }> {
    // Mock mint function for demo
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful mint
      const success = Math.random() > 0.1 // 90% success rate
      
      if (success) {
        // Check if this minter wins the lottery (completely random, max 4 winners)
        const lotteryWon = lotteryWinners.length < MINT_CONFIG.LOTTERY_WINNERS_COUNT && 
                           Math.random() < 0.02 // 2% chance per mint
        
        if (lotteryWon) {
          lotteryWinners.push(geckoNumber)
        }
        
        return {
          success: true,
          mintAddress: `mock-mint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          txHash: `mock-tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          lotteryWon,
          lotteryAmount: lotteryWon ? MINT_CONFIG.LOTTERY_PRIZE : undefined
        }
      } else {
        return {
          success: false,
          error: 'Mock mint failure for demo'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Mint failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  static async getCollectionStats(): Promise<{
    totalMinted: number
    totalSupply: number
    lotteryWinnersCount: number
    lotteryWinnersRemaining: number
    lotteryPool: number
  }> {
    // Mock collection stats
    return {
      totalMinted: Math.floor(Math.random() * 500),
      totalSupply: MINT_CONFIG.MAX_SUPPLY,
      lotteryWinnersCount: lotteryWinners.length,
      lotteryWinnersRemaining: MINT_CONFIG.LOTTERY_WINNERS_COUNT - lotteryWinners.length,
      lotteryPool: MINT_CONFIG.LOTTERY_PRIZE
    }
  }

  static getLotteryWinners(): number[] {
    return [...lotteryWinners]
  }
}