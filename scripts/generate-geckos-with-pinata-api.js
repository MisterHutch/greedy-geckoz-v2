// Real Gecko PNG Generator using Pinata Files API
// This script auto-discovers your layer assets on Pinata and generates real PNGs

const { createCanvas, loadImage, Image } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

// Configuration - REQUIRED: Add your Pinata JWT
const PINATA_CONFIG = {
  jwt: process.env.PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4NjU1MDdlMC01ZDlkLTQzYTktYmY1ZC1kNjBjMWEzODEwY2MiLCJlbWFpbCI6Iml1aHV0Y2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjY2YzUyYzY4NGY2MGZlMmM4YTcxIiwic2NvcGVkS2V5U2VjcmV0IjoiMDAyZTI0NThhOWZhMGY1YzAzZGUyNDNhNzhlOTNiZGQ0NjhkZTVlMmRjYzg2ZmYxNjQ5ZGI3N2U5YTkyMDBkMiIsImV4cCI6MTc4ODUwODI4MX0.cNad2MNpssy9ycxe36XqL_EG4YnoxOv7AOMivWgqhmk', // Get from .env or replace directly
  baseApiUrl: 'https://api.pinata.cloud/v3',
  gatewayUrl: 'https://gateway.pinata.cloud/ipfs',
  canvasWidth: 512,
  canvasHeight: 512
};

