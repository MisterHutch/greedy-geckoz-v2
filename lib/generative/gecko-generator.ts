// Layer-Based Gecko Generation System
// More secure and truly generative approach

export interface TraitLayer {
  name: string
  rarity: number // 0-100 percentage chance
  imagePath: string
  zIndex: number // Layering order (lower = background)
}

export interface TraitCategory {
  name: string
  required: boolean
  layers: TraitLayer[]
}

export interface GeneratedGecko {
  id: number
  name: string
  traits: Record<string, string>
  rarityScore: number
  isUltraRare: boolean
  imageBuffer?: Buffer
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string
      rarity?: number
    }>
  }
}

// Define the trait system based on actual GreedyGeckoz layer structure
const GECKO_TRAIT_SYSTEM: TraitCategory[] = [
  {
    name: 'Background',
    required: true,
    layers: [
      // Common (50% total)
      { name: 'Aquamarine', rarity: 25, imagePath: 'Background/Common/Aquamarine.png', zIndex: 1 },
      { name: 'Seafoam', rarity: 25, imagePath: 'Background/Common/Seafoam.png', zIndex: 1 },
      
      // Rare (30% total)
      { name: 'Chill', rarity: 7.5, imagePath: 'Background/Rare/Chill.png', zIndex: 1 },
      { name: 'Driftwood', rarity: 7.5, imagePath: 'Background/Rare/Driftwood.png', zIndex: 1 },
      { name: 'Hopbush', rarity: 7.5, imagePath: 'Background/Rare/Hopbush.png', zIndex: 1 },
      { name: 'Sand', rarity: 7.5, imagePath: 'Background/Rare/Sand.png', zIndex: 1 },
      
      // Legendary (15% total)
      { name: 'Jasmin', rarity: 5, imagePath: 'Background/Legendary/Jasmin.png', zIndex: 1 },
      { name: 'Parchment', rarity: 5, imagePath: 'Background/Legendary/Parchment.png', zIndex: 1 },
      { name: 'Salmon', rarity: 5, imagePath: 'Background/Legendary/Salmon.png', zIndex: 1 },
      
      // Super Rare (5% total)
      { name: 'Biloba Flower', rarity: 0.7, imagePath: 'Background/Super Rare/Biloba Flower.png', zIndex: 1 },
      { name: 'Malibu', rarity: 0.7, imagePath: 'Background/Super Rare/Malibu.png', zIndex: 1 },
      { name: 'Minty', rarity: 0.7, imagePath: 'Background/Super Rare/Minty.png', zIndex: 1 },
      { name: 'Studded Diamonds', rarity: 0.7, imagePath: 'Background/Super Rare/Studded Diamonds.png', zIndex: 1 },
      { name: 'Studded Diamondsv2', rarity: 0.7, imagePath: 'Background/Super Rare/Studded Diamondsv2.png', zIndex: 1 },
      { name: 'Kollidz', rarity: 0.7, imagePath: 'Background/Super Rare/kollidz.png', zIndex: 1 },
      { name: 'Lateriast', rarity: 0.8, imagePath: 'Background/Super Rare/lateriast.png', zIndex: 1 }
    ]
  },
  {
    name: 'Skin',
    required: true,
    layers: [
      // Common (50%)
      { name: 'Green', rarity: 50, imagePath: 'Skin/Common/Green.png', zIndex: 2 },
      
      // Rare (30% total)
      { name: 'Corn', rarity: 15, imagePath: 'Skin/Rare/Corn.png', zIndex: 2 },
      { name: 'Rusty', rarity: 15, imagePath: 'Skin/Rare/Rusty.png', zIndex: 2 },
      
      // Legendary (15% total)
      { name: 'Ember', rarity: 5, imagePath: 'Skin/Legendary/Ember.png', zIndex: 2 },
      { name: 'Pale Cerulean', rarity: 5, imagePath: 'Skin/Legendary/Pale Cerulean.png', zIndex: 2 },
      { name: 'Rose', rarity: 5, imagePath: 'Skin/Legendary/Rose.png', zIndex: 2 },
      
      // Super Rare (5% total)
      { name: 'Trippy', rarity: 2.5, imagePath: 'Skin/Super Rare/Trippy.png', zIndex: 2 },
      { name: 'Zombie', rarity: 2.5, imagePath: 'Skin/Super Rare/Zombie.png', zIndex: 2 }
    ]
  },
  {
    name: 'Eyez',
    required: true,
    layers: [
      // Common (50%)
      { name: 'Afraid', rarity: 16.7, imagePath: 'Eyez/Common/Afraid.png', zIndex: 4 },
      { name: 'Angry', rarity: 16.7, imagePath: 'Eyez/Common/Angry.png', zIndex: 4 },
      { name: 'Complacent', rarity: 16.6, imagePath: 'Eyez/Common/Complacent.png', zIndex: 4 },
      
      // Rare (30% total)
      { name: 'Exhausted', rarity: 10, imagePath: 'Eyez/Rare/Exhausted.png', zIndex: 4 },
      { name: 'Terrified', rarity: 10, imagePath: 'Eyez/Rare/Terrified.png', zIndex: 4 },
      { name: 'Red Eye', rarity: 10, imagePath: 'Eyez/Rare/redEye.png', zIndex: 4 },
      
      // Legendary (15% total)
      { name: 'Bored', rarity: 5, imagePath: 'Eyez/Legendary/Bored.png', zIndex: 4 },
      { name: 'Disgusted', rarity: 5, imagePath: 'Eyez/Legendary/Disgusted.png', zIndex: 4 },
      { name: 'Hopeful', rarity: 5, imagePath: 'Eyez/Legendary/Hopeful.png', zIndex: 4 },
      
      // Super Rare (5% total)
      { name: 'Evil', rarity: 1.7, imagePath: 'Eyez/Super Rare/Evil.png', zIndex: 4 },
      { name: 'Heaven', rarity: 1.7, imagePath: 'Eyez/Super Rare/Heaven.png', zIndex: 4 },
      { name: 'Laser', rarity: 1.6, imagePath: 'Eyez/Super Rare/Laser.png', zIndex: 4 }
    ]
  },
  {
    name: 'Outfit',
    required: false, // Some geckos can be naked
    layers: [
      { name: 'None', rarity: 25, imagePath: '', zIndex: 0 }, // No outfit
      
      // Common (35%)
      { name: 'Black Sweater', rarity: 35, imagePath: 'Outfit/Common/Black Sweater.png', zIndex: 3 },
      
      // Rare (25% total)
      { name: 'Green Polo', rarity: 6.25, imagePath: 'Outfit/Rare/Green Polo.png', zIndex: 3 },
      { name: 'Sleeveless', rarity: 6.25, imagePath: 'Outfit/Rare/Sleeveless.png', zIndex: 3 },
      { name: 'Tom Hill', rarity: 6.25, imagePath: 'Outfit/Rare/Tom_Hill.png', zIndex: 3 },
      { name: 'Tuxedo', rarity: 6.25, imagePath: 'Outfit/Rare/Tuxedo.png', zIndex: 3 },
      
      // Legendary (10% total)
      { name: 'Pullover Hoodie', rarity: 5, imagePath: 'Outfit/Legendary/Pullover Hoodie.png', zIndex: 3 },
      { name: 'Special Project', rarity: 5, imagePath: 'Outfit/Legendary/Project (20230407100548).png', zIndex: 3 },
      
      // Super Rare (5% total)
      { name: 'Myth', rarity: 1.7, imagePath: 'Outfit/Super Rare/Myth.png', zIndex: 3 },
      { name: 'War Suit', rarity: 1.7, imagePath: 'Outfit/Super Rare/War Suit.png', zIndex: 3 },
      // Note: Space Suit.psd would need to be converted to PNG
      { name: 'Space Suit', rarity: 1.6, imagePath: 'Outfit/Super Rare/Space Suit.png', zIndex: 3 }
    ]
  },
  {
    name: 'Head',
    required: false,
    layers: [
      { name: 'None', rarity: 40, imagePath: '', zIndex: 0 }, // No headwear
      
      // Common (25%)
      { name: 'Rocket', rarity: 25, imagePath: 'Head/Common/Rocket.png', zIndex: 5 },
      
      // Rare (20% total)
      { name: 'Beanie', rarity: 4, imagePath: 'Head/Rare/Beanie.png', zIndex: 5 },
      { name: 'Devil', rarity: 4, imagePath: 'Head/Rare/Devil.png', zIndex: 5 },
      { name: 'Glowing Mushroom', rarity: 4, imagePath: 'Head/Rare/Glowing Mushroom.png', zIndex: 5 },
      
      // Legendary (10% total)
      { name: 'Frank Bandana', rarity: 3.3, imagePath: 'Head/Legendary/Frank Bandana.png', zIndex: 5 },
      { name: 'Golden Horn', rarity: 3.3, imagePath: 'Head/Legendary/Golden Horn.png', zIndex: 5 },
      
      // Super Rare (5% total)
      { name: 'Backwards Cap', rarity: 1, imagePath: 'Head/Super Rare/Backwards Cap.png', zIndex: 5 },
      { name: 'Cowboy Hat', rarity: 1, imagePath: 'Head/Super Rare/Cowboy Hat.png', zIndex: 5 },
      { name: 'Tattooz', rarity: 1, imagePath: 'Head/Super Rare/Tattooz.png', zIndex: 5 },
      { name: 'Special Layer', rarity: 1, imagePath: 'Head/Super Rare/Layer 13.png', zIndex: 5 },
      { name: 'Project Hat', rarity: 1, imagePath: 'Head/Super Rare/Project (20230607094451).png', zIndex: 5 }
    ]
  },
  {
    name: 'Armz',
    required: false,
    layers: [
      { name: 'None', rarity: 30, imagePath: '', zIndex: 0 }, // No weapon
      
      // Common (35% total)
      { name: 'Axe', rarity: 8.75, imagePath: 'Armz/Common/Axe.png', zIndex: 6 },
      { name: 'Bane', rarity: 8.75, imagePath: 'Armz/Common/Bane.png', zIndex: 6 },
      { name: 'Baseball', rarity: 8.75, imagePath: 'Armz/Common/Baseball.png', zIndex: 6 },
      { name: 'Crowbar', rarity: 8.75, imagePath: 'Armz/Common/Crowbar.png', zIndex: 6 },
      
      // Rare (20% total)
      { name: 'Montana', rarity: 4, imagePath: 'Armz/rare/Montana.png', zIndex: 6 },
      { name: 'Phoenix Fury', rarity: 4, imagePath: 'Armz/rare/Phoenix Fury.png', zIndex: 6 },
      { name: 'Shotgun', rarity: 4, imagePath: 'Armz/rare/Shotgun.png', zIndex: 6 },
      { name: 'Project Weapon', rarity: 4, imagePath: 'Armz/rare/Project (20230409065917).png', zIndex: 6 },
      { name: 'Special Project', rarity: 4, imagePath: 'Armz/rare/Project (20230409065917).png', zIndex: 6 },
      
      // Legendary (10% total)
      { name: 'Bearded Axe', rarity: 3.3, imagePath: 'Armz/legendary/Bearded Axe.png', zIndex: 6 },
      { name: 'Jungle Bolo', rarity: 3.3, imagePath: 'Armz/legendary/Jungle Bolo.png', zIndex: 6 },
      { name: 'Katana', rarity: 3.4, imagePath: 'Armz/legendary/Katana.png', zIndex: 6 },
      
      // Super Rare (5% total)
      { name: 'Spear', rarity: 1.7, imagePath: 'Armz/super_rare/Spear.png', zIndex: 6 },
      { name: 'Sunrise', rarity: 1.7, imagePath: 'Armz/super_rare/Sunrise.png', zIndex: 6 },
      { name: 'Thunderseal', rarity: 1.6, imagePath: 'Armz/super_rare/Thunderseal.png', zIndex: 6 }
    ]
  }
]

