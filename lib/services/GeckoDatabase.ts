// Gecko Database Service for duplicate prevention and minted gecko tracking
// Uses JSON file storage initially - can be upgraded to PostgreSQL/MongoDB later

import fs from 'fs';
import path from 'path';
import { GeckoTraits } from './LiveGeckoGenerator';

export interface MintedGecko {
  id: number;
  mintAddress?: string;
  walletAddress: string;
  traits: GeckoTraits;
  traitsHash: string;
  rarityScore: number;
  isUltraRare: boolean;
  imageHash?: string;
  metadataHash?: string;
  mintedAt: string;
}

export interface DatabaseStats {
  totalMinted: number;
  uniqueWallets: number;
  ultraRareCount: number;
  averageRarity: number;
}

export class GeckoDatabase {
  private dbPath: string;
  private mintedGeckos: MintedGecko[] = [];
  private traitsHashSet: Set<string> = new Set();
  private isLoaded = false;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'minted-geckos.json');
    this.ensureDataDirectory();
  }

  /**
   * Initialize database - loads existing data
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      await this.loadDatabase();
      this.buildHashSet();
      this.isLoaded = true;
      
      console.log(`📊 Database initialized: ${this.mintedGeckos.length} minted geckos loaded`);
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      // Initialize with empty data if file doesn't exist
      this.mintedGeckos = [];
      this.traitsHashSet = new Set();
      this.isLoaded = true;
      
      await this.saveDatabase();
      console.log('✅ Initialized empty database');
    }
  }

  /**
   * Check if a trait combination already exists
   */
  isDuplicateTraits(traitsHash: string): boolean {
    return this.traitsHashSet.has(traitsHash);
  }

  /**
   * Get all existing trait hashes for duplicate prevention
   */
  getExistingHashes(): Set<string> {
    return new Set(this.traitsHashSet);
  }

  /**
   * Add a newly minted gecko to the database
   */
  async addMintedGecko(gecko: MintedGecko): Promise<void> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    // Add to arrays
    this.mintedGeckos.push(gecko);
    this.traitsHashSet.add(gecko.traitsHash);

    // Save to file
    await this.saveDatabase();

    console.log(`✅ Added gecko #${gecko.id} to database (${gecko.traitsHash.substring(0, 8)}...)`);
  }

  /**
   * Get a minted gecko by ID
   */
  getGeckoById(id: number): MintedGecko | undefined {
    return this.mintedGeckos.find(g => g.id === id);
  }

  /**
   * Get all geckos minted by a wallet
   */
  getGeckosByWallet(walletAddress: string): MintedGecko[] {
    return this.mintedGeckos.filter(g => g.walletAddress === walletAddress);
  }

  /**
   * Get database statistics
   */
  getStats(): DatabaseStats {
    const uniqueWallets = new Set(this.mintedGeckos.map(g => g.walletAddress)).size;
    const ultraRareCount = this.mintedGeckos.filter(g => g.isUltraRare).length;
    const totalRarity = this.mintedGeckos.reduce((sum, g) => sum + g.rarityScore, 0);
    const averageRarity = this.mintedGeckos.length > 0 ? totalRarity / this.mintedGeckos.length : 0;

    return {
      totalMinted: this.mintedGeckos.length,
      uniqueWallets,
      ultraRareCount,
      averageRarity: Math.round(averageRarity)
    };
  }

  /**
   * Get next available gecko ID
   */
  getNextGeckoId(): number {
    if (this.mintedGeckos.length === 0) return 1;
    
    const maxId = Math.max(...this.mintedGeckos.map(g => g.id));
    return maxId + 1;
  }

  /**
   * Get recent mints
   */
  getRecentMints(count: number = 10): MintedGecko[] {
    return [...this.mintedGeckos]
      .sort((a, b) => new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime())
      .slice(0, count);
  }

  /**
   * Get ultra rare geckos
   */
  getUltraRareGeckos(): MintedGecko[] {
    return this.mintedGeckos.filter(g => g.isUltraRare);
  }

  /**
   * Export database for backup
   */
  async exportDatabase(): Promise<string> {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalGeckos: this.mintedGeckos.length,
      geckos: this.mintedGeckos
    };

    const exportPath = path.join(process.cwd(), 'data', `geckos-backup-${Date.now()}.json`);
    await fs.promises.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    
    return exportPath;
  }

  // Private methods

  private ensureDataDirectory(): void {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private async loadDatabase(): Promise<void> {
    const data = await fs.promises.readFile(this.dbPath, 'utf8');
    const parsed = JSON.parse(data);
    
    this.mintedGeckos = Array.isArray(parsed) ? parsed : parsed.geckos || [];
  }

  private buildHashSet(): void {
    this.traitsHashSet = new Set(this.mintedGeckos.map(g => g.traitsHash));
  }

  private async saveDatabase(): Promise<void> {
    const data = {
      lastUpdated: new Date().toISOString(),
      totalGeckos: this.mintedGeckos.length,
      geckos: this.mintedGeckos
    };

    await fs.promises.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }
}

// Export singleton instance
export const geckoDatabase = new GeckoDatabase();