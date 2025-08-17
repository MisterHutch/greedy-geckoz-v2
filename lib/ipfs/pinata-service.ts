import axios from 'axios'

interface GeckoMetadata {
  name: string
  symbol: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
  properties: {
    files: Array<{
      uri: string
      type: string
    }>
    category: string
  }
}

export class PinataService {
  private apiKey: string
  private secretKey: string
  private baseURL = 'https://api.pinata.cloud'

  constructor() {
    // These should be set in environment variables for production
    this.apiKey = process.env.PINATA_API_KEY || ''
    this.secretKey = process.env.PINATA_SECRET_API_KEY || ''
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'pinata_api_key': this.apiKey,
      'pinata_secret_api_key': this.secretKey
    }
  }

  /**
   * Upload gecko image to IPFS via Pinata
   * @param imageBuffer - The image buffer to upload
   * @param geckoId - The gecko ID for naming
   * @returns IPFS hash of uploaded image
   */
  async uploadGeckoImage(imageBuffer: Buffer, geckoId: number): Promise<string> {
    try {
      const formData = new FormData()
      const uint8Array = new Uint8Array(imageBuffer)
      const blob = new Blob([uint8Array], { type: 'image/png' })
      formData.append('file', blob, `gecko-${geckoId}.png`)
      
      const pinataMetadata = JSON.stringify({
        name: `Gecko #${geckoId}`,
        keyvalues: {
          collection: 'Greedy Geckoz',
          geckoId: geckoId.toString()
        }
      })
      formData.append('pinataMetadata', pinataMetadata)

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      return response.data.IpfsHash
    } catch (error) {
      console.error('Error uploading image to IPFS:', error)
      throw new Error(`Failed to upload gecko image: ${error}`)
    }
  }

  /**
   * Upload gecko metadata to IPFS via Pinata
   * @param metadata - The gecko metadata object
   * @param geckoId - The gecko ID for naming
   * @returns IPFS hash of uploaded metadata
   */
  async uploadGeckoMetadata(metadata: GeckoMetadata, geckoId: number): Promise<string> {
    try {
      const requestBody = {
        ...metadata,
        pinataMetadata: {
          name: `Gecko #${geckoId} Metadata`,
          keyvalues: {
            collection: 'Greedy Geckoz',
            geckoId: geckoId.toString(),
            type: 'metadata'
          }
        }
      }

      const response = await axios.post(
        `${this.baseURL}/pinning/pinJSONToIPFS`,
        requestBody,
        {
          headers: {
            ...this.getHeaders(),
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          }
        }
      )

      return response.data.IpfsHash
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error)
      throw new Error(`Failed to upload gecko metadata: ${error}`)
    }
  }

  /**
   * Create gecko metadata object with IPFS image URI
   * @param geckoData - The gecko data from collection
   * @param imageIpfsHash - The IPFS hash of the uploaded image
   * @returns Properly formatted NFT metadata
   */
  createGeckoMetadata(geckoData: any, imageIpfsHash: string): GeckoMetadata {
    return {
      name: geckoData.name || `Gecko #${geckoData.id}`,
      symbol: "GECKO",
      description: `A degen gecko from the Greedy Geckoz collection. This gecko (#${geckoData.id}) is ready to moon with you! 🦎🚀`,
      image: `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`,
      attributes: [
        {
          trait_type: "Rarity",
          value: "Epic Degen"
        },
        {
          trait_type: "Vibes", 
          value: "Trippy AF"
        },
        {
          trait_type: "Power Level",
          value: "Over 9000"
        },
        {
          trait_type: "Hopium Level",
          value: "Maximum"
        },
        {
          trait_type: "Gecko ID",
          value: geckoData.id.toString()
        }
      ],
      properties: {
        files: [
          {
            uri: `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`,
            type: "image/png"
          }
        ],
        category: "image"
      }
    }
  }

  /**
   * Get IPFS URI from hash
   * @param ipfsHash - The IPFS hash
   * @returns Full IPFS URI using Pinata gateway
   */
  getIpfsUri(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
  }

  /**
   * Test Pinata connection
   * @returns Promise<boolean> - True if connection successful
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseURL}/data/testAuthentication`,
        { headers: this.getHeaders() }
      )
      return response.data.message === 'Congratulations! You are communicating with the Pinata API!'
    } catch (error) {
      console.error('Pinata connection test failed:', error)
      return false
    }
  }
}

export default PinataService