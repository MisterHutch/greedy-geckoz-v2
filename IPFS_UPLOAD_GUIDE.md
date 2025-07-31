# 🚀 **IPFS Upload Guide - Get Your 957 Geckos Online!**

## 🎯 **Quick Setup (5 minutes)**

### **1. Get Pinata Account (FREE)**
1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up for free account (1GB free storage)
3. Go to API Keys section
4. Create new API key with "Pinning" permissions

### **2. Configure Environment**
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your Pinata keys:
PINATA_API_KEY=your_actual_api_key_here
PINATA_SECRET_API_KEY=your_actual_secret_key_here
```

### **3. Install Dependencies**
```bash
npm install
```

### **4. Test Upload (RECOMMENDED)**
```bash
# Test with one gecko first
npm run test-upload
```

### **5. Upload All 957 Geckos**
```bash
# Upload everything to IPFS
npm run upload-geckos
```

## 📊 **What Happens During Upload**

### **Phase 1: Images (957 files)**
```
📸 Uploading images to IPFS...
   Uploading: 0.png (1/957) 0%
   Uploading: 1.png (2/957) 0%
   ...
   Uploading: 2221.png (957/957) 100%
✅ 957 images uploaded
💾 Image mapping saved to assets/uploaded/image-mapping.json
```

### **Phase 2: Metadata (957 files)**
```
📄 Generating and uploading metadata...
   Metadata: Gecko #0 (1/957) 0%
   Metadata: Gecko #1 (2/957) 0%
   ...
   Metadata: Gecko #2221 (957/957) 100%
✅ 957 metadata files uploaded
💾 Metadata mapping saved to assets/uploaded/metadata-mapping.json
```

## 🎪 **Generated Files**

After upload, you'll have:

```
assets/uploaded/
├── image-mapping.json     # Gecko ID → IPFS image URL
└── metadata-mapping.json  # Gecko ID → IPFS metadata URL
```

**Example image-mapping.json:**
```json
{
  "0": "https://gateway.pinata.cloud/ipfs/QmHash123...",
  "1": "https://gateway.pinata.cloud/ipfs/QmHash456...",
  "2221": "https://gateway.pinata.cloud/ipfs/QmHash789..."
}
```

## 🦎 **Generated Metadata**

Each Gecko gets rich metadata:

```json
{
  "name": "Greedy Gecko #1337",
  "description": "A greedy little gecko ready to lose money on Solana. Part of the exclusive 957 Gecko collection where degens gather to embrace beautiful financial chaos.",
  "image": "https://gateway.pinata.cloud/ipfs/QmHash...",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Cosmic Purple"
    },
    {
      "trait_type": "Eyes", 
      "value": "Laser Vision"
    },
    {
      "trait_type": "Hat",
      "value": "Diamond Crown"
    },
    {
      "trait_type": "Accessory",
      "value": "Gold Chain"
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Degen Level",
      "value": "Diamond Hands"
    }
  ]
}
```

## ⚡ **Upload Performance**

**Optimized for speed:**
- 3 concurrent uploads (avoids rate limits)
- 200ms delay between batches
- Automatic retry on failures
- Progress tracking in real-time

**Estimated time:**
- **Images**: ~15-20 minutes (957 files)
- **Metadata**: ~10-15 minutes (957 files)
- **Total**: ~30-35 minutes for complete upload

## 🔧 **Troubleshooting**

### **Rate Limit Errors**
```
Error: Upload failed: Rate limit exceeded
```
**Solution**: Script automatically handles this with delays

### **Missing API Keys**
```
❌ Missing Pinata credentials!
```
**Solution**: Add keys to `.env.local`

### **Network Errors**
```
Error: Upload failed: Network timeout
```
**Solution**: Script will retry failed uploads

### **File Not Found**
```
❌ No PNG files found in assets/images/
```
**Solution**: Make sure your 957 geckos are in `assets/images/`

## 💰 **Pinata Costs**

**Free Tier (Perfect for you):**
- 1GB storage (your collection ~200MB)
- 100 requests/month (you need ~2000)
- **Cost**: FREE ✅

**If you exceed:**
- Upgrade to paid plan ($20/month)
- Or use multiple free accounts

## 🎯 **After Upload Success**

You'll have:
1. ✅ 957 Gecko images on IPFS
2. ✅ 957 metadata files on IPFS  
3. ✅ Complete URL mappings
4. ✅ Ready for mint contract integration

## 🚀 **Next Steps**

After IPFS upload:
1. **Update mint program** with metadata URLs
2. **Deploy Solana contract** 
3. **Test minting** on devnet
4. **Launch on mainnet** 🚀

## 🆘 **Need Help?**

**Common Issues:**
- Pinata account setup
- API key configuration  
- Upload errors or timeouts
- File organization problems

**Just ask and I'll help debug any issues!** 🦎

---

**Ready to get your 957 Geckos on IPFS? Run `npm run test-upload` first to make sure everything works!**