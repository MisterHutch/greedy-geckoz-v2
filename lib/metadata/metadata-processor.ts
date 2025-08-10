export interface Asset {
  id: number
  name: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

// Alias for backward compatibility
export type GeckoAsset = Asset

interface ValidationResult {
  valid: boolean
  errors: string[]
}

class MetadataProcessor {
  private assets: Map<number, Asset> = new Map()

  async loadAssetsFromZip(file: File): Promise<void> {
    throw new Error('Zip processing not yet implemented. Please use JSON file upload.')
  }

  async loadAssetsFromJson(files: File[]): Promise<void> {
    this.assets.clear()
    
    for (const file of files) {
      try {
        const content = await file.text()
        const metadata = JSON.parse(content)
        
        // Extract ID from filename (e.g., "1.json" -> 1)
        const fileName = file.name.replace('.json', '')
        const id = parseInt(fileName)
        
        if (isNaN(id)) {
          throw new Error(`Invalid filename: ${file.name}. Expected format: {number}.json`)
        }
        
        this.assets.set(id, {
          id,
          name: metadata.name || `Gecko #${id}`,
          image: metadata.image || '',
          attributes: metadata.attributes || []
        })
      } catch (error) {
        throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  validateAssets(): ValidationResult {
    const errors: string[] = []
    
    if (this.assets.size === 0) {
      errors.push('No assets loaded')
      return { valid: false, errors }
    }

    // Check for missing IDs in sequence
    const maxId = Math.max(...this.assets.keys())
    for (let i = 1; i <= maxId; i++) {
      if (!this.assets.has(i)) {
        errors.push(`Missing asset with ID ${i}`)
      }
    }

    // Validate each asset
    for (const [id, asset] of this.assets.entries()) {
      if (!asset.name) {
        errors.push(`Asset ${id} is missing name`)
      }
      if (!asset.image) {
        errors.push(`Asset ${id} is missing image`)
      }
      if (!asset.attributes || asset.attributes.length === 0) {
        errors.push(`Asset ${id} is missing attributes`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  getAssetCount(): number {
    return this.assets.size
  }

  getAssets(): Map<number, Asset> {
    return new Map(this.assets)
  }
}

export const metadataProcessor = new MetadataProcessor()