class PinataGeckoGenerator {
  constructor() {
    this.layerAssets = new Map(); // Will store discovered layer assets from Pinata
    this.imageCache = new Map();
    
    // Expected layer structure based on your trait system
    this.expectedLayers = {
      'Background': ['Aquamarine', 'Seafoam', 'Chill', 'Driftwood', 'Hopbush', 'Sand', 'Jasmin', 'Parchment', 'Salmon', 'Biloba Flower', 'Studded Diamonds', 'Kollidz'],
      'Skin': ['Green', 'Corn', 'Rusty', 'Ember', 'Rose', 'Pale Cerulean', 'Trippy', 'Zombie'],
      'Eyez': ['Angry', 'Afraid', 'Complacent', 'Exhausted', 'Red Eye', 'Terrified', 'Hopeful', 'Bored', 'Disgusted', 'Heaven', 'Evil', 'Laser'],
      'Outfit': ['Black Sweater', 'Green Polo', 'Tom Hill', 'Sleeveless', 'Tuxedo', 'Pullover Hoodie', 'War Suit', 'Space Suit'],
      'Head': ['Rocket', 'Beanie', 'Devil', 'Glowing Mushroom', 'Frank Bandana', 'Golden Horn', 'Cowboy Hat', 'Backwards Cap', 'Tattooz'],
      'Armz': ['Axe', 'Bane', 'Baseball', 'Crowbar', 'Montana', 'Phoenix Fury', 'Shotgun', 'Bearded Axe', 'Jungle Bolo', 'Katana', 'Spear', 'Sunrise', 'Thunderseal']
    };

    // Trait rarity weights
    this.traitSystem = [
      {
        name: 'Background',
        layers: [
          { name: 'Aquamarine', rarity: 25, zIndex: 1 },
          { name: 'Seafoam', rarity: 25, zIndex: 1 },
          { name: 'Chill', rarity: 7.5, zIndex: 1 },
          { name: 'Driftwood', rarity: 7.5, zIndex: 1 },
          { name: 'Hopbush', rarity: 7.5, zIndex: 1 },
          { name: 'Sand', rarity: 7.5, zIndex: 1 },
          { name: 'Jasmin', rarity: 5, zIndex: 1 },
          { name: 'Parchment', rarity: 5, zIndex: 1 },
          { name: 'Salmon', rarity: 5, zIndex: 1 },
          { name: 'Biloba Flower', rarity: 0.7, zIndex: 1 },
          { name: 'Studded Diamonds', rarity: 0.7, zIndex: 1 },
          { name: 'Kollidz', rarity: 0.7, zIndex: 1 }
        ]
      },
      {
        name: 'Skin',
        layers: [
          { name: 'Green', rarity: 45, zIndex: 2 },
          { name: 'Corn', rarity: 15, zIndex: 2 },
          { name: 'Rusty', rarity: 15, zIndex: 2 },
          { name: 'Ember', rarity: 10, zIndex: 2 },
          { name: 'Rose', rarity: 7.5, zIndex: 2 },
          { name: 'Pale Cerulean', rarity: 5, zIndex: 2 },
          { name: 'Trippy', rarity: 2.5, zIndex: 2 },
          { name: 'Zombie', rarity: 2.5, zIndex: 2 }
        ]
      },
      {
        name: 'Outfit',
        layers: [
          { name: 'None', rarity: 25, zIndex: 0 },
          { name: 'Black Sweater', rarity: 35, zIndex: 3 },
          { name: 'Green Polo', rarity: 6.25, zIndex: 3 },
          { name: 'Tom Hill', rarity: 6.25, zIndex: 3 },
          { name: 'Sleeveless', rarity: 6.25, zIndex: 3 },
          { name: 'Tuxedo', rarity: 6.25, zIndex: 3 },
          { name: 'Pullover Hoodie', rarity: 5, zIndex: 3 },
          { name: 'War Suit', rarity: 1.7, zIndex: 3 },
          { name: 'Space Suit', rarity: 1.6, zIndex: 3 }
        ]
      },
      {
        name: 'Eyez',
        layers: [
          { name: 'Angry', rarity: 16.7, zIndex: 4 },
          { name: 'Afraid', rarity: 16.7, zIndex: 4 },
          { name: 'Complacent', rarity: 16.6, zIndex: 4 },
          { name: 'Exhausted', rarity: 10, zIndex: 4 },
          { name: 'Red Eye', rarity: 10, zIndex: 4 },
          { name: 'Terrified', rarity: 10, zIndex: 4 },
          { name: 'Hopeful', rarity: 5, zIndex: 4 },
          { name: 'Bored', rarity: 5, zIndex: 4 },
          { name: 'Disgusted', rarity: 5, zIndex: 4 },
          { name: 'Heaven', rarity: 1.7, zIndex: 4 },
          { name: 'Evil', rarity: 1.7, zIndex: 4 },
          { name: 'Laser', rarity: 1.6, zIndex: 4 }
        ]
      },
      {
        name: 'Head',
        layers: [
          { name: 'None', rarity: 40, zIndex: 0 },
          { name: 'Rocket', rarity: 25, zIndex: 5 },
          { name: 'Beanie', rarity: 4, zIndex: 5 },
          { name: 'Devil', rarity: 4, zIndex: 5 },
          { name: 'Glowing Mushroom', rarity: 4, zIndex: 5 },
          { name: 'Frank Bandana', rarity: 3.3, zIndex: 5 },
          { name: 'Golden Horn', rarity: 3.3, zIndex: 5 },
          { name: 'Cowboy Hat', rarity: 1, zIndex: 5 },
          { name: 'Backwards Cap', rarity: 1, zIndex: 5 },
          { name: 'Tattooz', rarity: 1, zIndex: 5 }
        ]
      },
      {
        name: 'Armz',
        layers: [
          { name: 'None', rarity: 30, zIndex: 0 },
          { name: 'Axe', rarity: 8.75, zIndex: 6 },
          { name: 'Bane', rarity: 8.75, zIndex: 6 },
          { name: 'Baseball', rarity: 8.75, zIndex: 6 },
          { name: 'Crowbar', rarity: 8.75, zIndex: 6 },
          { name: 'Montana', rarity: 4, zIndex: 6 },
          { name: 'Phoenix Fury', rarity: 4, zIndex: 6 },
          { name: 'Shotgun', rarity: 4, zIndex: 6 },
          { name: 'Bearded Axe', rarity: 3.3, zIndex: 6 },
          { name: 'Jungle Bolo', rarity: 3.3, zIndex: 6 },
          { name: 'Katana', rarity: 3.4, zIndex: 6 },
          { name: 'Spear', rarity: 1.7, zIndex: 6 },
          { name: 'Sunrise', rarity: 1.7, zIndex: 6 },
          { name: 'Thunderseal', rarity: 1.6, zIndex: 6 }
        ]
      }
    ];
  }

  // Check Pinata API configuration
  checkConfiguration() {
    console.log('🔧 Checking Pinata Configuration...');
    console.log('================================================================================');
    
    if (PINATA_CONFIG.jwt === 'YOUR_PINATA_JWT_HERE') {
      console.log('❌ Pinata JWT not configured');
      console.log('   Please set PINATA_JWT environment variable or update the script');
      console.log('   Get your JWT from: https://pinata.cloud/keys');
      return false;
    }
    
    console.log('✅ Pinata JWT configured');
    console.log(`🌐 Gateway URL: ${PINATA_CONFIG.gatewayUrl}`);
    console.log(`🎨 Canvas Size: ${PINATA_CONFIG.canvasWidth}x${PINATA_CONFIG.canvasHeight}`);
    return true;
  }

