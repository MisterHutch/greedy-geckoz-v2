// Temporary disabled version of gecko generator for build testing
// This removes all Node.js dependencies to isolate build issues

export interface GeckoTraits {
  [key: string]: string;
}

export interface GeckoData {
  id: number;
  name: string;
  traits: GeckoTraits;
  rarityScore: number;
  isUltraRare: boolean;
  traitsHash: string;
}

export class DisabledGeckoGenerator {
  async initialize() {
    console.log('⚠️ Using disabled generator for build compatibility');
  }

  async generateUniqueGecko(id: number, existingHashes?: Set<string>): Promise<GeckoData> {
    return {
      id,
      name: `Disabled Gecko #${id}`,
      traits: { background: 'none', skin: 'none' },
      rarityScore: 0,
      isUltraRare: false,
      traitsHash: 'disabled'
    };
  }

  async composeGeckoImage(gecko: GeckoData): Promise<Buffer> {
    // Return empty buffer for build compatibility
    return Buffer.from('disabled');
  }

  createMetadata(gecko: GeckoData, imageUrl: string) {
    return {
      name: gecko.name,
      symbol: "GECKO",
      description: "Disabled for build compatibility",
      image: imageUrl,
      attributes: []
    };
  }

  getStats() {
    return { totalGenerated: 0, uniqueCombinations: 0 };
  }
}

export const disabledGeckoGenerator = new DisabledGeckoGenerator();