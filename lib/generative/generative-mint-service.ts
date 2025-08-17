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
      
      // Step 5: Mint the actual NFT
      const mintStart = Date.now()
      const nftMintResult = await this.nftService.mintGeckoNFT(wallet, {
        id: gecko.id,
        name: gecko.name,
        image: this.pinataService.getIpfsUri(imageIpfsHash),
        metadata: this.pinataService.getIpfsUri(metadataIpfsHash),
        available: true
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
}

export default GenerativeMintService