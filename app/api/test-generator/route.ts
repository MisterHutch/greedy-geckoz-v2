// Test API endpoint to verify the LiveGeckoGenerator works
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing LiveGeckoGenerator...');
    
    // Use disabled generator for build compatibility
    const { disabledGeckoGenerator: liveGeckoGenerator } = await import('@/lib/services/DisabledGeckoGenerator');
    
    // Initialize generator
    await liveGeckoGenerator.initialize();
    console.log('✅ Generator initialized');

    // Generate a test gecko
    const gecko = await liveGeckoGenerator.generateUniqueGecko(9999);
    console.log('✅ Test gecko generated:', gecko.name);

    // Generate image
    const imageBuffer = await liveGeckoGenerator.composeGeckoImage(gecko);
    const imageBase64 = imageBuffer.toString('base64');
    console.log('✅ Image composed');

    // Create metadata
    const metadata = liveGeckoGenerator.createMetadata(gecko, 'https://test.com/image.png');
    console.log('✅ Metadata created');

    return NextResponse.json({
      success: true,
      message: 'LiveGeckoGenerator test successful!',
      gecko: {
        id: gecko.id,
        name: gecko.name,
        traits: gecko.traits,
        rarityScore: gecko.rarityScore,
        isUltraRare: gecko.isUltraRare,
        traitsHash: gecko.traitsHash
      },
      imageBase64: `data:image/png;base64,${imageBase64}`,
      metadata,
      generatorStats: liveGeckoGenerator.getStats()
    });

  } catch (error: any) {
    console.error('❌ Generator test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
