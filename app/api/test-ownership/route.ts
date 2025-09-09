import { NextRequest, NextResponse } from 'next/server';
import { geckoOwnershipVerifier } from '@/lib/services/GeckoOwnershipVerifier';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  
  // Test wallets for development
  const testWallets = [
    'So11111111111111111111111111111111111111112', // SOL token mint (invalid wallet)
    '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Example valid Solana address
    '11111111111111111111111111111111', // System program (invalid for wallet)
  ];

  if (!wallet) {
    return NextResponse.json({
      message: 'NFT Ownership Verification Test Endpoint',
      usage: 'Add ?wallet=WALLET_ADDRESS to test a specific wallet',
      testWallets,
      example: '/api/test-ownership?wallet=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
    });
  }

  try {
    console.log(`🧪 Testing ownership verification for: ${wallet}`);
    
    const startTime = Date.now();
    const result = await geckoOwnershipVerifier.verifyGeckoOwnership(wallet);
    const duration = Date.now() - startTime;

    // Get cache stats
    const cacheStats = geckoOwnershipVerifier.getCacheStats();

    return NextResponse.json({
      testResult: {
        wallet,
        result,
        performanceMs: duration,
        cacheStats
      }
    });

  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message,
        wallet
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testWallet, forceVerification = false } = await request.json();

    if (!testWallet) {
      return NextResponse.json(
        { error: 'testWallet is required' },
        { status: 400 }
      );
    }

    console.log(`🧪 POST test for wallet: ${testWallet} (force: ${forceVerification})`);

    const startTime = Date.now();
    const result = forceVerification 
      ? await geckoOwnershipVerifier.forceVerification(testWallet)
      : await geckoOwnershipVerifier.verifyGeckoOwnership(testWallet);
    const duration = Date.now() - startTime;

    return NextResponse.json({
      testResult: {
        wallet: testWallet,
        result,
        performanceMs: duration,
        wasForced: forceVerification,
        cacheStats: geckoOwnershipVerifier.getCacheStats()
      }
    });

  } catch (error: any) {
    console.error('❌ POST test failed:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Clear cache endpoint for testing
export async function DELETE() {
  try {
    geckoOwnershipVerifier.clearCache();
    return NextResponse.json({ 
      message: 'Cache cleared successfully',
      cacheStats: geckoOwnershipVerifier.getCacheStats()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to clear cache', details: error.message },
      { status: 500 }
    );
  }
}