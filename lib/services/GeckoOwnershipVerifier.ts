// NFT Ownership Verification Service for Greedy Geckoz
// Gates access to Portfolio Tracker and Fluid Dynamics pages

import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

export interface GeckoNFT {
  mintAddress: string;
  name: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  verified: boolean;
}

export interface OwnershipResult {
  hasAccess: boolean;
  geckoCount: number;
  geckos: GeckoNFT[];
  walletAddress: string;
  verificationTimestamp: number;
  error?: string;
}

export class GeckoOwnershipVerifier {
  private connection: Connection;
  private metaplex: Metaplex;
  private cache: Map<string, { result: OwnershipResult; expiry: number }>;
  private cacheTimeoutMs: number = 5 * 60 * 1000; // 5 minutes

  // Known Greedy Gecko collection identifiers
  private readonly GECKO_COLLECTION_IDENTIFIERS = [
    'GreedyGeckoz', 'Greedy Geckoz', 'GECKO', 
    // Add your actual collection mint address when deployed
    // 'YOUR_COLLECTION_MINT_ADDRESS'
  ];

  private readonly GECKO_CREATOR_ADDRESSES = [
    // Add your creator wallet addresses here
    // 'CREATOR_WALLET_ADDRESS_1',
    // 'CREATOR_WALLET_ADDRESS_2'
  ];

  constructor(rpcEndpoint?: string) {
    this.connection = new Connection(
      rpcEndpoint || process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com'
    );
    this.metaplex = new Metaplex(this.connection);
    this.cache = new Map();
  }

  /**
   * Main verification function - checks if wallet owns any Greedy Geckoz NFTs
   */
  async verifyGeckoOwnership(walletAddress: string): Promise<OwnershipResult> {
    try {
      console.log(`🔍 Verifying gecko ownership for: ${walletAddress.substring(0, 8)}...`);

      // Check cache first
      const cached = this.getCachedResult(walletAddress);
      if (cached) {
        console.log('✅ Using cached ownership result');
        return cached;
      }

      // Validate wallet address
      let walletPublicKey: PublicKey;
      try {
        walletPublicKey = new PublicKey(walletAddress);
      } catch (error) {
        return this.createErrorResult(walletAddress, 'Invalid wallet address');
      }

      // Get all NFTs owned by wallet
      const nfts = await this.metaplex.nfts().findAllByOwner({ 
        owner: walletPublicKey 
      });

      console.log(`📦 Found ${nfts.length} NFTs in wallet`);

      // Filter for Greedy Geckoz NFTs
      const geckos: GeckoNFT[] = [];
      
      for (const nft of nfts) {
        try {
          // Load full NFT metadata
          const fullNft = await this.metaplex.nfts().load({ metadata: nft });
          
          if (this.isGeckoNFT(fullNft)) {
            console.log(`🦎 Found gecko: ${fullNft.name}`);
            
            geckos.push({
              mintAddress: fullNft.address.toString(),
              name: fullNft.name,
              image: fullNft.json?.image,
              attributes: fullNft.json?.attributes,
              verified: true
            });
          }
        } catch (error) {
          console.warn(`⚠️  Failed to load NFT metadata:`, error);
          continue;
        }
      }

      const result: OwnershipResult = {
        hasAccess: geckos.length > 0,
        geckoCount: geckos.length,
        geckos,
        walletAddress,
        verificationTimestamp: Date.now()
      };

      // Cache the result
      this.cacheResult(walletAddress, result);

      console.log(`✅ Verification complete: ${geckos.length} geckos found, access ${result.hasAccess ? 'granted' : 'denied'}`);
      
      return result;

    } catch (error: any) {
      console.error('❌ Ownership verification failed:', error);
      return this.createErrorResult(walletAddress, `Verification failed: ${error.message}`);
    }
  }

  /**
   * Quick ownership check (boolean only)
   */
  async hasGeckoAccess(walletAddress: string): Promise<boolean> {
    const result = await this.verifyGeckoOwnership(walletAddress);
    return result.hasAccess;
  }

  /**
   * Get cached verification result if still valid
   */
  private getCachedResult(walletAddress: string): OwnershipResult | null {
    const cached = this.cache.get(walletAddress);
    if (cached && Date.now() < cached.expiry) {
      return cached.result;
    }
    
    // Remove expired cache entry
    if (cached) {
      this.cache.delete(walletAddress);
    }
    
    return null;
  }

  /**
   * Cache verification result
   */
  private cacheResult(walletAddress: string, result: OwnershipResult): void {
    this.cache.set(walletAddress, {
      result,
      expiry: Date.now() + this.cacheTimeoutMs
    });
  }

  /**
   * Check if an NFT is a Greedy Gecko
   */
  private isGeckoNFT(nft: any): boolean {
    try {
      // Check by collection name/symbol
      if (nft.symbol && this.GECKO_COLLECTION_IDENTIFIERS.some(id => 
        nft.symbol.toLowerCase().includes(id.toLowerCase())
      )) {
        return true;
      }

      // Check by NFT name
      if (nft.name && (
        nft.name.toLowerCase().includes('greedy gecko') ||
        nft.name.toLowerCase().includes('gecko') && nft.name.includes('#')
      )) {
        return true;
      }

      // Check by creator addresses (if configured)
      if (this.GECKO_CREATOR_ADDRESSES.length > 0 && nft.creators) {
        for (const creator of nft.creators) {
          if (creator.verified && this.GECKO_CREATOR_ADDRESSES.includes(creator.address.toString())) {
            return true;
          }
        }
      }

      // Check by collection mint (if configured)
      if (nft.collection && nft.collection.verified) {
        // Add your collection mint address check here when deployed
        // return nft.collection.address.toString() === 'YOUR_COLLECTION_MINT_ADDRESS';
      }

      // Check metadata for gecko-related attributes
      if (nft.json?.attributes) {
        const hasGeckoAttributes = nft.json.attributes.some((attr: any) => 
          attr.trait_type?.toLowerCase().includes('skin') ||
          attr.trait_type?.toLowerCase().includes('eyez') ||
          attr.trait_type?.toLowerCase().includes('armz') ||
          attr.value?.toLowerCase().includes('gecko')
        );
        
        if (hasGeckoAttributes) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn('⚠️  Error checking if NFT is gecko:', error);
      return false;
    }
  }

  /**
   * Create error result
   */
  private createErrorResult(walletAddress: string, error: string): OwnershipResult {
    return {
      hasAccess: false,
      geckoCount: 0,
      geckos: [],
      walletAddress,
      verificationTimestamp: Date.now(),
      error
    };
  }

  /**
   * Clear verification cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Verification cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()).map(key => `${key.substring(0, 8)}...`)
    };
  }

  /**
   * Manual verification for testing (bypasses cache)
   */
  async forceVerification(walletAddress: string): Promise<OwnershipResult> {
    this.cache.delete(walletAddress);
    return this.verifyGeckoOwnership(walletAddress);
  }
}

// Export singleton instance
export const geckoOwnershipVerifier = new GeckoOwnershipVerifier();