// Image Composition Service for Layer-Based Gecko Generation
// Combines trait layers into final gecko image

import * as fs from 'fs'
import * as path from 'path'
import { GeneratedGecko } from './gecko-generator'

// Note: For production, you'd want to use a proper image processing library
// like 'sharp' or 'canvas' for server-side image composition
// For now, this is a framework that shows the approach

export interface CompositionResult {
  success: boolean
  imageBuffer?: Buffer
  error?: string
  layersUsed: string[]
}

export class ImageCompositor {
  private layersBasePath: string

  constructor(layersBasePath?: string) {
    // Default to the actual GreedyGeckoz_Layers directory
    this.layersBasePath = layersBasePath || 'C:\\Users\\Hutch\\OneDrive\\Pictures\\GreedyGeckoz_Layers'
  }

  /**
   * Compose a gecko image from its selected traits
   * This is called during mint to create the actual NFT image
   */
  async composeGeckoImage(gecko: GeneratedGecko): Promise<CompositionResult> {
    try {
      console.log(`🎨 Composing gecko #${gecko.id} with traits:`, gecko.traits)
      
      const layersToCompose = this.getLayerPaths(gecko)
      console.log(`📝 Layers to compose: ${layersToCompose.length}`)

      // Validate all layer files exist
      const missingLayers = await this.validateLayers(layersToCompose)
      if (missingLayers.length > 0) {
        console.warn(`⚠️ Missing layer files: ${missingLayers.join(', ')}`)
        // In development, we can continue without these layers
        // In production, you'd want to handle this more gracefully
      }

      // For now, return a placeholder implementation
      // In production, this would use image processing library
      const imageBuffer = await this.createPlaceholderImage(gecko)

      return {
        success: true,
        imageBuffer,
        layersUsed: layersToCompose.filter(layer => !missingLayers.includes(layer))
      }

    } catch (error) {
      console.error(`❌ Error composing gecko #${gecko.id}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image composition failed',
        layersUsed: []
      }
    }
  }

  /**
   * Get the file paths for all layers needed for this gecko
   */
  private getLayerPaths(gecko: GeneratedGecko): string[] {
    const layerPaths: string[] = []

    // Add layers in z-index order (already sorted by generator)
    for (const [categoryName, traitName] of Object.entries(gecko.traits)) {
      if (traitName === 'None' || !traitName) continue

      // Convert trait names to file paths
      const layerPath = this.getLayerFilePath(categoryName, traitName)
      if (layerPath) {
        layerPaths.push(layerPath)
      }
    }

    return layerPaths
  }

  /**
   * Convert trait category and name to actual file path
   * Uses the exact structure from gecko-generator.ts
   */
  private getLayerFilePath(categoryName: string, traitName: string): string | null {
    if (traitName === 'None' || !traitName) return null
    
    // The imagePath is already set in the gecko-generator trait system
    // We just need to join it with the base path
    // This method is used when we have the full imagePath from the trait system
    return null // This will be handled differently in getLayerPaths
  }

  /**
   * Validate that all required layer files exist
   */
  private async validateLayers(layerPaths: string[]): Promise<string[]> {
    const missingLayers: string[] = []

    for (const layerPath of layerPaths) {
      try {
        await fs.promises.access(layerPath, fs.constants.F_OK)
      } catch {
        missingLayers.push(layerPath)
      }
    }

    return missingLayers
  }

  /**
   * Create a placeholder image for development
   * In production, replace with actual image composition using Canvas or Sharp
   */
  private async createPlaceholderImage(gecko: GeneratedGecko): Promise<Buffer> {
    // Create a simple colored rectangle as placeholder
    // In production, this would composite the actual layer images
    
    const width = 512
    const height = 512
    
    // Generate a unique color based on gecko traits
    const colorHash = this.generateColorFromTraits(gecko.traits)
    
    // Create a simple SVG as placeholder
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${colorHash.background}"/>
        <circle cx="256" cy="200" r="80" fill="${colorHash.body}"/>
        <circle cx="230" cy="180" r="15" fill="${colorHash.eyes}"/>
        <circle cx="282" cy="180" r="15" fill="${colorHash.eyes}"/>
        <text x="256" y="350" text-anchor="middle" font-size="20" font-family="Arial" fill="white">
          ${gecko.name}
        </text>
        <text x="256" y="380" text-anchor="middle" font-size="14" font-family="Arial" fill="white">
          Rarity: ${gecko.rarityScore}
        </text>
        <text x="256" y="400" text-anchor="middle" font-size="12" font-family="Arial" fill="white">
          Generated: ${new Date().toISOString().split('T')[0]}
        </text>
      </svg>
    `

    return Buffer.from(svgContent, 'utf-8')
  }

  /**
   * Generate colors based on gecko traits for placeholder
   */
  private generateColorFromTraits(traits: Record<string, string>): {
    background: string
    body: string
    eyes: string
  } {
    // Simple color mapping based on traits
    const backgroundColors = {
      'Cosmic Purple': '#6B46C1',
      'Degen Green': '#059669',
      'Moon Base': '#374151',
      'Trippy Swirl': '#EC4899',
      'Diamond Matrix': '#3B82F6',
      'Basic Blue': '#1E40AF'
    }

    const bodyColors = {
      'Classic Green': '#10B981',
      'Golden Gecko': '#F59E0B',
      'Diamond Skin': '#60A5FA',
      'Rainbow Scales': '#8B5CF6',
      'Zombie Green': '#22C55E',
      'Alien Blue': '#06B6D4',
      'Lava Red': '#EF4444',
      'Invisible': 'rgba(255,255,255,0.3)'
    }

    const eyeColors = {
      'Normal Eyes': '#000000',
      'Laser Eyes': '#DC2626',
      'Diamond Eyes': '#3B82F6',
      'Trippy Spiral': '#8B5CF6',
      'Dead Eyes': '#6B7280',
      'Cyclops': '#DC2626',
      'Third Eye': '#7C3AED',
      'No Eyes': 'transparent'
    }

    return {
      background: backgroundColors[traits.Background as keyof typeof backgroundColors] || '#1F2937',
      body: bodyColors[traits.Body as keyof typeof bodyColors] || '#10B981',
      eyes: eyeColors[traits.Eyes as keyof typeof eyeColors] || '#000000'
    }
  }

  /**
   * Setup directory structure for trait layers
   */
  async setupLayerDirectories(): Promise<void> {
    const categories = ['backgrounds', 'bodies', 'eyes', 'hats', 'accessories']
    
    for (const category of categories) {
      const dirPath = path.join(this.layersBasePath, category)
      
      try {
        await fs.promises.access(dirPath)
      } catch {
        await fs.promises.mkdir(dirPath, { recursive: true })
        console.log(`📁 Created layer directory: ${dirPath}`)
      }
    }
  }

  /**
   * Get composition statistics
   */
  getCompositionStats(): {
    layersBasePath: string
    supportedFormats: string[]
    maxLayers: number
  } {
    return {
      layersBasePath: this.layersBasePath,
      supportedFormats: ['PNG', 'SVG'],
      maxLayers: 10
    }
  }
}

export default ImageCompositor