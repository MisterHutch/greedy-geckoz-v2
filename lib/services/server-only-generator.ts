// Server-only gecko generator - DO NOT IMPORT IN CLIENT CODE
// This file should only be imported in API routes

import 'server-only'; // This will throw an error if imported on client

export async function createLiveGeckoGenerator() {
  // Dynamic import to ensure this never gets bundled for client
  const { LiveGeckoGenerator } = await import('./LiveGeckoGenerator');
  return new LiveGeckoGenerator();
}

export type { GeckoData, GeckoTraits } from './LiveGeckoGenerator';