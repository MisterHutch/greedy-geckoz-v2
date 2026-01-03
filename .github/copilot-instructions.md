# Greedy Geckoz V2 - AI Coding Agent Instructions

## Project Overview
This is a Solana NFT project built with Next.js 15, featuring real-time generative gecko creation, NFT minting with lottery mechanics, and gated community features. The app uses a "degen terminal" aesthetic with green-on-black styling.

## Key Architecture

### Core Service Boundaries
- **Minting Pipeline**: `app/api/mint-gecko/route.ts` → `lib/generative/gecko-generator.ts` → `lib/ipfs/pinata-service.ts` → `lib/solana/gecko-mint-service.ts`
- **NFT Generation**: Layer-based system in `lib/generative/` with trait rarity calculations
- **Wallet Integration**: Solana wallet adapters with ownership verification in `app/api/verify-gecko-ownership/`
- **Gated Access**: Components check NFT ownership before rendering content (see `GatedAccess.tsx`)

### Critical Data Flows
1. **Mint Flow**: User clicks mint → Coin flip gamble → Generate gecko traits → Upload to IPFS → Mint NFT → Lottery check
2. **Generation**: `gecko-generator.ts` uses weighted trait system from `GECKO_TRAIT_SYSTEM` constant
3. **Ownership**: Frontend calls `/api/verify-gecko-ownership` → queries Solscan API → enables gated features

## Development Workflows

### Essential Commands
```bash
# Development with Turbo (preferred)
npm run dev

# Testing (uses Jest + Testing Library)
npm test           # Run all tests
npm run test:watch # Watch mode for development

# NFT Operations (requires .env.local setup)
npm run upload-geckos     # Deploy collection to IPFS
npm run deploy-collection # Deploy Metaplex collection
```

### Environment Setup Requirements
Create `.env.local` with:
- `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` (critical for IPFS uploads)
- `NEXT_PUBLIC_RPC_ENDPOINT` (Solana RPC, defaults to devnet)
- `NEXT_PUBLIC_TREASURY_ADDRESS` (mint payments destination)

Missing Pinata keys will cause all minting to fail silently.

## Project-Specific Patterns

### Component Architecture
- **Gated Components**: Always wrap NFT-holder content with `<GatedAccess>` (see `dashboard/page.tsx`)
- **Error Boundaries**: Critical mint flows wrapped in `<ErrorBoundary>` with toast notifications
- **Mobile-First**: All components built with responsive design using Tailwind breakpoints

### Solana Integration Patterns
```typescript
// Standard ownership verification pattern
const verifyOwnership = async (walletAddress: string) => {
  const response = await fetch('/api/verify-gecko-ownership', {
    method: 'POST',
    body: JSON.stringify({ walletAddress })
  });
  return response.json();
};
```

### Testing Conventions
- Unit tests in `tests/unit/` mirror `lib/` structure
- Integration tests in `tests/integration/` test full API flows
- Mock Solana connections for deterministic testing
- Use `@testing-library/react` for component testing

### Asset Management
- Gecko layers stored in `assets/` directory with structured naming
- Generated geckos cached in `generated-geckos/` (gitignored)
- Production collection data in `public/data/collection-2025.json`

## Critical Integration Points

### IPFS Service (`lib/ipfs/pinata-service.ts`)
- Handles image and metadata uploads
- Must be initialized before any mint operations
- Has built-in retry logic for failed uploads

### Metaplex Integration (`lib/metaplex/nft-service.ts`)
- Uses `@metaplex-foundation/js` for NFT creation
- Requires proper authority keypair setup
- Handles both individual and bulk minting

### Canvas Generation (`lib/generative/gecko-generator.ts`)
- Uses `@napi-rs/canvas` for server-side image composition
- Layer ordering critical (zIndex in trait definitions)
- Memory management important for bulk generation

## Deployment Notes
- Deployed on Vercel with security headers in `vercel.json`
- Uses `serverExternalPackages: ['@napi-rs/canvas']` for Next.js 15 compatibility
- Build warnings about `pino-pretty` and peer dependencies are non-critical
- Production uses mainnet RPC, development uses devnet

## Common Gotchas
- Canvas requires server-side rendering (`runtime = 'nodejs'` in API routes)
- Wallet connections need client-side hydration checks
- Trait generation uses weighted randomness - don't modify without understanding rarity math
- IPFS uploads can timeout - always implement retry logic