export class GeckoGenerator {
  private traitSystem: TraitCategory[]
  
  constructor(customTraitSystem?: TraitCategory[]) {
    this.traitSystem = customTraitSystem || GECKO_TRAIT_SYSTEM
  }

  /**
   * Generate a completely random gecko using weighted trait selection
   * This is called during mint to create truly unique NFTs
   */
  generateRandomGecko(mintId: number): GeneratedGecko {
    const selectedTraits: Record<string, string> = {}
    const selectedLayers: TraitLayer[] = []
    let rarityScore = 0

    // Select traits for each category
    for (const category of this.traitSystem) {
      const selectedTrait = this.selectWeightedRandomTrait(category)
      selectedTraits[category.name] = selectedTrait.name
      
      if (selectedTrait.imagePath) { // Only add layers with actual images
        selectedLayers.push(selectedTrait)
      }
      
      // Calculate rarity score (lower rarity = higher score)
      rarityScore += (100 - selectedTrait.rarity)
    }

    // Sort layers by z-index for proper compositing
    selectedLayers.sort((a, b) => a.zIndex - b.zIndex)

    // Generate metadata
    const geckoName = this.generateGeckoName(mintId, selectedTraits)
    const attributes = Object.entries(selectedTraits)
      .filter(([_, value]) => value !== 'None') // Exclude "None" traits
      .map(([trait_type, value]) => {
        const category = this.traitSystem.find(c => c.name === trait_type)
        const layer = category?.layers.find(l => l.name === value)
        return {
          trait_type,
          value,
          rarity: layer?.rarity
        }
      })

    const gecko: GeneratedGecko = {
      id: mintId,
      name: geckoName,
      traits: selectedTraits,
      rarityScore,
      isUltraRare: this.isUltraRareFromTraits(selectedTraits),
      metadata: {
        name: geckoName,
        description: `A degen gecko from the Greedy Geckoz collection. Rarity Score: ${rarityScore}. This gecko is ready to moon! 🦎🚀`,
        image: '', // Will be set after IPFS upload
        attributes
      }
    }

    return gecko
  }

