# 🔧 NFT Minting Fix - Environment Setup

## **CRITICAL: Missing API Keys**

Your NFT minting is failing because of missing PINATA API keys for IPFS uploads.

### **Step 1: Get Pinata API Keys**

1. Go to https://pinata.cloud/
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key with these permissions:
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS`
5. Copy the API Key and Secret Key

### **Step 2: Create .env.local file**

Create a file named `.env.local` in your project root with:

```env
# Solana Configuration (for testnet)
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_NETWORK=devnet

# REQUIRED: PINATA API Keys (replace with your actual keys)
PINATA_API_KEY=your_actual_pinata_api_key_here
PINATA_SECRET_API_KEY=your_actual_pinata_secret_key_here

# Treasury wallet address
NEXT_PUBLIC_TREASURY_ADDRESS=Cs3etBd1Mw9xptSgFZFmcK41PALcm1XHX6yHmS5HsPLY
```

### **Step 3: Test the fix**

1. Restart your development server: `npm run dev`
2. Try minting a gecko on testnet
3. Check browser console for these logs:
   - ✅ `📤 Image uploaded to IPFS: [hash]`
   - ✅ `📤 Metadata uploaded to IPFS: [hash]`  
   - ✅ `✅ Generative NFT minted successfully: [address]`

## **Alternative: Temporary Mock Mode**

If you want to test without IPFS, I can create a mock mode that uses placeholder metadata.

## **Why this fixes the issue:**

- ❌ **Before**: Generative service fails at IPFS upload step
- ❌ **Before**: NFT minting never happens because metadata upload fails
- ✅ **After**: Complete pipeline works with real IPFS hosting
- ✅ **After**: NFT appears in Phantom wallet with generated image

**This should resolve your NFT not appearing in Phantom wallet!** 🦎✨