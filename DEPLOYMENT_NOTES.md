# Greedy Geckoz — Deployment Notes

This repository now includes on-chain minting (devnet/mainnet), compact IPFS URIs for Token Metadata, a test mint endpoint, and consolidated RPC helpers.

## Required Environment Variables

Server (set in `.env.local` and Vercel Project Env):
- `SOLANA_RPC_ENDPOINT` — your Solana RPC URL (devnet or mainnet; prefer a provider with API key)
- `MINT_AUTHORITY_SECRET` — JSON array of your mint authority keypair (DO NOT COMMIT)
- `PINATA_API_KEY`, `PINATA_SECRET_API_KEY` — for image + JSON uploads

Client (optional, only if you surface RPC in client code):
- `NEXT_PUBLIC_RPC_ENDPOINT` — mirror of the same RPC URL
- `NEXT_PUBLIC_COLLECTION_NFT_ADDRESS` — optional collection mint to attach

## Local Test (Devnet)
1. Fund mint authority on devnet:
   - `solana airdrop 2 <MINT_AUTHORITY_PUBKEY> --url https://api.devnet.solana.com`
2. Start app: `npm run dev`
3. Test mint endpoint:
   - Browser: `http://localhost:3000/api/test-mint?wallet=<YOUR_DEVNET_WALLET>`
   - CLI: `SITE_URL=http://localhost:3000 npm run test:mint -- <YOUR_DEVNET_WALLET>`

## Production Deploy (Vercel)
1. Add vars in Vercel → Project → Settings → Environment Variables (Production & Preview)
2. Redeploy (Clear Cache recommended after dependency changes)

## New Endpoints & Scripts
- `GET /api/test-mint?wallet=<ADDR>&count=1` — Executes a full mint flow and includes `nftMint` in the response.
- `npm run test:mint` — CLI helper to hit the test endpoint.

## Notes
- Token Metadata URI must be short — we now use `ipfs://CID` on-chain.
- Server-side RPC reads `SOLANA_RPC_ENDPOINT` by default.
- If `MINT_AUTHORITY_SECRET` is not set, on-chain mint is skipped (image/JSON still upload).

