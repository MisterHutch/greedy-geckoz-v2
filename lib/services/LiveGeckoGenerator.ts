// Live Gecko Generator Service for Production Minting
// Adapts your local generator for server-side API use

import { createCanvas, loadImage, Image } from 'canvas';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Types for our gecko data
export interface GeckoTraits {
  Background: string;
  Skin: string;
  Eyez: string;
  Outfit: string;
  Head: string;
  Armz: string;
}

export interface GeneratedGecko {
  id: number;
  name: string;
  traits: GeckoTraits;
  rarityScore: number;
  isUltraRare: boolean;
  imageBuffer?: Buffer;
  traitsHash: string;
}

export interface MintResult {
  success: boolean;
  gecko?: GeneratedGecko;
  error?: string;
  imageUrl?: string;
  metadataUrl?: string;
  nftMint?: string;
}

export class LiveGeckoGenerator {
  private layerPaths = new Map<string, string>();
  private imageCache = new Map<string, Image>();
  private traitSystem: any[];
  private isInitialized = false;
  
  // Configuration
  private readonly LAYERS_SOURCE = 'C:/Users/Hutch/OneDrive/Pictures/GreedyGeckoz_Layers';
  private readonly CANVAS_SIZE = 512;
  
  constructor() {
    this.traitSystem = [];
  }

  /**
   * Initialize the generator - call this once at server startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🔧 Initializing LiveGeckoGenerator...');
    
    try {
      // Load trait system from your generated file
      const traitSystemPath = path.join(process.cwd(), 'new-trait-system.json');
      const traitData = fs.readFileSync(traitSystemPath, 'utf8');
      this.traitSystem = JSON.parse(traitData);
      
      // Discover and map all layer file paths
      await this.discoverLayerPaths();
      
      // Pre-load common layers into memory for performance
      await this.preloadCommonLayers();
      
      this.isInitialized = true;
      console.log('✅ LiveGeckoGenerator initialized successfully');
      console.log(`📊 Found ${this.layerPaths.size} layer files`);
      
    } catch (error) {
      console.error('❌ Failed to initialize LiveGeckoGenerator:', error);
      throw error;
    }
  }

  /**
   * Discover and map all layer file paths
   */
  private async discoverLayerPaths(): Promise<void> {
    const rarityFolders = ['Common', 'Rare', 'Super Rare', 'Legendary'];
    const categories = ['Background', 'Skin', 'Eyez', 'Outfit', 'Head', 'Armz'];
    
    for (const category of categories) {
      const categoryPath = path.join(this.LAYERS_SOURCE, category);
      
      if (!fs.existsSync(categoryPath)) {
        console.warn(`⚠️  Category folder not found: ${category}`);
        continue;
      }
      
      for (const rarityFolder of rarityFolders) {
        const rarityPath = path.join(categoryPath, rarityFolder);
        
        if (!fs.existsSync(rarityPath)) continue;
        
        const files = fs.readdirSync(rarityPath).filter(f => f.endsWith('.png'));
        
        for (const file of files) {
          const traitName = path.basename(file, '.png');
          const filePath = path.join(rarityPath, file);
          const key = `${category}/${traitName}`;
          
          this.layerPaths.set(key, filePath);
        }
      }
    }
  }

  /**
   * Pre-load common layers for better performance
   */
  private async preloadCommonLayers(): Promise<void> {
    console.log('📦 Pre-loading common layers...');
    
    // Load the most common combinations first
    const commonTraits = [
      'Background/Aquamarine', 'Background/Seafoam',
      'Skin/Green', 'Skin/Pale Cerulean',
      'Eyez/Afraid', 'Eyez/Angry', 'Eyez/Complacent'
    ];
    
    let loaded = 0;
    for (const trait of commonTraits) {
      const filePath = this.layerPaths.get(trait);
      if (filePath && fs.existsSync(filePath)) {
        try {
          const image = await loadImage(filePath);
          this.imageCache.set(filePath, image);
          loaded++;
        } catch (error) {
          console.warn(`⚠️  Failed to preload ${trait}:`, error);
        }
      }
    }
    
    console.log(`📦 Pre-loaded ${loaded} common layers`);
  }

  /**
   * Generate a completely unique gecko
   */
  async generateUniqueGecko(geckoId: number, existingHashes?: Set<string>): Promise<GeneratedGecko> {
    if (!this.isInitialized) {
      throw new Error('Generator not initialized. Call initialize() first.');
    }
    
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const gecko = this.generateRandomGecko(geckoId);
      
      // Check if this combination already exists
      if (!existingHashes || !existingHashes.has(gecko.traitsHash)) {
        return gecko;
      }
      
      attempts++;
    }
    
