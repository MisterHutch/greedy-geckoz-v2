import { Connection, PublicKey, Keypair } from '@solana/web3.js'
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'
import { WalletContextState } from '@solana/wallet-adapter-react'
import PinataService from '../ipfs/pinata-service'

export interface GeckoNFTData {
  id: number
  name: string
  image: string
  metadata: string
  available: boolean
}

export interface NFTMintResult {
  success: boolean
  mintAddress?: string
  metadataAddress?: string
  tokenAddress?: string
  txSignature?: string
  error?: string
}

export class MetaplexNFTService {
  private connection: Connection
  private metaplex: Metaplex
  private pinataService: PinataService
  private collectionNftAddress?: PublicKey
  
  constructor(connection: Connection, payerKeypair?: Keypair) {
    this.connection = connection
    this.pinataService = new PinataService()
    
    // Initialize Metaplex with payer (for collection authority)
    // In production, this would use a dedicated collection authority keypair
    const payer = payerKeypair || Keypair.generate() // Generate for demo
    
    this.metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payer))
  }

  /**
   * Create a collection NFT (one-time setup)
   * This should be called once to establish the Geckoz collection
   */
  async createCollection(): Promise<{ collectionNft: PublicKey; signature: string }> {
    try {
      console.log('Creating Greedy Geckoz collection...')
      
      const { nft: collectionNft } = await this.metaplex.nfts().create({
        uri: 'https://gateway.pinata.cloud/ipfs/QmYourCollectionMetadataHash', // You'll need to upload collection metadata
        name: 'Greedy Geckoz',
        symbol: 'GECKO',
        sellerFeeBasisPoints: 500, // 5% royalty
        isCollection: true,
        creators: [
          {
            address: new PublicKey('Cs3etBd1Mw9xptSgFZFmcK41PALcm1XHX6yHmS5HsPLY'),
            share: 100
          }
        ]
      })

      this.collectionNftAddress = collectionNft.address
      
      console.log('Collection created:', collectionNft.address.toString())
      return {
        collectionNft: collectionNft.address,
        signature: 'collection-created' // In real implementation, return actual tx signature
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      throw new Error(`Failed to create collection: ${error}`)
    }
  }

  /**
   * Mint a single gecko NFT to user's wallet
   * @param wallet - User's wallet
   * @param geckoData - Gecko data from collection
   * @returns NFT mint result
   */
  async mintGeckoNFT(
    wallet: WalletContextState, 
    geckoData: GeckoNFTData
  ): Promise<NFTMintResult> {
    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected')
      }

      console.log(`Minting Gecko #${geckoData.id} for ${wallet.publicKey.toString()}`)

      // Step 1: Upload image to IPFS (if not already done)
      let imageIpfsHash: string
      if (geckoData.image.startsWith('http')) {
        // Fetch existing image and upload to IPFS
        const imageResponse = await fetch(geckoData.image)
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
        imageIpfsHash = await this.pinataService.uploadGeckoImage(imageBuffer, geckoData.id)
      } else {
        // Assume it's already an IPFS hash
        imageIpfsHash = geckoData.image
      }

      // Step 2: Create and upload metadata
      const metadata = this.pinataService.createGeckoMetadata(geckoData, imageIpfsHash)
      const metadataIpfsHash = await this.pinataService.uploadGeckoMetadata(metadata, geckoData.id)
      const metadataUri = this.pinataService.getIpfsUri(metadataIpfsHash)

      // Step 3: Mint the NFT
      const { nft, response } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: metadata.name,
        symbol: metadata.symbol,
        sellerFeeBasisPoints: 500, // 5% royalty
        creators: [
          {
            address: new PublicKey('Cs3etBd1Mw9xptSgFZFmcK41PALcm1XHX6yHmS5HsPLY'),
            share: 100
          }
        ],
        collection: this.collectionNftAddress,
        tokenOwner: wallet.publicKey, // Mint directly to user's wallet
      })

      console.log('NFT minted successfully:', nft.address.toString())

      return {
        success: true,
        mintAddress: nft.address.toString(),
        metadataAddress: nft.metadataAddress.toString(),
        txSignature: response.signature
      }

    } catch (error) {
      console.error('Error minting gecko NFT:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'NFT minting failed'
      }
    }
  }

  /**
   * Mint multiple gecko NFTs (for bulk minting)
   * @param wallet - User's wallet
   * @param geckoDataArray - Array of gecko data
   * @returns Array of NFT mint results
   */
  async mintMultipleGeckoNFTs(
    wallet: WalletContextState,
    geckoDataArray: GeckoNFTData[]
  ): Promise<NFTMintResult[]> {
    const results: NFTMintResult[] = []
    
    for (const geckoData of geckoDataArray) {
      try {
        const result = await this.mintGeckoNFT(wallet, geckoData)
        results.push(result)
        
        // Small delay between mints to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to mint gecko #${geckoData.id}:`, error)
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Mint failed'
        })
      }
    }

    return results
  }

  /**
   * Set the collection NFT address (if collection already exists)
   * @param collectionAddress - The collection NFT address
   */
  setCollectionAddress(collectionAddress: string) {
    this.collectionNftAddress = new PublicKey(collectionAddress)
  }

  /**
   * Verify collection items (should be called by collection authority)
   * @param nftAddress - The NFT to verify as part of collection
   */
  async verifyCollectionItem(nftAddress: PublicKey): Promise<string> {
    try {
      if (!this.collectionNftAddress) {
        throw new Error('Collection address not set')
      }

      const { response } = await this.metaplex.nfts().verifyCollection({
        mintAddress: nftAddress,
        collectionMintAddress: this.collectionNftAddress,
        isSizedCollection: true
      })

      return response.signature
    } catch (error) {
      console.error('Error verifying collection item:', error)
      throw error
    }
  }

  /**
   * Get the current collection address
   */
  getCollectionAddress(): PublicKey | undefined {
    return this.collectionNftAddress
  }
}

export default MetaplexNFTService