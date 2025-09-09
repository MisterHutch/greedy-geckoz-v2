import { NextRequest, NextResponse } from 'next/server';
import { geckoOwnershipVerifier } from '@/lib/services/GeckoOwnershipVerifier';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Valid wallet address is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 API: Verifying ownership for ${walletAddress.substring(0, 8)}...`);

    const result = await geckoOwnershipVerifier.verifyGeckoOwnership(walletAddress);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Ownership verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');
  const quickCheck = searchParams.get('quick') === 'true';

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address parameter is required' },
      { status: 400 }
    );
  }

  try {
    if (quickCheck) {
      const hasAccess = await geckoOwnershipVerifier.hasGeckoAccess(walletAddress);
      return NextResponse.json({ hasAccess });
    } else {
      const result = await geckoOwnershipVerifier.verifyGeckoOwnership(walletAddress);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error('❌ Ownership verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}