    throw new Error(`Failed to generate unique gecko after ${maxAttempts} attempts`);
  }

  /**
   * Generate random gecko with traits (adapted from your local generator)
   */
  private generateRandomGecko(geckoId: number): GeneratedGecko {
    const selectedTraits: GeckoTraits = {
      Background: '',
      Skin: '',
      Eyez: '',
      Outfit: '',
      Head: '',
      Armz: ''
    };
    
    const selectedLayers: Array<{
      category: string;
      trait: string;
      zIndex: number;
      rarity: number;
    }> = [];
    
    let rarityScore = 0;

    // Generate traits for each category
    for (const category of this.traitSystem) {
      const selectedTrait = this.selectWeightedRandomTrait(category);
      selectedTraits[category.name as keyof GeckoTraits] = selectedTrait.name;
      
      if (selectedTrait.name !== 'None') {
        selectedLayers.push({
          category: category.name,
          trait: selectedTrait.name,
          zIndex: selectedTrait.zIndex,
          rarity: selectedTrait.rarity
        });
      }
      
      rarityScore += (100 - selectedTrait.rarity);
    }

    // Sort layers by zIndex for proper rendering
    selectedLayers.sort((a, b) => a.zIndex - b.zIndex);

    // Create traits hash for uniqueness checking
    const traitsHash = this.hashTraits(selectedTraits);

    return {
      id: geckoId,
      name: `Greedy Gecko #${geckoId}`,
      traits: selectedTraits,
      rarityScore: Math.round(rarityScore),
      isUltraRare: this.isUltraRare(selectedTraits),
      traitsHash
    };
  }

  /**
   * Weighted random trait selection (same logic as your local generator)
   */
  private selectWeightedRandomTrait(category: any) {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const layer of category.layers) {
      cumulativeWeight += layer.rarity;
      if (random <= cumulativeWeight) {
        return layer;
      }
    }

    return category.layers[category.layers.length - 1];
  }

  /**
   * Compose gecko image from layers (adapted from your local generator)
   */
  async composeGeckoImage(gecko: GeneratedGecko): Promise<Buffer> {
    const canvas = createCanvas(this.CANVAS_SIZE, this.CANVAS_SIZE);
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get layers in proper z-index order
    const layersToRender = [];
    
    for (const [category, trait] of Object.entries(gecko.traits)) {
      if (trait && trait !== 'None') {
        const pathKey = `${category}/${trait}`;
        const filePath = this.layerPaths.get(pathKey);
        
        if (filePath) {
          layersToRender.push({ category, trait, filePath });
        } else {
          console.warn(`⚠️  Layer not found: ${pathKey}`);
        }
      }
    }

    // Load and composite each layer
    for (const layer of layersToRender) {
      const image = await this.loadLayerImage(layer.filePath);
      if (image) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }
    }

    return canvas.toBuffer('image/png');
  }

  /**
   * Load layer image with caching
   */
  private async loadLayerImage(filePath: string): Promise<Image | null> {
    // Check cache first
    if (this.imageCache.has(filePath)) {
      return this.imageCache.get(filePath)!;
    }

    try {
      const image = await loadImage(filePath);
      
      // Cache the image for future use
      this.imageCache.set(filePath, image);
      
      return image;
    } catch (error) {
      console.error(`❌ Failed to load layer ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Check if gecko has ultra-rare traits
   */
  private isUltraRare(traits: GeckoTraits): boolean {
    const ultraRareTraits = [
      'Trippy', 'Zombie', 'Laser', 'Evil', 'Heaven', 'War Suit', 
      'Studded Diamonds', 'Studded Diamondsv2', 'Biloba Flower', 
      'Jasmin', 'Parchment', 'Salmon', 'Viking Helmet', 'Myth',
      'Ember', 'Rose', 'Bored', 'Disgusted', 'Hopeful'
    ];
    
    return Object.values(traits).some(trait => 
      ultraRareTraits.includes(trait)
    );
  }

  /**
   * Create a hash of traits for uniqueness checking
   */
  private hashTraits(traits: GeckoTraits): string {
    const traitString = Object.entries(traits)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, trait]) => `${category}:${trait}`)
      .join('|');
    
    return crypto.createHash('md5').update(traitString).digest('hex');
  }

  /**
   * Create NFT metadata
   */
  createMetadata(gecko: GeneratedGecko, imageUrl: string) {
    const attributes = Object.entries(gecko.traits)
      .filter(([_, value]) => value && value !== 'None')
      .map(([trait_type, value]) => ({
        trait_type,
        value
      }));

    // Add computed attributes
    attributes.push(
      { trait_type: 'Rarity Score', value: gecko.rarityScore.toString() },
      { trait_type: 'Ultra Rare', value: gecko.isUltraRare ? 'Yes' : 'No' }
    );

    return {
      name: gecko.name,
      symbol: 'GECKO',
      description: `${gecko.name} - A degen gecko from the Greedy Geckoz collection! This interdimensional gecko is ready to moon with you! 🦎🚀${gecko.isUltraRare ? ' ⭐ ULTRA RARE' : ''}`,
      image: imageUrl,
      attributes,
      properties: {
        files: [
          {
            uri: imageUrl,
            type: 'image/png'
          }
        ],
        category: 'image',
        collection: {
          name: 'Greedy Geckoz ∞',
          family: 'Greedy Geckoz'
        }
      },
      external_url: 'https://greedygeckoz.com'
    };
  }

  /**
   * Get generator statistics
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      totalLayers: this.layerPaths.size,
      cachedImages: this.imageCache.size,
      traitCategories: this.traitSystem.length
    };
  }
}

// Export singleton instance
export const liveGeckoGenerator = new LiveGeckoGenerator();