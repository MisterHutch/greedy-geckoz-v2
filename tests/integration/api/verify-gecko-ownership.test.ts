/**
 * @fileoverview Integration tests for NFT ownership verification API endpoints
 * Tests the API layer for gecko ownership verification
 */

import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/verify-gecko-ownership/route'

// Mock the ownership verifier
jest.mock('@/lib/services/GeckoOwnershipVerifier', () => ({
  GeckoOwnershipVerifier: jest.fn().mockImplementation(() => ({
    verifyOwnership: jest.fn(),
  })),
}))

describe('/api/verify-gecko-ownership', () => {
  let mockVerifyOwnership: jest.Mock

  beforeEach(() => {
    const { GeckoOwnershipVerifier } = require('@/lib/services/GeckoOwnershipVerifier')
    const mockVerifier = new GeckoOwnershipVerifier()
    mockVerifyOwnership = mockVerifier.verifyOwnership
    jest.clearAllMocks()
  })

  describe('GET requests', () => {
    test('should verify ownership for valid wallet address', async () => {
      const mockOwnershipResult = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        hasAccess: true,
        geckoCount: 2,
        geckos: [
          {
            mint: 'mint1',
            name: 'Greedy Gecko #1',
            image: 'ipfs://hash1'
          },
          {
            mint: 'mint2',
            name: 'Greedy Gecko #2',
            image: 'ipfs://hash2'
          }
        ],
        cached: false,
        timestamp: Date.now()
      }

      mockVerifyOwnership.mockResolvedValue(mockOwnershipResult)

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
        },
      })

      await handler.GET(req)

      expect(mockVerifyOwnership).toHaveBeenCalledWith(
        '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        false
      )
    })

    test('should handle quick check parameter', async () => {
      const mockOwnershipResult = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        hasAccess: true,
        geckoCount: 1,
        geckos: [],
        cached: false,
        timestamp: Date.now()
      }

      mockVerifyOwnership.mockResolvedValue(mockOwnershipResult)

      const { req } = createMocks({
        method: 'GET',
        query: {
          wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
          quick: 'true'
        },
      })

      await handler.GET(req)

      expect(mockVerifyOwnership).toHaveBeenCalledWith(
        '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        true
      )
    })

    test('should return 400 for missing wallet parameter', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: {},
      })

      const response = await handler.GET(req)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Wallet address is required')
    })

    test('should return 400 for invalid wallet format', async () => {
      mockVerifyOwnership.mockRejectedValue(new Error('Invalid wallet address format'))

      const { req } = createMocks({
        method: 'GET',
        query: {
          wallet: 'invalid-wallet'
        },
      })

      const response = await handler.GET(req)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toContain('Invalid wallet address')
    })

    test('should return 500 for verification service errors', async () => {
      mockVerifyOwnership.mockRejectedValue(new Error('RPC connection failed'))

      const { req } = createMocks({
        method: 'GET',
        query: {
          wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
        },
      })

      const response = await handler.GET(req)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Verification failed')
    })
  })

  describe('POST requests', () => {
    test('should verify ownership from POST body', async () => {
      const mockOwnershipResult = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        hasAccess: false,
        geckoCount: 0,
        geckos: [],
        cached: false,
        timestamp: Date.now()
      }

      mockVerifyOwnership.mockResolvedValue(mockOwnershipResult)

      const { req } = createMocks({
        method: 'POST',
        body: {
          wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
          quick: false
        },
      })

      const response = await handler.POST(req)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.hasAccess).toBe(false)
      expect(responseData.geckoCount).toBe(0)
      expect(mockVerifyOwnership).toHaveBeenCalledWith(
        '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        false
      )
    })

    test('should return 400 for missing wallet in POST body', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {},
      })

      const response = await handler.POST(req)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Wallet address is required')
    })

    test('should handle malformed JSON in POST body', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: 'invalid-json',
      })

      const response = await handler.POST(req)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toContain('Invalid JSON')
    })
  })

  describe('CORS and Security Headers', () => {
    test('should include proper CORS headers', async () => {
      const mockOwnershipResult = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        hasAccess: true,
        geckoCount: 1,
        geckos: [],
        cached: false,
        timestamp: Date.now()
      }

      mockVerifyOwnership.mockResolvedValue(mockOwnershipResult)

      const { req } = createMocks({
        method: 'GET',
        query: {
          wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
        },
      })

      const response = await handler.GET(req)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })

    test('should include security headers', async () => {
      const mockOwnershipResult = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        hasAccess: true,
        geckoCount: 1,
        geckos: [],
        cached: false,
        timestamp: Date.now()
      }

      mockVerifyOwnership.mockResolvedValue(mockOwnershipResult)

      const { req } = createMocks({
        method: 'GET',
        query: {
          wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
        },
      })

      const response = await handler.GET(req)

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    })
  })

  describe('Rate Limiting Considerations', () => {
    test('should handle rapid consecutive requests', async () => {
      const mockOwnershipResult = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        hasAccess: true,
        geckoCount: 1,
        geckos: [],
        cached: true,
        timestamp: Date.now()
      }

      mockVerifyOwnership.mockResolvedValue(mockOwnershipResult)

      const wallet = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
      
      // Simulate 5 rapid requests
      const requests = Array.from({ length: 5 }, () => 
        createMocks({
          method: 'GET',
          query: { wallet },
        })
      )

      const responses = await Promise.all(
        requests.map(({ req }) => handler.GET(req))
      )

      // All should succeed (relying on caching)
      responses.forEach(async (response) => {
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.walletAddress).toBe(wallet)
      })
    })
  })

  describe('Cache Behavior', () => {
    test('should return cached flag when using cached data', async () => {
      const mockOwnershipResult = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        hasAccess: true,
        geckoCount: 2,
        geckos: [],
        cached: true,
        timestamp: Date.now() - 60000 // 1 minute ago
      }

      mockVerifyOwnership.mockResolvedValue(mockOwnershipResult)

      const { req } = createMocks({
        method: 'GET',
        query: {
          wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
        },
      })

      const response = await handler.GET(req)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.cached).toBe(true)
      expect(responseData.hasAccess).toBe(true)
    })

    test('should respect cache control headers', async () => {
      const mockOwnershipResult = {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        hasAccess: true,
        geckoCount: 1,
        geckos: [],
        cached: false,
        timestamp: Date.now()
      }

      mockVerifyOwnership.mockResolvedValue(mockOwnershipResult)

      const { req } = createMocks({
        method: 'GET',
        query: {
          wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
        },
      })

      const response = await handler.GET(req)

      // Should include cache control headers
      expect(response.headers.get('Cache-Control')).toContain('max-age')
    })
  })
})