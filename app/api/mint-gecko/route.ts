// API endpoint for full gecko minting with IPFS upload and NFT creation
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { PinataService } from '@/lib/ipfs/pinata-service';

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Initialize services
let isInitialized = false;
let pinataService: PinataService;
// Lazily-loaded server-only services
let liveGeckoGenerator: any;
let geckoDatabase: any;

async function initializeServices() {
  if (isInitialized) return;
  
  try {
    console.log('🔧 Initializing minting services...');
    if (!liveGeckoGenerator || !geckoDatabase) {
      const [{ liveGeckoGenerator: lg }, { geckoDatabase: db }] = await Promise.all([
        import('@/lib/services/LiveGeckoGenerator'),
        import('@/lib/services/GeckoDatabase')
      ]);
      liveGeckoGenerator = lg;
      geckoDatabase = db;
    }

    await Promise.all([
      liveGeckoGenerator.initialize(),
      geckoDatabase.initialize()
    ]);
    
    pinataService = new PinataService();
    
    // Test Pinata connection
    const pinataConnected = await pinataService.testConnection();
    if (!pinataConnected) {
      throw new Error('Pinata connection failed');
    }
    
    isInitialized = true;
    console.log('✅ Minting services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize minting services:', error);
    throw error;
  }
}

function checkRateLimit(walletAddress: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 2; // 2 mints per minute per wallet
  
  const userRecord = rateLimitStore.get(walletAddress);
  
  if (!userRecord || now > userRecord.resetTime) {
    // Reset or create new record
    rateLimitStore.set(walletAddress, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (userRecord.count >= maxRequests) {
    return false;
  }
  
  userRecord.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    await initializeServices();

    const body = await request.json();
    const { walletAddress, paymentTx, skipPaymentVerification = false } = body;

    // Basic validation
    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address is required'
      }, { status: 400 });
    }

    // Rate limiting
    if (!checkRateLimit(walletAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please wait before minting again.'
      }, { status: 429 });
    }

    // TODO: Verify Solana payment transaction
    if (!skipPaymentVerification && !paymentTx) {
      return NextResponse.json({
        success: false,
        error: 'Payment transaction is required'
      }, { status: 400 });
    }

    console.log(`🎯 Starting mint process for wallet: ${walletAddress.substring(0, 8)}...`);

    // Step 1: Generate unique gecko
    const existingHashes = geckoDatabase.getExistingHashes();
    const nextId = geckoDatabase.getNextGeckoId();
    
    console.log(`🎲 Generating gecko #${nextId}...`);
    const gecko = await liveGeckoGenerator.generateUniqueGecko(nextId, existingHashes);
    
    console.log(`✅ Generated: ${gecko.name} (Score: ${gecko.rarityScore}${gecko.isUltraRare ? ' ⭐ ULTRA RARE' : ''})`);

    // Step 2: Compose image
    console.log(`🎨 Compositing image...`);
    const imageBuffer = await liveGeckoGenerator.composeGeckoImage(gecko);
    
    // Step 3: Upload image to IPFS
    console.log(`📤 Uploading image to IPFS...`);
    const imageHash = await pinataService.uploadGeckoImage(imageBuffer, gecko.id);
    const imageUrl = pinataService.getIpfsUri(imageHash);
    
    console.log(`✅ Image uploaded: ${imageHash}`);

    // Step 4: Create and upload metadata
    console.log(`📝 Creating metadata...`);
    const metadata = liveGeckoGenerator.createMetadata(gecko, imageUrl);
    const metadataHash = await pinataService.uploadGeckoMetadata(metadata, gecko.id);
    const metadataUrl = pinataService.getIpfsUri(metadataHash);
    
    console.log(`✅ Metadata uploaded: ${metadataHash}`);

    // Step 5: Store in database
    const mintedGecko: MintedGecko = {
      id: gecko.id,
      walletAddress,
      traits: gecko.traits,
      traitsHash: gecko.traitsHash,
      rarityScore: gecko.rarityScore,
      isUltraRare: gecko.isUltraRare,
      imageHash,
      metadataHash,
      mintedAt: new Date().toISOString()
    };

    await geckoDatabase.addMintedGecko(mintedGecko);

    // TODO: Step 6: Mint Solana NFT
    // const nftMint = await mintSolanaNFT(walletAddress, metadataUrl);

    const dbStats = geckoDatabase.getStats();

    console.log(`🎉 Mint complete for gecko #${gecko.id}!`);

    // Return success response
    return NextResponse.json({
      success: true,
      gecko: {
        id: gecko.id,
        name: gecko.name,
        traits: gecko.traits,
        rarityScore: gecko.rarityScore,
        isUltraRare: gecko.isUltraRare,
        traitsHash: gecko.traitsHash
      },
      imageUrl,
      metadataUrl,
      imageHash,
      metadataHash,
      // nftMint, // TODO: Add when Solana minting is implemented
      collection: {
        totalMinted: dbStats.totalMinted,
        ultraRareCount: dbStats.ultraRareCount,
        averageRarity: dbStats.averageRarity
      }
    });

  } catch (error: any) {
    console.error('❌ Mint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to mint gecko',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// GET endpoint to check mint status and collection stats
export async function GET(request: NextRequest) {
  try {
    await initializeServices();

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    const dbStats = geckoDatabase.getStats();
    const generatorStats = liveGeckoGenerator.getStats();

    const response: any = {
      success: true,
      collection: {
        totalMinted: dbStats.totalMinted,
        uniqueWallets: dbStats.uniqueWallets,
        ultraRareCount: dbStats.ultraRareCount,
        averageRarity: dbStats.averageRarity
      },
      generator: {
        totalLayers: generatorStats.totalLayers,
        cachedImages: generatorStats.cachedImages,
        traitCategories: generatorStats.traitCategories
      },
      recentMints: geckoDatabase.getRecentMints(5).map(g => ({
        id: g.id,
        traits: g.traits,
        rarityScore: g.rarityScore,
        isUltraRare: g.isUltraRare,
        mintedAt: g.mintedAt
      }))
    };

    // Include wallet-specific data if wallet address provided
    if (walletAddress) {
      const walletGeckos = geckoDatabase.getGeckosByWallet(walletAddress);
      response.wallet = {
        address: walletAddress,
        mintCount: walletGeckos.length,
        geckos: walletGeckos.map(g => ({
          id: g.id,
          name: `Greedy Gecko #${g.id}`,
          traits: g.traits,
          rarityScore: g.rarityScore,
          isUltraRare: g.isUltraRare,
          mintedAt: g.mintedAt
        }))
      };
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Status check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get mint status'
    }, { status: 500 });
  }
}
