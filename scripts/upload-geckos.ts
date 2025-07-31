#!/usr/bin/env node

import { createPinataUploader, PinataUploader } from '../lib/ipfs/pinata-uploader'
import { metadataProcessor, GeckoAsset } from '../lib/metadata/metadata-processor'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

interface UploadProgress {
  phase: 'images' | 'metadata' | 'complete'
  completed: number
  total: number
  current?: string
  errors: string[]
}

class GeckoUploader {
  private uploader: PinataUploader
  private assetsDir: string
  private outputDir: string
  private progress: UploadProgress

  constructor() {
    const apiKey = process.env.PINATA_API_KEY
    const secretKey = process.env.PINATA_SECRET_API_KEY

    if (!apiKey || !secretKey) {
      throw new Error('Missing Pinata API credentials. Set PINATA_API_KEY and PINATA_SECRET_API_KEY in .env.local')
    }

    this.uploader = createPinataUploader(apiKey, secretKey)
    this.assetsDir = path.join(process.cwd(), 'assets', 'images')
    this.outputDir = path.join(process.cwd(), 'assets', 'uploaded')
    
    this.progress = {
      phase: 'images',
      completed: 0,
      total: 0,
      errors: []
    }

    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  /**
   * Main upload process
   */
  async uploadCollection(): Promise<void> {
    console.log('🦎 Starting Greedy Geckoz upload to IPFS...\n')

    try {
      // Test connection
      console.log('Testing Pinata connection...')
      const isConnected = await this.uploader.testAuthentication()
      if (!isConnected) {
        throw new Error('Failed to connect to Pinata. Check your API keys.')
      }
      console.log('✅ Connected to Pinata\n')

      // Get all PNG files
      const imageFiles = this.getImageFiles()
      console.log(`Found ${imageFiles.length} Gecko images`)

      if (imageFiles.length === 0) {
        throw new Error(`No PNG files found in ${this.assetsDir}`)
      }

      // Upload images
      console.log('\n📸 Uploading images to IPFS...')
      const imageResults = await this.uploadImages(imageFiles)
      
      // Generate and upload metadata
      console.log('\n📄 Generating and uploading metadata...')
      await this.generateAndUploadMetadata(imageResults)

      console.log('\n🎉 Upload complete!')
      console.log(`✅ ${imageResults.size} images uploaded`)
      console.log(`✅ ${imageResults.size} metadata files uploaded`)
      
      if (this.progress.errors.length > 0) {
        console.log(`⚠️  ${this.progress.errors.length} errors occurred:`)
        this.progress.errors.forEach(error => console.log(`   - ${error}`))
      }

    } catch (error) {
      console.error('❌ Upload failed:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  }

  /**
   * Upload all images
   */
  private async uploadImages(imageFiles: string[]): Promise<Map<string, { ipfsHash: string; geckoId: string }>> {
    this.progress.phase = 'images'
    this.progress.total = imageFiles.length
    this.progress.completed = 0

    const results = new Map<string, { ipfsHash: string; geckoId: string }>()

    const uploadResults = await this.uploader.uploadBatch(imageFiles, {
      concurrent: 3, // Reduced to avoid rate limits
      onProgress: (completed, total, current) => {
        this.progress.completed = completed
        this.progress.current = current
        
        const fileName = path.basename(current)
        const percentage = Math.round((completed / total) * 100)
        process.stdout.write(`\r   Uploading: ${fileName} (${completed}/${total}) ${percentage}%`)
      },
      onError: (error, filePath) => {
        const fileName = path.basename(filePath)
        this.progress.errors.push(`${fileName}: ${error.message}`)
      }
    })

    console.log('') // New line after progress

    // Process results
    uploadResults.forEach((result, filePath) => {
      const fileName = path.basename(filePath, '.png')
      results.set(fileName, {
        ipfsHash: result.IpfsHash,
        geckoId: fileName
      })
    })

    // Save image mapping
    const imageMapping = Object.fromEntries(
      Array.from(results.entries()).map(([geckoId, { ipfsHash }]) => [
        geckoId,
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      ])
    )

    fs.writeFileSync(
      path.join(this.outputDir, 'image-mapping.json'),
      JSON.stringify(imageMapping, null, 2)
    )

    console.log(`💾 Image mapping saved to ${path.join(this.outputDir, 'image-mapping.json')}`)

    return results
  }

  /**
   * Generate metadata and upload to IPFS
   */
  private async generateAndUploadMetadata(imageResults: Map<string, { ipfsHash: string; geckoId: string }>): Promise<void> {
    this.progress.phase = 'metadata'
    this.progress.total = imageResults.size
    this.progress.completed = 0

    const metadataMapping: Record<string, string> = {}

    for (const [geckoId, { ipfsHash }] of imageResults) {
      try {
        // Generate metadata
        const metadata = this.generateMetadata(geckoId, ipfsHash)
        
        // Upload metadata
        const metadataResult = await this.uploader.uploadMetadata(
          metadata,
          `${geckoId}.json`
        )

        metadataMapping[geckoId] = `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`
        
        this.progress.completed++
        const percentage = Math.round((this.progress.completed / this.progress.total) * 100)
        process.stdout.write(`\r   Metadata: Gecko #${geckoId} (${this.progress.completed}/${this.progress.total}) ${percentage}%`)

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        this.progress.errors.push(`Gecko #${geckoId} metadata: ${error instanceof Error ? error.message : error}`)
      }
    }

    console.log('') // New line after progress

    // Save metadata mapping
    fs.writeFileSync(
      path.join(this.outputDir, 'metadata-mapping.json'),
      JSON.stringify(metadataMapping, null, 2)
    )

    console.log(`💾 Metadata mapping saved to ${path.join(this.outputDir, 'metadata-mapping.json')}`)
  }

  /**
   * Generate metadata for a gecko
   */
  private generateMetadata(geckoId: string, imageIpfsHash: string): any {
    const geckoNumber = parseInt(geckoId)
    
    return {
      name: `Greedy Gecko #${geckoId}`,
      description: "A greedy little gecko ready to lose money on Solana. Part of the exclusive 957 Gecko collection where degens gather to embrace beautiful financial chaos.",
      image: `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`,
      attributes: this.generateAttributes(geckoNumber),
      properties: {
        files: [
          {
            uri: `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`,
            type: "image/png"
          }
        ],
        category: "image",
        creators: [
          {
            address: process.env.NEXT_PUBLIC_MINT_AUTHORITY || "",
            share: 100
          }
        ]
      },
      collection: {
        name: "Greedy Geckoz",
        family: "GreedyGeckoz"
      }
    }
  }

  /**
   * Generate random attributes for gecko
   */
  private generateAttributes(geckoNumber: number): Array<{ trait_type: string; value: string }> {
    const backgrounds = ['Cosmic Purple', 'Neon Green', 'Void Black', 'Solana Blue', 'Rug Red', 'FOMO Gold']
    const eyes = ['Laser Vision', 'Diamond Eyes', 'Void Stare', 'Degen Gaze', 'NGMI Look', 'Hopium High']
    const hats = ['Diamond Crown', 'Cope Hat', 'Lambo Cap', 'Paper Hands Beanie', 'Moon Helmet', 'None']
    const accessories = ['Gold Chain', 'Loss Tracker', 'Hopium Pipe', 'Degen Badge', 'Rug Detector', 'None']
    
    // Use gecko number for consistent randomness
    const seed = geckoNumber
    
    return [
      { 
        trait_type: 'Background', 
        value: backgrounds[seed % backgrounds.length] 
      },
      { 
        trait_type: 'Eyes', 
        value: eyes[(seed * 2) % eyes.length] 
      },
      { 
        trait_type: 'Hat', 
        value: hats[(seed * 3) % hats.length] 
      },
      { 
        trait_type: 'Accessory', 
        value: accessories[(seed * 5) % accessories.length] 
      },
      { 
        trait_type: 'Rarity', 
        value: this.calculateRarity(geckoNumber) 
      },
      {
        trait_type: 'Degen Level',
        value: this.getDegenLevel(geckoNumber)
      }
    ]
  }

  /**
   * Calculate rarity based on gecko number
   */
  private calculateRarity(geckoNumber: number): string {
    if (geckoNumber <= 10) return 'Genesis'
    if (geckoNumber > 2200) return 'Legendary'
    if (geckoNumber % 100 === 0) return 'Epic'
    if (geckoNumber % 50 === 0) return 'Rare'
    if (geckoNumber % 10 === 0) return 'Uncommon'
    return 'Common'
  }

  /**
   * Get degen level
   */
  private getDegenLevel(geckoNumber: number): string {
    const levels = ['Rookie', 'Degen', 'Veteran', 'Chad', 'Diamond Hands', 'Legendary Degen']
    return levels[geckoNumber % levels.length]
  }

  /**
   * Get all PNG files from assets directory
   */
  private getImageFiles(): string[] {
    if (!fs.existsSync(this.assetsDir)) {
      throw new Error(`Assets directory not found: ${this.assetsDir}`)
    }

    return fs.readdirSync(this.assetsDir)
      .filter(file => file.endsWith('.png'))
      .map(file => path.join(this.assetsDir, file))
      .sort((a, b) => {
        const numA = parseInt(path.basename(a, '.png'))
        const numB = parseInt(path.basename(b, '.png'))
        return numA - numB
      })
  }
}

// Run the upload if called directly
if (require.main === module) {
  const uploader = new GeckoUploader()
  uploader.uploadCollection()
    .then(() => {
      console.log('\n🎊 All done! Your Geckos are now on IPFS!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💀 Upload failed:', error)
      process.exit(1)
    })
}

export { GeckoUploader }