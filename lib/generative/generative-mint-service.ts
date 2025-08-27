// Generative Mint Service
// Integrates layer-based gecko generation with the existing mint system

import { Connection } from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'
import GeckoGenerator, { GeneratedGecko } from './gecko-generator'
import ImageCompositor from './image-compositor'
import PinataService from '../ipfs/pinata-service'
import MetaplexNFTService, { NFTMintResult } from '../metaplex/nft-service'

export interface GenerativeMintResult {
  success: boolean
  gecko?: GeneratedGecko
  imageIpfsHash?: string
  metadataIpfsHash?: string
  nftMintResult?: NFTMintResult
  error?: string
  compositionTime?: number
  uploadTime?: number
  mintTime?: number
}

export class GenerativeMintService {
  private generator: GeckoGenerator
  private compositor: ImageCompositor
  private pinataService: PinataService
  private nftService: MetaplexNFTService
  private connection: Connection

  constructor(connection: Connection) {
    this.connection = connection
    this.generator = new GeckoGenerator()
    this.compositor = new ImageCompositor()
    this.pinataService = new PinataService()
    this.nftService = new MetaplexNFTService(connection)
    
    // Set collection address if available
    const collectionAddress = process.env.NEXT_PUBLIC_COLLECTION_NFT_ADDRESS
    if (collectionAddress && collectionAddress !== 'YOUR_COLLECTION_NFT_ADDRESS') {
      this.nftService.setCollectionAddress(collectionAddress)
    }
  }

  /**
   * Generate and mint a completely unique gecko NFT
   * This is the main function called during mint
   */
  async generateAndMintGecko(
    wallet: WalletContextState, 
    mintId: number
  ): Promise<GenerativeMintResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🎲 Generating unique gecko #${mintId}...`)
      
      // Check if IPFS is configured
      const hasIpfsConfig = process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY
      
      if (!hasIpfsConfig) {
        console.log('⚠️ IPFS not configured, using mock mode for testing...')
        return this.generateMockGeckoNFT(wallet, mintId)
      }
      
      // Step 1: Generate random traits
      const gecko = this.generator.generateRandomGecko(mintId)
      console.log(`✅ Generated gecko with traits:`, gecko.traits)
      console.log(`⭐ Rarity score: ${gecko.rarityScore}`)
      
      // Step 2: Compose image from layers
      const compositionStart = Date.now()
      const compositionResult = await this.compositor.composeGeckoImage(gecko)
      const compositionTime = Date.now() - compositionStart
      
      if (!compositionResult.success || !compositionResult.imageBuffer) {
        throw new Error(`Image composition failed: ${compositionResult.error}`)
      }
      
      console.log(`🎨 Image composed in ${compositionTime}ms using layers:`, compositionResult.layersUsed)
      
      // Step 3: Upload image to IPFS
      const uploadStart = Date.now()
      const imageIpfsHash = await this.pinataService.uploadGeckoImage(
        compositionResult.imageBuffer, 
        gecko.id
      )
      console.log(`📤 Image uploaded to IPFS: ${imageIpfsHash}`)
      
      // Step 4: Create and upload metadata
      const metadataWithImage = {
        ...gecko.metadata,
        image: this.pinataService.getIpfsUri(imageIpfsHash),
        external_url: `https://greedygeckoz.com/gecko/${gecko.id}`,
        animation_url: null, // Could add animations later
        attributes: [
          ...gecko.metadata.attributes,
          {
            trait_type: 'Rarity Score',
            value: gecko.rarityScore.toString()
          },
          {
            trait_type: 'Generation',
            value: 'Generative 2025'
          },
          {
            trait_type: 'Ultra Rare',
            value: this.generator.isUltraRare(gecko) ? 'Yes' : 'No'
          }
        ]
      }
      
      const metadataIpfsHash = await this.pinataService.uploadGeckoMetadata(
        metadataWithImage as any,
        gecko.id
      )
      const uploadTime = Date.now() - uploadStart
      console.log(`📤 Metadata uploaded to IPFS: ${metadataIpfsHash}`)
      
      // Step 5: Mint the actual NFT with generated metadata
      const mintStart = Date.now()
      const nftMintResult = await this.nftService.mintGeckoNFT(wallet, {
        id: gecko.id,
        name: gecko.name,
        image: this.pinataService.getIpfsUri(imageIpfsHash),
        metadata: this.pinataService.getIpfsUri(metadataIpfsHash),
        available: true,
        // Pass the full gecko object for proper metadata
        generatedGecko: gecko
      })
      const mintTime = Date.now() - mintStart
      
      if (!nftMintResult.success) {
        throw new Error(`NFT minting failed: ${nftMintResult.error}`)
      }
      
      console.log(`🎉 Generative gecko #${gecko.id} minted successfully!`)
      console.log(`💎 Total time: ${Date.now() - startTime}ms`)
      
      // Log ultra-rare detection
      if (this.generator.isUltraRare(gecko)) {
        console.log(`🌟 ULTRA RARE GECKO DETECTED! #${gecko.id}`)
      }
      