  // Discover layer assets from Pinata
  async discoverLayerAssets() {
    console.log('🔍 Discovering Layer Assets on Pinata...');
    console.log('================================================================================');

    const headers = {
      'Authorization': `Bearer ${PINATA_CONFIG.jwt}`
    };

    let discoveredCount = 0;

    try {
      // Search for layer assets by category
      for (const category of Object.keys(this.expectedLayers)) {
        console.log(`🔎 Searching for ${category} layers...`);
        
        const response = await axios.get(`${PINATA_CONFIG.baseApiUrl}/files/public`, {
          headers,
          params: {
            name: category.toLowerCase(),
            mimeType: 'image/png',
            limit: 50
          }
        });

        if (response.data.data && response.data.data.files) {
          const categoryFiles = response.data.data.files.filter(file => 
            file.name.toLowerCase().includes(category.toLowerCase()) ||
            this.expectedLayers[category].some(trait => file.name.includes(trait))
          );

          console.log(`   Found ${categoryFiles.length} ${category} files`);
          
          // Store discovered assets
          categoryFiles.forEach(file => {
            const key = `${category}/${file.name}`;
            this.layerAssets.set(key, {
              name: file.name,
              cid: file.cid,
              category: category,
              url: `${PINATA_CONFIG.gatewayUrl}/${file.cid}`
            });
            discoveredCount++;
          });
        }
      }

      // Also try a broader search for gecko layer files
      console.log('🔎 Searching for general gecko layer files...');
      const broadResponse = await axios.get(`${PINATA_CONFIG.baseApiUrl}/files/public`, {
        headers,
        params: {
          name: 'gecko',
          mimeType: 'image/png',
          limit: 100
        }
      });

      if (broadResponse.data.data && broadResponse.data.data.files) {
        broadResponse.data.data.files.forEach(file => {
          // Try to categorize the file based on its path or name
          for (const category of Object.keys(this.expectedLayers)) {
            if (file.name.toLowerCase().includes(category.toLowerCase())) {
              const key = `${category}/${file.name}`;
              if (!this.layerAssets.has(key)) {
                this.layerAssets.set(key, {
                  name: file.name,
                  cid: file.cid,
                  category: category,
                  url: `${PINATA_CONFIG.gatewayUrl}/${file.cid}`
                });
                discoveredCount++;
              }
            }
          }
        });
      }

    } catch (error) {
      console.error('❌ Error discovering layer assets:', error.response?.data || error.message);
      return false;
    }

    console.log(`✅ Discovered ${discoveredCount} layer assets total`);
    
    // Show what we found
    console.log('\n📊 Assets by Category:');
    for (const category of Object.keys(this.expectedLayers)) {
      const categoryAssets = Array.from(this.layerAssets.values()).filter(asset => asset.category === category);
      console.log(`   ${category}: ${categoryAssets.length} assets`);
    }

    return discoveredCount > 0;
  }

  // Get best matching asset for a trait
  findAssetForTrait(category, traitName) {
    // First try exact match
    let bestMatch = Array.from(this.layerAssets.values()).find(asset => 
      asset.category === category && asset.name.includes(traitName)
    );

    if (!bestMatch) {
      // Try case-insensitive partial match
      bestMatch = Array.from(this.layerAssets.values()).find(asset => 
        asset.category === category && 
        asset.name.toLowerCase().includes(traitName.toLowerCase())
      );
    }

    if (!bestMatch) {
      // Try any file in the category as fallback
      bestMatch = Array.from(this.layerAssets.values()).find(asset => 
        asset.category === category
      );
    }

    return bestMatch;
  }

