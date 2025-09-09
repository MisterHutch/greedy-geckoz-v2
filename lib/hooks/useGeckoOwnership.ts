'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { OwnershipResult } from '@/lib/services/GeckoOwnershipVerifier';

interface UseGeckoOwnershipReturn {
  ownershipData: OwnershipResult | null;
  isLoading: boolean;
  hasAccess: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGeckoOwnership(): UseGeckoOwnershipReturn {
  const { publicKey, connected } = useWallet();
  const [ownershipData, setOwnershipData] = useState<OwnershipResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOwnership = useCallback(async () => {
    if (!publicKey || !connected) {
      setOwnershipData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-gecko-ownership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: OwnershipResult = await response.json();
      setOwnershipData(result);

      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      console.error('❌ Ownership verification failed:', err);
      setError(err.message || 'Failed to verify gecko ownership');
      setOwnershipData(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected]);

  // Auto-fetch when wallet connects or changes
  useEffect(() => {
    fetchOwnership();
  }, [fetchOwnership]);

  return {
    ownershipData,
    isLoading,
    hasAccess: ownershipData?.hasAccess ?? false,
    error,
    refetch: fetchOwnership,
  };
}