  /**
   * Select a random trait from a category using weighted probability
   */
  private selectWeightedRandomTrait(category: TraitCategory): TraitLayer {
    const random = Math.random() * 100
    let cumulativeWeight = 0

    for (const layer of category.layers) {
      cumulativeWeight += layer.rarity
      if (random <= cumulativeWeight) {
        return layer
      }
    }

    // Fallback to last trait if something goes wrong
    return category.layers[category.layers.length - 1]
  }

  /**
   * Generate a unique name for the gecko based on its traits
   */
  private generateGeckoName(id: number, traits: Record<string, string>): string {
    const adjectives = []
    
    // Add adjectives based on traits
    if (traits.Body?.includes('Diamond')) adjectives.push('Diamond')
    if (traits.Body?.includes('Golden')) adjectives.push('Golden')
    if (traits.Eyes?.includes('Laser')) adjectives.push('Laser')
    if (traits.Hat?.includes('Crown')) adjectives.push('Royal')
    if (traits.Background?.includes('Moon')) adjectives.push('Lunar')
    if (traits.Body?.includes('Invisible')) adjectives.push('Phantom')
    
    const prefix = adjectives.length > 0 ? adjectives.join(' ') + ' ' : ''
    return `${prefix}Greedy Gecko #${id}`
  }

