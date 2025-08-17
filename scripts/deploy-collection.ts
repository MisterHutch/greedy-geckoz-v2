import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js'
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'
import * as fs from 'fs'
import * as path from 'path'

// Collection metadata for Greedy Geckoz
const collectionMetadata = {
  name: "Greedy Geckoz",
  symbol: "GECKO",
  description: "2222 degen geckos living their best life on Solana. Where lambos go to die and JPEGs go to moon. 🦎🚀",
  image: "https://gateway.pinata.cloud/ipfs/YOUR_COLLECTION_IMAGE_HASH", // Upload collection image first
  attributes: [],
  properties: {
    files: [
      {
        uri: "https://gateway.pinata.cloud/ipfs/YOUR_COLLECTION_IMAGE_HASH",
        type: "image/png"
      }
    ],
    category: "image"
  },
  collection: {
    name: "Greedy Geckoz",
    family: "Geckoz"
  }
}

async function deployCollection() {
  try {
    console.log('🦎 Deploying Greedy Geckoz Collection...')
    
    // Initialize connection (use mainnet for production)
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed')
    console.log('Connected to Solana mainnet')

    // Load or create collection authority keypair
    // IMPORTANT: In production, use a secure keypair for the collection authority
    const collectionAuthority = Keypair.generate()
    console.log('Collection authority:', collectionAuthority.publicKey.toString())
    
    // Initialize Metaplex
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(collectionAuthority))

    // Upload collection metadata to Arweave via Bundlr
    console.log('📤 Uploading collection metadata...')
    const { uri: metadataUri } = await metaplex.nfts().uploadMetadata(collectionMetadata)
    console.log('Collection metadata URI:', metadataUri)

    // Create the collection NFT
    console.log('🎨 Creating collection NFT...')
    const { nft: collectionNft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: collectionMetadata.name,
      symbol: collectionMetadata.symbol,
      sellerFeeBasisPoints: 500, // 5% royalty
      isCollection: true,
      creators: [
        {
          address: collectionAuthority.publicKey,
          share: 100
        }
      ]
    })

    console.log('🎉 Collection deployed successfully!')
    console.log('Collection NFT Address:', collectionNft.address.toString())
    console.log('Collection Authority:', collectionAuthority.publicKey.toString())
    
    // Save collection info to file
    const collectionInfo = {
      collectionNftAddress: collectionNft.address.toString(),
      collectionAuthority: collectionAuthority.publicKey.toString(),
      metadataUri,
      deploymentDate: new Date().toISOString(),
      network: 'mainnet-beta', // Change to 'mainnet' for production
      secretKey: Array.from(collectionAuthority.secretKey) // KEEP THIS SECURE!
    }

    const outputPath = path.join(__dirname, '..', 'collection-deployment.json')
    fs.writeFileSync(outputPath, JSON.stringify(collectionInfo, null, 2))
    console.log('Collection info saved to:', outputPath)

    console.log('\n📝 Next steps:')
    console.log('1. Add NEXT_PUBLIC_COLLECTION_NFT_ADDRESS to your .env.local file')
    console.log('2. Keep the collection authority keypair secure')
    console.log('3. Update your mint service with the collection address')
    
    return collectionInfo

  } catch (error) {
    console.error('❌ Collection deployment failed:', error)
    throw error
  }
}

// Run the deployment
if (require.main === module) {
  deployCollection()
    .then(() => {
      console.log('Collection deployment completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Collection deployment failed:', error)
      process.exit(1)
    })
}

export default deployCollection