      return {
        success: true,
        gecko,
        imageIpfsHash,
        metadataIpfsHash,
        nftMintResult,
        compositionTime,
        uploadTime,
        mintTime
      }
      
    } catch (error) {
      console.error(`❌ Generative mint failed for gecko #${mintId}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generative mint failed'
      }
    }
  }

  /**
   * Generate multiple unique geckos for bulk mints
   */
  async generateAndMintMultipleGeckos(
    wallet: WalletContextState,
    startId: number,
    quantity: number
  ): Promise<GenerativeMintResult[]> {
    const results: GenerativeMintResult[] = []
    
    for (let i = 0; i < quantity; i++) {
      const mintId = startId + i
      console.log(`🔄 Generating gecko ${i + 1}/${quantity} (ID: ${mintId})`)
      
      const result = await this.generateAndMintGecko(wallet, mintId)
      results.push(result)
      
      // Small delay to prevent overwhelming IPFS/blockchain
      if (i < quantity - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }

  /**
   * Preview a gecko generation without minting (for testing)
   */
  async previewGeckoGeneration(mockId: number): Promise<{
    gecko: GeneratedGecko
    rarityPercentage: number
    isUltraRare: boolean
  }> {
    const gecko = this.generator.generateRandomGecko(mockId)
    const rarityPercentage = this.generator.calculateRarityPercentage(gecko)
    const isUltraRare = this.generator.isUltraRare(gecko)
    
    return {
      gecko,
      rarityPercentage,
      isUltraRare
    }
  }

  /**
   * Get trait distribution statistics
   */
  getTraitDistribution(): Record<string, Record<string, number>> {
    return this.generator.getTraitDistribution()
  }

  /**
   * Setup the generative system (create directories, validate assets)
   */
  async setupGenerativeSystem(): Promise<void> {
    console.log('🔧 Setting up generative system...')
    
    // Setup layer directories
    await this.compositor.setupLayerDirectories()
    
    // Test Pinata connection
    const pinataConnected = await this.pinataService.testConnection()
    if (!pinataConnected) {
      console.warn('⚠️ Pinata connection test failed - check API keys')
    } else {
      console.log('✅ Pinata connection verified')
    }
    
    console.log('✅ Generative system setup complete')
  }

  /**
   * Get system statistics
   */
  getSystemStats(): {
    traitCategories: number
    totalTraitCombinations: number
    compositorStats: any
  } {
    const distribution = this.getTraitDistribution()
    const traitCategories = Object.keys(distribution).length
    
    // Calculate theoretical max combinations
    let totalCombinations = 1
    for (const [_, traits] of Object.entries(distribution)) {
      totalCombinations *= Object.keys(traits).length
    }
    
    return {
      traitCategories,
      totalTraitCombinations: totalCombinations,
      compositorStats: this.compositor.getCompositionStats()
    }
  }

  /**
   * Mock method for testing without IPFS
   */
  private async generateMockGeckoNFT(
    wallet: WalletContextState,
    mintId: number
  ): Promise<GenerativeMintResult> {
    try {
      console.log(`🧪 Mock mode: Creating test gecko #${mintId}`)
      
      // Generate gecko with traits but no image composition
      const gecko = this.generator.generateRandomGecko(mintId)
      console.log(`✅ Generated mock gecko with traits:`, gecko.traits)
      
      // Use a simple placeholder image for testing
      const mockImageUrl = `https://via.placeholder.com/400x400/00ff00/000000?text=Gecko+${mintId}`
      
      // Create simple metadata
      const mockMetadata = {
        name: gecko.name,
        symbol: "GECKO",
        description: gecko.metadata.description,
        image: mockImageUrl,
        attributes: gecko.metadata.attributes,
        properties: {
          files: [{ uri: mockImageUrl, type: "image/png" }],
          category: "image"
        }
      }
      
      // Mock IPFS hashes
      const mockImageHash = `Qm${Math.random().toString(36).substring(2, 15)}`
      const mockMetadataHash = `Qm${Math.random().toString(36).substring(2, 15)}`
      
      console.log(`🧪 Mock IPFS hashes generated: img=${mockImageHash}, meta=${mockMetadataHash}`)
      
      // Attempt to mint the NFT with mock metadata
      console.log(`🔨 Attempting to mint mock NFT for gecko #${gecko.id}...`)
      const nftMintResult = await this.nftService.mintGeckoNFT(wallet, {
        id: gecko.id,
        name: gecko.name,
        image: mockImageUrl,
        metadata: `https://gateway.pinata.cloud/ipfs/${mockMetadataHash}`,
        available: true,
        generatedGecko: { ...gecko, metadata: mockMetadata }
      })
      
      if (nftMintResult.success) {
        console.log(`✅ Mock NFT minted successfully!`)
        console.log(`📍 Mint Address: ${nftMintResult.mintAddress}`)
        console.log(`🏦 Token Account: ${nftMintResult.tokenAddress}`)
        console.log(`📋 TX Signature: ${nftMintResult.txSignature}`)
      } else {
        console.error(`❌ Mock NFT minting failed:`, nftMintResult.error)
        console.error(`🔍 Full NFT mint result:`, nftMintResult)
      }
      
      return {
        success: nftMintResult.success,
        gecko,
        imageIpfsHash: mockImageHash,
        metadataIpfsHash: mockMetadataHash,
        nftMintResult,
        compositionTime: 0,
        uploadTime: 0,
        mintTime: Date.now()
      }
      
    } catch (error) {
      console.error('❌ Mock gecko generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mock generation failed'
      }
    }
  }
}

export default GenerativeMintService