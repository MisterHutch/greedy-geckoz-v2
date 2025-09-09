// API endpoint for generating gecko without minting (for testing/preview)
import { NextRequest, NextResponse } from 'next/server';
import { liveGeckoGenerator } from '@/lib/services/LiveGeckoGenerator';
import { geckoDatabase } from '@/lib/services/GeckoDatabase';

// Initialize services on first request
let isInitialized = false;

async function initializeServices() {
  if (isInitialized) return;
  
  try {
    console.log('🔧 Initializing services...');
    await Promise.all([
      liveGeckoGenerator.initialize(),
      geckoDatabase.initialize()
    ]);
    isInitialized = true;
    console.log('✅ Services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize services if needed
    await initializeServices();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeImage = searchParams.get('includeImage') === 'true';

    // Get existing hashes for duplicate prevention
    const existingHashes = geckoDatabase.getExistingHashes();
    const nextId = geckoDatabase.getNextGeckoId();

    // Generate unique gecko
    const gecko = await liveGeckoGenerator.generateUniqueGecko(nextId, existingHashes);

    // Generate image if requested
    let imageBase64 = undefined;
    if (includeImage) {
      console.log(`🎨 Compositing gecko #${gecko.id}...`);
      const imageBuffer = await liveGeckoGenerator.composeGeckoImage(gecko);
      imageBase64 = imageBuffer.toString('base64');
    }

    // Return response
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
      imageBase64: imageBase64 ? `data:image/png;base64,${imageBase64}` : undefined,
      metadata: {
        totalMinted: geckoDatabase.getStats().totalMinted,
        uniqueCombinations: existingHashes.size,
        generatorStats: liveGeckoGenerator.getStats()
      }
    });

  } catch (error: any) {
    console.error('❌ Generate gecko error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate gecko',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeServices();

    const body = await request.json();
    const { count = 1, includeImages = false } = body;

    if (count > 10) {
      return NextResponse.json({
        success: false,
        error: 'Cannot generate more than 10 geckos at once'
      }, { status: 400 });
    }

    const existingHashes = geckoDatabase.getExistingHashes();
    const geckos = [];

    for (let i = 0; i < count; i++) {
      const nextId = geckoDatabase.getNextGeckoId() + i;
      const gecko = await liveGeckoGenerator.generateUniqueGecko(nextId, existingHashes);
      
      let imageBase64 = undefined;
      if (includeImages) {
        const imageBuffer = await liveGeckoGenerator.composeGeckoImage(gecko);
        imageBase64 = imageBuffer.toString('base64');
      }

      geckos.push({
        ...gecko,
        imageBase64: imageBase64 ? `data:image/png;base64,${imageBase64}` : undefined
      });

      // Add to existing hashes to prevent duplicates within this batch
      existingHashes.add(gecko.traitsHash);
    }

    return NextResponse.json({
      success: true,
      geckos,
      count: geckos.length
    });

  } catch (error: any) {
    console.error('❌ Batch generate error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate geckos'
    }, { status: 500 });
  }
}