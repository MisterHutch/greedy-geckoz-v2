/**
 * @fileoverview Unit tests for GeckoOwnershipVerifier service
 * Tests the core NFT ownership verification functionality
 */

import { GeckoOwnershipVerifier } from '@/lib/services/GeckoOwnershipVerifier'
import { Connection, PublicKey } from '@solana/web3.js'

// Mock Solana connection
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  PublicKey: jest.fn(),
}))

// Mock Metaplex
jest.mock('@metaplex-foundation/js', () => ({
  Metaplex: jest.fn().mockImplementation(() => ({
    nfts: () => ({
      findAllByOwner: jest.fn(),
      load: jest.fn(),
    }),
  })),
}))

describe('GeckoOwnershipVerifier', () => {
  let verifier: GeckoOwnershipVerifier
  let mockConnection: jest.Mocked<Connection>
  let mockPublicKey: jest.Mocked<PublicKey>

  beforeEach(() => {
    mockConnection = {
      getAccountInfo: jest.fn(),
    } as any

    mockPublicKey = {
      toString: jest.fn().mockReturnValue('11111111111111111111111111111112'),
      toBase58: jest.fn().mockReturnValue('11111111111111111111111111111112'),
    } as any

    ;(Connection as jest.Mock).mockReturnValue(mockConnection)
    ;(PublicKey as jest.Mock).mockImplementation((key) => {
      if (typeof key === 'string' && key.length > 20) {
        return mockPublicKey
      }
      throw new Error('Invalid public key')
    })

    verifier = new GeckoOwnershipVerifier()
  })

  afterEach(() => {
    jest.clearAllMocks()
    // Clear cache between tests
    ;(verifier as any).cache.clear()
  })

  describe('Wallet Validation', () => {
    test('should validate correct wallet address format', async () => {
      const validWallet = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
      
      const result = await verifier.verifyOwnership(validWallet)
      
      expect(result).toBeDefined()
      expect(result.walletAddress).toBe(validWallet)
    })

    test('should reject invalid wallet address format', async () => {
      const invalidWallet = 'invalid-wallet'
      
      await expect(verifier.verifyOwnership(invalidWallet))
        .rejects.toThrow('Invalid wallet address format')
    })

    test('should reject empty wallet address', async () => {
      await expect(verifier.verifyOwnership(''))
        .rejects.toThrow('Invalid wallet address format')
    })

    test('should reject null or undefined wallet', async () => {
      await expect(verifier.verifyOwnership(null as any))
        .rejects.toThrow('Invalid wallet address format')
      
      await expect(verifier.verifyOwnership(undefined as any))
        .rejects.toThrow('Invalid wallet address format')
    })
  })

  describe('NFT Gecko Detection', () => {
    const mockGeckoNFT = {
      mint: {
        address: { toString: () => 'mint123' }
      },
      name: 'Greedy Gecko #1337',
      symbol: 'GECKO',
      collection: null,
      creators: [],
      json: {
        name: 'Greedy Gecko #1337',
        description: 'A greedy gecko ready to lose money',
        attributes: [
          { trait_type: 'Skin', value: 'Cosmic Purple' },
          { trait_type: 'Eyez', value: 'Laser Vision' },
          { trait_type: 'Armz', value: 'Diamond Hands' }
        ]
      }
    }

    const mockNonGeckoNFT = {
      mint: {
        address: { toString: () => 'mint456' }
      },
      name: 'Random NFT #123',
      symbol: 'RANDOM',
      collection: null,
      creators: [],
      json: {
        name: 'Random NFT #123',
        description: 'Some other NFT',
        attributes: [
          { trait_type: 'Background', value: 'Blue' },
          { trait_type: 'Style', value: 'Modern' }
        ]
      }
    }

    beforeEach(() => {
      const mockMetaplex = {
        nfts: () => ({
          findAllByOwner: jest.fn(),
          load: jest.fn(),
        }),
      }
      
      ;(verifier as any).metaplex = mockMetaplex
    })

    test('should detect gecko by name pattern', () => {
      const isGecko = (verifier as any).isGeckoNFT(mockGeckoNFT)
      expect(isGecko).toBe(true)
    })

    test('should detect gecko by symbol', () => {
      const geckoBySymbol = {
        ...mockNonGeckoNFT,
        symbol: 'GECKO'
      }
      
      const isGecko = (verifier as any).isGeckoNFT(geckoBySymbol)
      expect(isGecko).toBe(true)
    })

    test('should detect gecko by attributes', () => {
      const geckoByAttributes = {
        ...mockNonGeckoNFT,
        json: {
          ...mockNonGeckoNFT.json,
          attributes: [
            { trait_type: 'skin', value: 'Green' },
            { trait_type: 'eyez', value: 'Blue' }
          ]
        }
      }
      
      const isGecko = (verifier as any).isGeckoNFT(geckoByAttributes)
      expect(isGecko).toBe(true)
    })

    test('should reject non-gecko NFTs', () => {
      const isGecko = (verifier as any).isGeckoNFT(mockNonGeckoNFT)
      expect(isGecko).toBe(false)
    })

    test('should handle NFTs with no attributes', () => {
      const nftNoAttributes = {
        ...mockNonGeckoNFT,
        json: {
          ...mockNonGeckoNFT.json,
          attributes: null
        }
      }
      
      const isGecko = (verifier as any).isGeckoNFT(nftNoAttributes)
      expect(isGecko).toBe(false)
    })
  })

  describe('Ownership Verification Flow', () => {
    const validWallet = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'

    test('should return correct ownership status for wallet with geckos', async () => {
      const mockGeckos = [
        {
          mint: { address: { toString: () => 'mint1' } },
          name: 'Greedy Gecko #1',
          symbol: 'GECKO',
          json: { attributes: [{ trait_type: 'skin', value: 'green' }] }
        },
        {
          mint: { address: { toString: () => 'mint2' } },
          name: 'Greedy Gecko #2',
          symbol: 'GECKO',
          json: { attributes: [{ trait_type: 'eyez', value: 'blue' }] }
        }
      ]

      ;(verifier as any).metaplex = {
        nfts: () => ({
          findAllByOwner: jest.fn().mockResolvedValue(mockGeckos),
          load: jest.fn(),
        }),
      }

      const result = await verifier.verifyOwnership(validWallet)

      expect(result.hasAccess).toBe(true)
      expect(result.geckoCount).toBe(2)
      expect(result.geckos).toHaveLength(2)
      expect(result.geckos[0].mint).toBe('mint1')
      expect(result.geckos[1].mint).toBe('mint2')
    })

    test('should return false access for wallet without geckos', async () => {
      const mockNonGeckos = [
        {
          mint: { address: { toString: () => 'mint1' } },
          name: 'Random NFT #1',
          symbol: 'RANDOM',
          json: { attributes: [{ trait_type: 'background', value: 'blue' }] }
        }
      ]

      ;(verifier as any).metaplex = {
        nfts: () => ({
          findAllByOwner: jest.fn().mockResolvedValue(mockNonGeckos),
          load: jest.fn(),
        }),
      }

      const result = await verifier.verifyOwnership(validWallet)

      expect(result.hasAccess).toBe(false)
      expect(result.geckoCount).toBe(0)
      expect(result.geckos).toHaveLength(0)
    })

    test('should handle empty wallet (no NFTs)', async () => {
      ;(verifier as any).metaplex = {
        nfts: () => ({
          findAllByOwner: jest.fn().mockResolvedValue([]),
          load: jest.fn(),
        }),
      }

      const result = await verifier.verifyOwnership(validWallet)

      expect(result.hasAccess).toBe(false)
      expect(result.geckoCount).toBe(0)
      expect(result.geckos).toHaveLength(0)
    })
  })

  describe('Caching System', () => {
    const validWallet = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'

    test('should cache successful ownership verification', async () => {
      const mockGeckos = [
        {
          mint: { address: { toString: () => 'mint1' } },
          name: 'Greedy Gecko #1',
          symbol: 'GECKO',
          json: { attributes: [] }
        }
      ]

      const mockFindAllByOwner = jest.fn().mockResolvedValue(mockGeckos)
      ;(verifier as any).metaplex = {
        nfts: () => ({
          findAllByOwner: mockFindAllByOwner,
          load: jest.fn(),
        }),
      }

      // First call
      const result1 = await verifier.verifyOwnership(validWallet)
      
      // Second call should use cache
      const result2 = await verifier.verifyOwnership(validWallet)

      expect(mockFindAllByOwner).toHaveBeenCalledTimes(1)
      expect(result1).toEqual(result2)
      expect(result1.cached).toBe(false)
      expect(result2.cached).toBe(true)
    })

    test('should respect cache expiry time', async () => {
      const mockGeckos = [
        {
          mint: { address: { toString: () => 'mint1' } },
          name: 'Greedy Gecko #1',
          symbol: 'GECKO',
          json: { attributes: [] }
        }
      ]

      const mockFindAllByOwner = jest.fn().mockResolvedValue(mockGeckos)
      ;(verifier as any).metaplex = {
        nfts: () => ({
          findAllByOwner: mockFindAllByOwner,
          load: jest.fn(),
        }),
      }

      // Mock cache expiry by manipulating cache timestamp
      await verifier.verifyOwnership(validWallet)
      
      // Manually expire cache entry
      const cache = (verifier as any).cache
      const cacheKey = validWallet
      const cachedEntry = cache.get(cacheKey)
      if (cachedEntry) {
        cachedEntry.timestamp = Date.now() - 6 * 60 * 1000 // 6 minutes ago
      }

      // Second call should refetch due to expired cache
      await verifier.verifyOwnership(validWallet)

      expect(mockFindAllByOwner).toHaveBeenCalledTimes(2)
    })
  })

  describe('Quick Check Mode', () => {
    const validWallet = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'

    test('should perform quick check when enabled', async () => {
      const mockGeckos = [
        {
          mint: { address: { toString: () => 'mint1' } },
          name: 'Greedy Gecko #1',
          symbol: 'GECKO',
          json: { attributes: [] }
        }
      ]

      const mockFindAllByOwner = jest.fn().mockResolvedValue(mockGeckos)
      ;(verifier as any).metaplex = {
        nfts: () => ({
          findAllByOwner: mockFindAllByOwner,
          load: jest.fn(),
        }),
      }

      const result = await verifier.verifyOwnership(validWallet, true)

      expect(result.hasAccess).toBe(true)
      expect(result.geckoCount).toBe(1)
      // Quick check should not include full gecko details
      expect(result.geckos).toHaveLength(1)
    })
  })

  describe('Error Handling', () => {
    const validWallet = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'

    test('should handle RPC connection errors gracefully', async () => {
      ;(verifier as any).metaplex = {
        nfts: () => ({
          findAllByOwner: jest.fn().mockRejectedValue(new Error('RPC Error')),
          load: jest.fn(),
        }),
      }

      const result = await verifier.verifyOwnership(validWallet)

      expect(result.hasAccess).toBe(false)
      expect(result.error).toContain('RPC Error')
      expect(result.geckoCount).toBe(0)
    })

    test('should handle malformed NFT metadata', async () => {
      const malformedNFTs = [
        {
          mint: { address: { toString: () => 'mint1' } },
          name: null,
          symbol: undefined,
          json: null
        }
      ]

      ;(verifier as any).metaplex = {
        nfts: () => ({
          findAllByOwner: jest.fn().mockResolvedValue(malformedNFTs),
          load: jest.fn(),
        }),
      }

      const result = await verifier.verifyOwnership(validWallet)

      expect(result.hasAccess).toBe(false)
      expect(result.geckoCount).toBe(0)
    })

    test('should handle network timeouts', async () => {
      ;(verifier as any).metaplex = {
        nfts: () => ({
          findAllByOwner: jest.fn().mockImplementation(() => 
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Network timeout')), 100)
            )
          ),
          load: jest.fn(),
        }),
      }

      const result = await verifier.verifyOwnership(validWallet)

      expect(result.hasAccess).toBe(false)
      expect(result.error).toContain('Network timeout')
    })
  })

  describe('Performance Considerations', () => {
    test('should handle large NFT collections efficiently', async () => {
      const validWallet = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
      
      // Simulate wallet with 1000 NFTs, 5 of which are geckos
      const largeNFTCollection = Array.from({ length: 1000 }, (_, i) => ({
        mint: { address: { toString: () => `mint${i}` } },
        name: i < 5 ? `Greedy Gecko #${i}` : `Other NFT #${i}`,
        symbol: i < 5 ? 'GECKO' : 'OTHER',
        json: { attributes: [] }
      }))

      const mockFindAllByOwner = jest.fn().mockResolvedValue(largeNFTCollection)
      ;(verifier as any).metaplex = {
        nfts: () => ({
          findAllByOwner: mockFindAllByOwner,
          load: jest.fn(),
        }),
      }

      const startTime = Date.now()
      const result = await verifier.verifyOwnership(validWallet)
      const endTime = Date.now()

      expect(result.hasAccess).toBe(true)
      expect(result.geckoCount).toBe(5)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })
})