'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGeckoOwnership } from '@/lib/hooks/useGeckoOwnership';

interface GatedAccessProps {
  children: React.ReactNode;
  fallbackUrl?: string;
  loadingComponent?: React.ReactNode;
  noAccessComponent?: React.ReactNode;
}

export function GatedAccess({
  children,
  fallbackUrl = '/mint',
  loadingComponent,
  noAccessComponent,
}: GatedAccessProps) {
  const { connected } = useWallet();
  const { ownershipData, isLoading, hasAccess, error } = useGeckoOwnership();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not connected to wallet
    if (!connected) {
      console.log('🔒 No wallet connected - redirecting to mint page');
      router.push(fallbackUrl);
      return;
    }

    // Redirect if no gecko access after loading completes
    if (!isLoading && !hasAccess && !error) {
      console.log('🔒 No gecko ownership detected - redirecting to mint page');
      router.push(fallbackUrl);
      return;
    }
  }, [connected, isLoading, hasAccess, error, router, fallbackUrl]);

  // Show loading state
  if (!connected || isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="text-white/80">
              {!connected ? 'Connecting wallet...' : 'Verifying gecko ownership...'}
            </p>
          </div>
        </div>
      )
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center space-y-4 max-w-md mx-auto px-6">
          <div className="text-red-400 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-white">Verification Error</h2>
          <p className="text-white/80">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show no access state
  if (!hasAccess) {
    return (
      noAccessComponent || (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="text-center space-y-6 max-w-lg mx-auto px-6">
            <div className="text-8xl">🦎</div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white">Gecko Access Required</h2>
              <p className="text-white/80 text-lg">
                You need to own a Greedy Gecko NFT to access this feature!
              </p>
              <p className="text-green-400 text-sm">
                {ownershipData?.geckoCount === 0
                  ? 'No geckos found in your wallet'
                  : 'Unable to verify gecko ownership'}
              </p>
            </div>
            <button
              onClick={() => router.push('/mint')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
            >
              Mint Your Gecko 🚀
            </button>
          </div>
        </div>
      )
    );
  }

  // User has access - show the protected content
  return (
    <div>
      {/* Access indicator for owned geckos */}
      {ownershipData && (
        <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✅</span>
            <p className="text-green-100 text-sm">
              Access granted • {ownershipData.geckoCount} gecko{ownershipData.geckoCount !== 1 ? 's' : ''} owned
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}