  async downloadImage(url) {
    return new Promise((resolve, reject) => {
      console.log(`  📥 Downloading: ${url.substring(0, 60)}...`);
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
      }).on('error', reject);
    });
  }

  async loadAssetImage(asset) {
    if (this.imageCache.has(asset.cid)) {
      return this.imageCache.get(asset.cid);
    }

    try {
      const imageBuffer = await this.downloadImage(asset.url);
      const img = new Image();
      img.src = imageBuffer;
      
      this.imageCache.set(asset.cid, img);
      return img;
    } catch (error) {
      console.log(`  ❌ Failed to load asset ${asset.name}:`, error.message);
      return null;
    }
  }

  selectWeightedRandomTrait(category) {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const layer of category.layers) {
      cumulativeWeight += layer.rarity;
      if (random <= cumulativeWeight) {
        return layer;
      }
    }

    return category.layers[category.layers.length - 1];
  }

  generateRandomGecko(mintId) {
    const selectedTraits = {};
    const selectedLayers = [];
    let rarityScore = 0;

    for (const category of this.traitSystem) {
      const selectedTrait = this.selectWeightedRandomTrait(category);
      selectedTraits[category.name] = selectedTrait.name;
      
      if (selectedTrait.name !== 'None') {
        selectedLayers.push({
          category: category.name,
          trait: selectedTrait.name,
          zIndex: selectedTrait.zIndex,
          rarity: selectedTrait.rarity
        });
      }
      
      rarityScore += (100 - selectedTrait.rarity);
    }

    selectedLayers.sort((a, b) => a.zIndex - b.zIndex);

    return {
      id: mintId,
      name: `Greedy Gecko #${mintId}`,
      traits: selectedTraits,
      rarityScore: Math.round(rarityScore),
      selectedLayers,
      isUltraRare: this.isUltraRare(selectedTraits)
    };
  }

  isUltraRare(traits) {
    const ultraRareTraits = ['Trippy', 'Zombie', 'Laser', 'Evil', 'Thunderseal', 'Space Suit', 'Studded Diamonds', 'Kollidz', 'Biloba Flower', 'Tattooz', 'Heaven', 'War Suit', 'Sunrise', 'Spear'];
    return Object.values(traits).some(trait => ultraRareTraits.includes(trait));
  }

  async composeGeckoImage(gecko) {
    console.log(`🎨 Compositing ${gecko.name}...`);
    
    const canvas = createCanvas(PINATA_CONFIG.canvasWidth, PINATA_CONFIG.canvasHeight);
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let layersComposited = 0;
    
    for (const layer of gecko.selectedLayers) {
      console.log(`  🖼️  Adding layer: ${layer.trait} (z-${layer.zIndex})`);
      
      const asset = this.findAssetForTrait(layer.category, layer.trait);
      if (asset) {
        const image = await this.loadAssetImage(asset);
        if (image) {
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          layersComposited++;
          console.log(`    ✅ Composited: ${asset.name}`);
        } else {
          console.log(`    ⚠️  Failed to load: ${asset.name}`);
        }
      } else {
        console.log(`    ❌ No asset found for: ${layer.category}/${layer.trait}`);
      }
    }

    console.log(`  📊 Total layers composited: ${layersComposited}/${gecko.selectedLayers.length}`);
    
    return canvas.toBuffer('image/png');
  }

  async generateGeckoPngs(count = 10) {
    console.log(`🦎 Generating ${count} Real Gecko PNGs using Pinata API`);
    console.log('================================================================================');

    // Check configuration
    if (!this.checkConfiguration()) {
      throw new Error('Configuration invalid');
    }

    // Discover assets
    const hasAssets = await this.discoverLayerAssets();
    if (!hasAssets) {
      throw new Error('No layer assets found on Pinata');
    }

    // Create output directory
    const outputDir = path.join(__dirname, '..', 'pinata-gecko-pngs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`\n📁 Output Directory: ${outputDir}`);
    console.log('');

    let ultraRareCount = 0;
    let totalRarity = 0;
    let successfulGenerations = 0;

    for (let i = 1; i <= count; i++) {
      try {
        const gecko = this.generateRandomGecko(i);
        
        if (gecko.isUltraRare) ultraRareCount++;
        totalRarity += gecko.rarityScore;

        const pngBuffer = await this.composeGeckoImage(gecko);
        
        const filename = `gecko-${String(i).padStart(3, '0')}-score-${gecko.rarityScore}.png`;
        const filepath = path.join(outputDir, filename);
        
        fs.writeFileSync(filepath, pngBuffer);
        
        const rarityLabel = gecko.isUltraRare ? '⭐ ULTRA RARE' : '';
        console.log(`✅ Generated: ${filename} ${rarityLabel}`);
        console.log(`   Traits: ${Object.entries(gecko.traits).filter(([k,v]) => v !== 'None').map(([k,v]) => `${k}:${v}`).join(' | ')}`);
        
        successfulGenerations++;
        
        if (i % 5 === 0) {
          console.log(`   Progress: ${i}/${count} (${Math.round(i/count*100)}%)`);
          console.log('');
        }
      } catch (error) {
        console.error(`❌ Failed to generate gecko #${i}:`, error.message);
      }
    }

    console.log('');
    console.log('✅ Generation Complete!');
    console.log('================================================================================');
    console.log(`📊 Statistics:`);
    console.log(`   🦎 Successfully Generated: ${successfulGenerations}/${count}`);
    console.log(`   ⭐ Ultra Rare: ${ultraRareCount}/${successfulGenerations} (${Math.round(ultraRareCount/successfulGenerations*100)}%)`);
    console.log(`   📈 Average Rarity: ${Math.round(totalRarity/successfulGenerations)}`);
    console.log(`   📁 Location: ${outputDir}`);
    
    return outputDir;
  }
}

// Run the generator
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 10;
  
  const generator = new PinataGeckoGenerator();
  
  generator.generateGeckoPngs(count)
    .then(outputPath => {
      console.log(`\n🚀 All geckos generated successfully!`);
      console.log(`📂 Check folder: ${outputPath}`);
    })
    .catch(error => {
      console.error('❌ Generation failed:', error.message);
      console.log('\n💡 Make sure you have:');
      console.log('   1. Valid Pinata JWT configured');
      console.log('   2. Layer assets uploaded to Pinata');
      console.log('   3. Layer files named with category keywords (Background, Skin, etc.)');
    });
}

module.exports = { PinataGeckoGenerator };
