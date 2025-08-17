"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const js_1 = require("@metaplex-foundation/js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
};
async function deployCollection() {
    try {
        console.log('🦎 Deploying Greedy Geckoz Collection...');
        // Initialize connection (use mainnet for production)
        const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)('mainnet-beta'), 'confirmed');
        console.log('Connected to Solana mainnet');
        // Load or create collection authority keypair
        // IMPORTANT: In production, use a secure keypair for the collection authority
        const collectionAuthority = web3_js_1.Keypair.generate();
        console.log('Collection authority:', collectionAuthority.publicKey.toString());
        // Initialize Metaplex
        const metaplex = js_1.Metaplex.make(connection)
            .use((0, js_1.keypairIdentity)(collectionAuthority));
        // Upload collection metadata to Arweave via Bundlr
        console.log('📤 Uploading collection metadata...');
        const { uri: metadataUri } = await metaplex.nfts().uploadMetadata(collectionMetadata);
        console.log('Collection metadata URI:', metadataUri);
        // Create the collection NFT
        console.log('🎨 Creating collection NFT...');
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
        });
        console.log('🎉 Collection deployed successfully!');
        console.log('Collection NFT Address:', collectionNft.address.toString());
        console.log('Collection Authority:', collectionAuthority.publicKey.toString());
        // Save collection info to file
        const collectionInfo = {
            collectionNftAddress: collectionNft.address.toString(),
            collectionAuthority: collectionAuthority.publicKey.toString(),
            metadataUri,
            deploymentDate: new Date().toISOString(),
            network: 'mainnet-beta', // Change to 'mainnet' for production
            secretKey: Array.from(collectionAuthority.secretKey) // KEEP THIS SECURE!
        };
        const outputPath = path.join(__dirname, '..', 'collection-deployment.json');
        fs.writeFileSync(outputPath, JSON.stringify(collectionInfo, null, 2));
        console.log('Collection info saved to:', outputPath);
        console.log('\n📝 Next steps:');
        console.log('1. Add NEXT_PUBLIC_COLLECTION_NFT_ADDRESS to your .env.local file');
        console.log('2. Keep the collection authority keypair secure');
        console.log('3. Update your mint service with the collection address');
        return collectionInfo;
    }
    catch (error) {
        console.error('❌ Collection deployment failed:', error);
        throw error;
    }
}
// Run the deployment
if (require.main === module) {
    deployCollection()
        .then(() => {
        console.log('Collection deployment completed!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Collection deployment failed:', error);
        process.exit(1);
    });
}
exports.default = deployCollection;
