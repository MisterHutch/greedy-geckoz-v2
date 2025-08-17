# 🦎 Greedy Geckoz NFT Setup Guide

## Current Status ✅

### ✅ **Implemented & Ready:**
- **Metaplex Integration**: Complete NFT minting system using @metaplex-foundation/js
- **IPFS Pinata Storage**: Gecko images and metadata will be stored on IPFS
- **Smart Contract Integration**: NFTs created as SPL tokens on Solana
- **Frontend Integration**: UI ready to display NFT mint results
- **Build Status**: All code compiles successfully

### ⚠️ **Requires Completion:**

## Step 1: Deploy Collection (CRITICAL) 

**What's needed:**
- Private key for treasury wallet: `Cs3etBd1Mw9xptSgFZFmcK41PALcm1XHX6yHmS5HsPLY`
- ~0.01-0.02 SOL for deployment transactions

**How to deploy:**
1. **Get treasury wallet private key** (secure this!)
2. **Fund wallet** with ~0.02 SOL for transactions
3. **Update deployment script** at `scripts/deploy-collection.js`:
   ```javascript
   // Replace line 43 with your treasury keypair:
   const collectionAuthority = Keypair.fromSecretKey(
     new Uint8Array([/* your private key array */])
   );
   ```
4. **Run deployment:**
   ```bash
   node scripts/deploy-collection.js
   ```
5. **Save output** - you'll get a collection NFT address

## Step 2: Update Environment Variables

After deployment, update `.env.local`:
```bash
NEXT_PUBLIC_COLLECTION_NFT_ADDRESS=YOUR_DEPLOYED_COLLECTION_ADDRESS
```

## Step 3: Test NFT Minting

1. Connect wallet on website
2. Mint a gecko
3. Check if NFT appears in wallet
4. Verify on Solscan

---

## 🔧 Technical Details

### What Users Get After Deployment:
- **Real Solana NFTs** in their wallet after payment
- **IPFS-hosted images** (decentralized storage)  
- **Collection verification** (part of official Greedy Geckoz collection)
- **Solscan links** to verify NFT creation
- **Lottery system** with real NFT rewards

### Files Modified for NFT Integration:
- `lib/metaplex/nft-service.ts` - Core NFT creation logic
- `lib/ipfs/pinata-service.ts` - IPFS metadata/image upload
- `lib/solana/gecko-mint-service.ts` - Updated to mint real NFTs
- `app/components/MintInterface.tsx` - UI for NFT status display

### Current Behavior:
- ✅ SOL payments work correctly
- ✅ Treasury receives funds
- ❌ NFT minting fails (no collection deployed)
- ❌ Users see "NFT System Status" warning

---

## 🚨 Security Notes

**CRITICAL**: Never commit private keys to git!

**Safe approach:**
1. Create deployment from secure environment
2. Use environment variables for private keys
3. Keep collection authority secure
4. Consider using a dedicated deployment wallet

---

## 📞 Next Steps

1. **Admin**: Deploy collection with treasury wallet private key
2. **Update**: Collection address in environment variables  
3. **Test**: Complete end-to-end NFT minting flow
4. **Deploy**: Push updated environment to production

The Metaplex implementation is **100% complete** - just needs the one-time collection deployment!