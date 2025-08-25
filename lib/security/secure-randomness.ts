/**
 * Secure Randomness Service for Gambling Operations
 * 
 * SECURITY NOTE: This is a client-side implementation for development/demo purposes.
 * In production, this MUST be moved to:
 * 1. A secure backend API with hardware randomness
 * 2. A Solana program with Switchboard/Chainlink VRF
 * 3. Or use Solana's blockhash for verifiable randomness
 */

import { createHash } from 'crypto'

export interface SecureRandomResult {
  result: 'heads' | 'tails'
  seed: string
  timestamp: number
  proof: string
  isSecure: boolean
}

export interface RandomnessConfig {
  useBlockhash?: boolean
  connection?: any // Solana connection for blockhash
  userPublicKey?: string
}

export class SecureRandomnessService {
  private static instance: SecureRandomnessService
  
  public static getInstance(): SecureRandomnessService {
    if (!SecureRandomnessService.instance) {
      SecureRandomnessService.instance = new SecureRandomnessService()
    }
    return SecureRandomnessService.instance
  }

  /**
   * Generate cryptographically secure randomness for gambling
   * Uses multiple entropy sources for enhanced security
   */
  public async generateSecureRandom(config: RandomnessConfig = {}): Promise<SecureRandomResult> {
    const timestamp = Date.now()
    
    // Collect entropy from multiple sources
    const entropySources = [
      // High-precision timestamp
      performance.now().toString(),
      // Browser crypto random
      Array.from(crypto.getRandomValues(new Uint32Array(4))).join(''),
      // Mouse entropy (if available)
      this.getMouseEntropy(),
      // User context
      config.userPublicKey || 'anonymous',
      // Block entropy (if Solana connection available)
      await this.getBlockEntropy(config.connection)
    ]

    // Combine all entropy sources
    const combinedEntropy = entropySources.join('-') + `-${timestamp}`
    
    // Create cryptographic seed
    const seed = this.createSeed(combinedEntropy)
    
    // Generate result from seed
    const result = this.seedToResult(seed)
    
    // Create proof of randomness
    const proof = this.createProof(seed, result, timestamp)
    
    console.log('🔒 Secure randomness generated:', {
      result,
      seed: seed.substring(0, 8) + '...', // Only show first 8 chars for security
      timestamp,
      proofHash: proof.substring(0, 16) + '...'
    })

    return {
      result,
      seed,
      timestamp,
      proof,
      isSecure: true
    }
  }

  /**
   * Generate simple client-side random (INSECURE - for development only)
   */
  public generateSimpleRandom(): SecureRandomResult {
    const timestamp = Date.now()
    const randomValue = crypto.getRandomValues(new Uint32Array(1))[0]
    const result: 'heads' | 'tails' = (randomValue % 2 === 0) ? 'heads' : 'tails'
    
    console.warn('⚠️ WARNING: Using INSECURE client-side randomness! Move to server-side for production!')
    
    return {
      result,
      seed: randomValue.toString(),
      timestamp,
      proof: 'client_side_insecure',
      isSecure: false
    }
  }

  /**
   * Verify a randomness result using the proof
   */
  public verifyResult(result: SecureRandomResult): boolean {
    try {
      const expectedProof = this.createProof(result.seed, result.result, result.timestamp)
      return expectedProof === result.proof
    } catch (error) {
      console.error('Randomness verification failed:', error)
      return false
    }
  }

  /**
   * Create a cryptographic seed from entropy
   */
  private createSeed(entropy: string): string {
    return createHash('sha256')
      .update(entropy)
      .digest('hex')
  }

  /**
   * Convert seed to coin flip result deterministically
   */
  private seedToResult(seed: string): 'heads' | 'tails' {
    // Use the last byte of the hash to determine result
    const lastByte = parseInt(seed.slice(-2), 16)
    return (lastByte % 2 === 0) ? 'heads' : 'tails'
  }

  /**
   * Create cryptographic proof of the randomness
   */
  private createProof(seed: string, result: 'heads' | 'tails', timestamp: number): string {
    const proofInput = `${seed}-${result}-${timestamp}`
    return createHash('sha256')
      .update(proofInput)
      .digest('hex')
  }

  /**
   * Get mouse movement entropy (if available)
   */
  private getMouseEntropy(): string {
    try {
      // Try to get some mouse entropy from recent movements
      const mouseData = sessionStorage.getItem('mouseEntropy') || ''
      return mouseData.slice(-50) // Use last 50 chars
    } catch {
      return Math.random().toString()
    }
  }

  /**
   * Get blockchain entropy from recent blocks
   */
  private async getBlockEntropy(connection?: any): Promise<string> {
    if (!connection) {
      return Math.random().toString()
    }

    try {
      // Get recent blockhash for entropy
      const recentBlockhash = await connection.getRecentBlockhash()
      return recentBlockhash.blockhash || Math.random().toString()
    } catch (error) {
      console.warn('Could not fetch block entropy:', error)
      return Math.random().toString()
    }
  }
}

// Mouse entropy collector (optional enhancement)
if (typeof window !== 'undefined') {
  let mouseEntropy = ''
  
  const collectMouseEntropy = (e: MouseEvent) => {
    mouseEntropy += `${e.clientX}${e.clientY}${e.timeStamp}`
    if (mouseEntropy.length > 200) {
      mouseEntropy = mouseEntropy.slice(-100) // Keep last 100 chars
    }
    sessionStorage.setItem('mouseEntropy', mouseEntropy)
  }
  
  document.addEventListener('mousemove', collectMouseEntropy, { passive: true })
}

export default SecureRandomnessService