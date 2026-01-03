# Contributing

Thanks for helping improve Greedy Geckoz V2.

## Quick start

- Install Node.js (recommended: Node 20 LTS)
- Install deps: `npm ci`
- Run dev: `npm run dev`

## Tests

- Run all tests: `npm test`
- CI test run: `npm run test:ci`

## Lint/build

- Lint: `npm run lint`
- Build: `npm run build`

## Environment variables

Create `.env.local` (see `env-setup-instructions.md`). Minimum for mint flows:

- `PINATA_API_KEY`
- `PINATA_SECRET_API_KEY`
- `NEXT_PUBLIC_RPC_ENDPOINT`
- `NEXT_PUBLIC_TREASURY_ADDRESS`

## Pull requests

- Keep PRs focused and small.
- Prefer adding/adjusting tests for behavior changes.
- Avoid modifying trait rarity math unless explicitly intended.

## Project map

- API routes: `app/api/**`
- Core mint pipeline: `app/api/mint-gecko/route.ts` → `lib/generative/**` → `lib/ipfs/**` → `lib/solana/**`
- Tests: `tests/**`
