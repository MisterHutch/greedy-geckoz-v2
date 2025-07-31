# 🦎 **Gecko Asset Upload Guide**

## 📁 **Directory Structure**

Place your 5000 Gecko assets in these locations:

```
greedy-geckoz-refresh/
├── assets/
│   ├── images/           👈 PUT YOUR PNG FILES HERE
│   │   ├── 1.png
│   │   ├── 2.png
│   │   ├── 3.png
│   │   └── ... (up to 5000.png)
│   └── metadata/         👈 PUT YOUR JSON FILES HERE
│       ├── 1.json
│       ├── 2.json
│       ├── 3.json
│       └── ... (up to 5000.json)
└── public/assets/images/ 👈 ALTERNATIVE: For direct web access
```

## 🎯 **Option 1: Local Asset Upload (Recommended)**

### **Step 1: Image Files**
```bash
# Place your PNG files here:
assets/images/
├── 1.png
├── 2.png
├── 3.png
├── ...
└── 5000.png
```

**Naming Convention:**
- Files must be named: `1.png`, `2.png`, `3.png`, ..., `5000.png`
- **Important**: No leading zeros (use `1.png`, not `001.png`)
- All files must be PNG format
- Recommended size: 512x512 or 1000x1000 pixels

### **Step 2: Metadata Files**
```bash
# Place your JSON files here:
assets/metadata/
├── 1.json
├── 2.json
├── 3.json
├── ...
└── 5000.json
```

**JSON Format for each file:**
```json
{
  "name": "Greedy Gecko #1",
  "description": "A greedy little gecko ready to lose money on Solana",
  "image": "1.png",
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
      "trait_type": "Rarity",
      "value": "Legendary"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "1.png",
        "type": "image/png"
      }
    ],
    "category": "image"
  }
}
```

## 🎪 **Option 2: Zip File Upload**

### **Create a zip file with this structure:**
```
geckos.zip
├── images/
│   ├── 1.png
│   ├── 2.png
│   └── ... (all 5000 PNGs)
└── metadata/
    ├── 1.json
    ├── 2.json
    └── ... (all 5000 JSONs)
```

### **Upload via Admin Panel:**
1. Go to `http://localhost:3000/admin`
2. Click "Upload Zip File"
3. Select your `geckos.zip` file
4. System automatically validates all 5000 assets

## 🚀 **Option 3: Direct Upload to IPFS**

If you want to upload directly to IPFS first:

### **Using Pinata:**
```bash
# Upload images folder
curl -X POST \
  "https://api.pinata.cloud/pinning/pinFolderToIPFS" \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET_KEY" \
  -F "file=@assets/images" \
  -F 'pinataMetadata={"name":"GreedyGeckozImages"}'

# Upload metadata folder  
curl -X POST \
  "https://api.pinata.cloud/pinning/pinFolderToIPFS" \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET_KEY" \
  -F "file=@assets/metadata" \
  -F 'pinataMetadata={"name":"GreedyGeckozMetadata"}'
```

## ✅ **Validation Checklist**

Before uploading, ensure:

- [ ] **5000 PNG files** named 1.png through 5000.png
- [ ] **5000 JSON files** named 1.json through 5000.json  
- [ ] **No missing numbers** (1, 2, 3... no gaps)
- [ ] **JSON format is valid** for all metadata files
- [ ] **Image dimensions consistent** (recommended 1000x1000px)
- [ ] **File sizes reasonable** (< 2MB per PNG)

## 🔧 **Auto-Upload Script**

I can create a script to help you organize your files:

```javascript
// place-assets.js - Run this to organize your files
const fs = require('fs');
const path = require('path');

// If your files are in a different format, this script can rename them
function organizeAssets() {
  const sourceDir = './your-original-assets'; // Change this path
  const targetImagesDir = './assets/images';
  const targetMetadataDir = './assets/metadata';

  // Create directories
  if (!fs.existsSync(targetImagesDir)) fs.mkdirSync(targetImagesDir, { recursive: true });
  if (!fs.existsSync(targetMetadataDir)) fs.mkdirSync(targetMetadataDir, { recursive: true });

  // Process files (customize based on your naming convention)
  for (let i = 1; i <= 5000; i++) {
    // Example: if your files are named gecko_001.png
    const sourceImage = path.join(sourceDir, `gecko_${i.toString().padStart(3, '0')}.png`);
    const targetImage = path.join(targetImagesDir, `${i}.png`);
    
    if (fs.existsSync(sourceImage)) {
      fs.copyFileSync(sourceImage, targetImage);
      console.log(`Copied ${sourceImage} -> ${targetImage}`);
    }
  }
}

// Run with: node place-assets.js
organizeAssets();
```

## 🎯 **Quick Start Commands**

```bash
# 1. Create the directories
mkdir -p assets/images assets/metadata

# 2. Copy your files (adjust paths as needed)
cp /path/to/your/pngs/* assets/images/
cp /path/to/your/jsons/* assets/metadata/

# 3. Verify file count
ls assets/images/ | wc -l  # Should show 5000
ls assets/metadata/ | wc -l  # Should show 5000

# 4. Test the upload
npm run dev
# Visit http://localhost:3000/admin
```

## 🆘 **Common Issues**

**Missing Files:**
- Make sure you have exactly 5000 PNG and 5000 JSON files
- Check for any gaps in numbering (missing 1.png, 2.png, etc.)

**Wrong Format:**
- Files must be `1.png` not `001.png` or `gecko1.png`
- JSON files must be valid JSON format

**File Size:**
- Keep PNG files under 2MB each for faster uploads
- Total collection should be under 10GB

## 📞 **Need Help?**

If you run into issues organizing your 5000 Geckos, let me know:
- What's your current file naming convention?
- Are images and metadata in separate folders?
- Any special organization needs?

**I can create custom scripts to help reorganize your assets into the correct format!** 🦎