  /**
   * Check if a gecko combination is ultra-rare (for special effects)
   */
  isUltraRareFromTraits(traits: Record<string, string>): boolean {
    // Define ultra-rare traits based on actual GreedyGeckoz layers
    const ultraRareTraits = [
      // Super Rare backgrounds
      'Biloba Flower', 'Malibu', 'Minty', 'Studded Diamonds', 'Kollidz',
      // Super Rare skins
      'Trippy', 'Zombie',
      // Super Rare outfits
      'Myth', 'War Suit', 'Space Suit',
      // Super Rare eyez
      'Evil', 'Heaven', 'Laser',
      // Super Rare head
      'Backwards Cap', 'Cowboy Hat', 'Tattooz', 
      // Super Rare armz
      'Spear', 'Sunrise', 'Thunderseal'
    ]
    
    return Object.values(traits).some(trait => ultraRareTraits.includes(trait))
  }

  isUltraRare(gecko: GeneratedGecko): boolean {
    return this.isUltraRareFromTraits(gecko.traits)
  }

  /**
   * Calculate theoretical rarity percentage (for display purposes)
   */
  calculateRarityPercentage(gecko: GeneratedGecko): number {
    let combinedRarity = 1
    
    for (const [categoryName, traitName] of Object.entries(gecko.traits)) {
      const category = this.traitSystem.find(c => c.name === categoryName)
      const trait = category?.layers.find(l => l.name === traitName)
      if (trait) {
        combinedRarity *= (trait.rarity / 100)
      }
    }
    
    return combinedRarity * 100
  }

  /**
   * Get trait distribution for analytics
   */
  getTraitDistribution(): Record<string, Record<string, number>> {
    const distribution: Record<string, Record<string, number>> = {}
    
    for (const category of this.traitSystem) {
      distribution[category.name] = {}
      for (const layer of category.layers) {
        distribution[category.name][layer.name] = layer.rarity
      }
    }
    
    return distribution
  }
}

export default GeckoGenerator