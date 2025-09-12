// Real Gecko PNG Generator using Canvas and Layer Assets
// This script generates actual PNG images by compositing layer assets

const { createCanvas, loadImage, Image } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

// Configuration - UPDATE THESE WITH YOUR LAYER URLS
const LAYER_CONFIG = {
  // Option 1: Use local layers (if you have them locally)
  useLocalLayers: false,
  localLayersPath: process.env.GECKO_LAYERS_PATH || 'C:\\Users\\Hutch\\OneDrive\\Pictures\\GreedyGeckoz_Layers',
  
  // Option 2: Use Pinata/IPFS layers (UPDATE WITH YOUR ACTUAL IPFS HASHES)
  usePinataLayers: true,
  pinataBaseUrl: 'https://gateway.pinata.cloud/ipfs/',
  layerBaseHash: 'bafybeibkzxmff7iqk5ltwu6mkbiii37xfcuhk53fpa3gfrbqspemprgnau', // Your actual layers directory
  
  // Canvas settings
  canvasWidth: 512,
  canvasHeight: 512
};

class RealGeckoGenerator {
  constructor() {
    // Using the same trait system from your gecko-generator.ts
    this.traitSystem = [
      {
        name: 'Background',
        layers: [
          { name: 'Aquamarine', rarity: 25, imagePath: 'Background/Aquamarine.png', zIndex: 1 },
          { name: 'Seafoam', rarity: 25, imagePath: 'Background/Common/Seafoam.png', zIndex: 1 },
          { name: 'Chill', rarity: 7.5, imagePath: 'Background/Rare/Chill.png', zIndex: 1 },
          { name: 'Driftwood', rarity: 7.5, imagePath: 'Background/Rare/Driftwood.png', zIndex: 1 },
          { name: 'Hopbush', rarity: 7.5, imagePath: 'Background/Rare/Hopbush.png', zIndex: 1 },
          { name: 'Sand', rarity: 7.5, imagePath: 'Background/Rare/Sand.png', zIndex: 1 },
          { name: 'Jasmin', rarity: 5, imagePath: 'Background/Legendary/Jasmin.png', zIndex: 1 },
          { name: 'Parchment', rarity: 5, imagePath: 'Background/Legendary/Parchment.png', zIndex: 1 },
          { name: 'Salmon', rarity: 5, imagePath: 'Background/Legendary/Salmon.png', zIndex: 1 },
          { name: 'Biloba Flower', rarity: 0.7, imagePath: 'Background/Super Rare/Biloba Flower.png', zIndex: 1 },
          { name: 'Studded Diamonds', rarity: 0.7, imagePath: 'Background/Super Rare/Studded Diamonds.png', zIndex: 1 },
          { name: 'Kollidz', rarity: 0.7, imagePath: 'Background/Super Rare/kollidz.png', zIndex: 1 }
        ]
      },
      {
        name: 'Skin',
        layers: [
          { name: 'Green', rarity: 45, imagePath: 'Skin/Common/Green.png', zIndex: 2 },
          { name: 'Corn', rarity: 15, imagePath: 'Skin/Rare/Corn.png', zIndex: 2 },
          { name: 'Rusty', rarity: 15, imagePath: 'Skin/Rare/Rusty.png', zIndex: 2 },
          { name: 'Ember', rarity: 10, imagePath: 'Skin/Legendary/Ember.png', zIndex: 2 },
          { name: 'Rose', rarity: 7.5, imagePath: 'Skin/Legendary/Rose.png', zIndex: 2 },
          { name: 'Pale Cerulean', rarity: 5, imagePath: 'Skin/Legendary/Pale Cerulean.png', zIndex: 2 },
          { name: 'Trippy', rarity: 2.5, imagePath: 'Skin/Super Rare/Trippy.png', zIndex: 2 },
          { name: 'Zombie', rarity: 2.5, imagePath: 'Skin/Super Rare/Zombie.png', zIndex: 2 }
        ]
      },
      {
        name: 'Outfit',
        layers: [
          { name: 'None', rarity: 25, imagePath: null, zIndex: 0 },
          { name: 'Black Sweater', rarity: 35, imagePath: 'Outfit/Common/Black Sweater.png', zIndex: 3 },
          { name: 'Green Polo', rarity: 6.25, imagePath: 'Outfit/Rare/Green Polo.png', zIndex: 3 },
          { name: 'Tom Hill', rarity: 6.25, imagePath: 'Outfit/Rare/Tom_Hill.png', zIndex: 3 },
          { name: 'Sleeveless', rarity: 6.25, imagePath: 'Outfit/Rare/Sleeveless.png', zIndex: 3 },
          { name: 'Tuxedo', rarity: 6.25, imagePath: 'Outfit/Rare/Tuxedo.png', zIndex: 3 },
          { name: 'Pullover Hoodie', rarity: 5, imagePath: 'Outfit/Legendary/Pullover Hoodie.png', zIndex: 3 },
          { name: 'War Suit', rarity: 1.7, imagePath: 'Outfit/Super Rare/War Suit.png', zIndex: 3 },
          { name: 'Space Suit', rarity: 1.6, imagePath: 'Outfit/Super Rare/Space Suit.png', zIndex: 3 }
        ]
      },
      {
        name: 'Eyez',
        layers: [
          { name: 'Angry', rarity: 16.7, imagePath: 'Eyez/Common/Angry.png', zIndex: 4 },
          { name: 'Afraid', rarity: 16.7, imagePath: 'Eyez/Common/Afraid.png', zIndex: 4 },
          { name: 'Complacent', rarity: 16.6, imagePath: 'Eyez/Common/Complacent.png', zIndex: 4 },
          { name: 'Exhausted', rarity: 10, imagePath: 'Eyez/Rare/Exhausted.png', zIndex: 4 },
          { name: 'Red Eye', rarity: 10, imagePath: 'Eyez/Rare/redEye.png', zIndex: 4 },
          { name: 'Terrified', rarity: 10, imagePath: 'Eyez/Rare/Terrified.png', zIndex: 4 },
          { name: 'Hopeful', rarity: 5, imagePath: 'Eyez/Legendary/Hopeful.png', zIndex: 4 },
          { name: 'Bored', rarity: 5, imagePath: 'Eyez/Legendary/Bored.png', zIndex: 4 },
          { name: 'Disgusted', rarity: 5, imagePath: 'Eyez/Legendary/Disgusted.png', zIndex: 4 },
          { name: 'Heaven', rarity: 1.7, imagePath: 'Eyez/Super Rare/Heaven.png', zIndex: 4 },
          { name: 'Evil', rarity: 1.7, imagePath: 'Eyez/Super Rare/Evil.png', zIndex: 4 },
          { name: 'Laser', rarity: 1.6, imagePath: 'Eyez/Super Rare/Laser.png', zIndex: 4 }
        ]
      },
      {
        name: 'Head',
        layers: [
          { name: 'None', rarity: 40, imagePath: null, zIndex: 0 },
          { name: 'Rocket', rarity: 25, imagePath: 'Head/Common/Rocket.png', zIndex: 5 },
          { name: 'Beanie', rarity: 4, imagePath: 'Head/Rare/Beanie.png', zIndex: 5 },
          { name: 'Devil', rarity: 4, imagePath: 'Head/Rare/Devil.png', zIndex: 5 },
          { name: 'Glowing Mushroom', rarity: 4, imagePath: 'Head/Rare/Glowing Mushroom.png', zIndex: 5 },
          { name: 'Frank Bandana', rarity: 3.3, imagePath: 'Head/Legendary/Frank Bandana.png', zIndex: 5 },
          { name: 'Golden Horn', rarity: 3.3, imagePath: 'Head/Legendary/Golden Horn.png', zIndex: 5 },
          { name: 'Cowboy Hat', rarity: 1, imagePath: 'Head/Super Rare/Cowboy Hat.png', zIndex: 5 },
          { name: 'Backwards Cap', rarity: 1, imagePath: 'Head/Super Rare/Backwards Cap.png', zIndex: 5 },
          { name: 'Tattooz', rarity: 1, imagePath: 'Head/Super Rare/Tattooz.png', zIndex: 5 }
        ]
      },
      {
        name: 'Armz',
        layers: [
          { name: 'None', rarity: 30, imagePath: null, zIndex: 0 },
          { name: 'Axe', rarity: 8.75, imagePath: 'Armz/Common/Axe.png', zIndex: 6 },
          { name: 'Bane', rarity: 8.75, imagePath: 'Armz/Common/Bane.png', zIndex: 6 },
          { name: 'Baseball', rarity: 8.75, imagePath: 'Armz/Common/Baseball.png', zIndex: 6 },
          { name: 'Crowbar', rarity: 8.75, imagePath: 'Armz/Common/Crowbar.png', zIndex: 6 },
          { name: 'Montana', rarity: 4, imagePath: 'Armz/rare/Montana.png', zIndex: 6 },
          { name: 'Phoenix Fury', rarity: 4, imagePath: 'Armz/rare/Phoenix Fury.png', zIndex: 6 },
          { name: 'Shotgun', rarity: 4, imagePath: 'Armz/rare/Shotgun.png', zIndex: 6 },
          { name: 'Bearded Axe', rarity: 3.3, imagePath: 'Armz/legendary/Bearded Axe.png', zIndex: 6 },
          { name: 'Jungle Bolo', rarity: 3.3, imagePath: 'Armz/legendary/Jungle Bolo.png', zIndex: 6 },
          { name: 'Katana', rarity: 3.4, imagePath: 'Armz/legendary/Katana.png', zIndex: 6 },
          { name: 'Spear', rarity: 1.7, imagePath: 'Armz/super_rare/Spear.png', zIndex: 6 },
          { name: 'Sunrise', rarity: 1.7, imagePath: 'Armz/super_rare/Sunrise.png', zIndex: 6 },
          { name: 'Thunderseal', rarity: 1.6, imagePath: 'Armz/super_rare/Thunderseal.png', zIndex: 6 }
        ]
      }
    ];

    this.imageCache = new Map();
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
      
      if (selectedTrait.name !== 'None' && selectedTrait.imagePath) {
        selectedLayers.push({
          category: category.name,
          trait: selectedTrait.name,
          imagePath: selectedTrait.imagePath,
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

  async downloadImage(url) {
    return new Promise((resolve, reject) => {
      console.log(`  📥 Downloading: ${url}`);
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

  async loadLayerImage(imagePath) {
    // Check cache first
    if (this.imageCache.has(imagePath)) {
      return this.imageCache.get(imagePath);
    }

    let fullPath;
    let imageBuffer;

    try {
      if (LAYER_CONFIG.useLocalLayers) {
        // Load from local filesystem
        fullPath = path.join(LAYER_CONFIG.localLayersPath, imagePath);
        if (!fs.existsSync(fullPath)) {
          console.log(`  ⚠️  Local layer not found: ${fullPath}`);
          return null;
        }
        imageBuffer = fs.readFileSync(fullPath);
      } else if (LAYER_CONFIG.usePinataLayers) {
        // Load from Pinata/IPFS
        if (LAYER_CONFIG.layerBaseHash === 'YOUR_LAYERS_IPFS_HASH_HERE') {
          console.log('❌ Please configure your LAYER_BASE_HASH in the script');
          console.log('   You need to upload your layers folder to Pinata first');
          return null;
        }
        
        const url = `${LAYER_CONFIG.pinataBaseUrl}${LAYER_CONFIG.layerBaseHash}/${imagePath}`;
        imageBuffer = await this.downloadImage(url);
      } else {
        throw new Error('No layer source configured');
      }

      // Load image with Canvas
      const img = new Image();
      img.src = imageBuffer;
      
      // Cache the loaded image
      this.imageCache.set(imagePath, img);
      
      return img;
    } catch (error) {
      console.log(`  ❌ Failed to load layer ${imagePath}:`, error.message);
      return null;
    }
  }

  async composeGeckoImage(gecko) {
    console.log(`🎨 Compositing ${gecko.name}...`);
    
    // Create canvas
    const canvas = createCanvas(LAYER_CONFIG.canvasWidth, LAYER_CONFIG.canvasHeight);
    const ctx = canvas.getContext('2d');

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Composite each layer in z-index order
    for (const layer of gecko.selectedLayers) {
      console.log(`  🖼️  Adding layer: ${layer.trait} (z-${layer.zIndex})`);
      
      const image = await this.loadLayerImage(layer.imagePath);
      if (image) {
        // Draw the layer onto the canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      } else {
        console.log(`  ⚠️  Skipped missing layer: ${layer.trait}`);
      }
    }

    // Convert canvas to PNG buffer
    return canvas.toBuffer('image/png');
  }

  async generateGeckoPngs(count = 10) {
    console.log(`🦎 Generating ${count} Real Gecko PNGs with Layer Composition`);
    console.log('================================================================================');

    // Create output directory
    const outputDir = path.join(__dirname, '..', 'real-gecko-pngs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`📁 Output Directory: ${outputDir}`);
    console.log(`🎨 Canvas Size: ${LAYER_CONFIG.canvasWidth}x${LAYER_CONFIG.canvasHeight}`);
    console.log(`🌐 Layer Source: ${LAYER_CONFIG.useLocalLayers ? 'Local Files' : 'Pinata/IPFS'}`);
    console.log('');

    let ultraRareCount = 0;
    let totalRarity = 0;
    let successfulGenerations = 0;

    for (let i = 1; i <= count; i++) {
      try {
        const gecko = this.generateRandomGecko(i);
        
        if (gecko.isUltraRare) ultraRareCount++;
        totalRarity += gecko.rarityScore;

        // Generate the actual PNG image
        const pngBuffer = await this.composeGeckoImage(gecko);
        
        // Save PNG file
        const filename = `gecko-${String(i).padStart(3, '0')}-score-${gecko.rarityScore}.png`;
        const filepath = path.join(outputDir, filename);
        
        fs.writeFileSync(filepath, pngBuffer);
        
        const rarityLabel = gecko.isUltraRare ? '⭐ ULTRA RARE' : '';
        console.log(`✅ Generated: ${filename} ${rarityLabel}`);
        console.log(`   Traits: ${Object.entries(gecko.traits).filter(([k,v]) => v !== 'None').map(([k,v]) => `${k}:${v}`).join(' | ')}`);
        
        successfulGenerations++;
        
        if (i % 10 === 0) {
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
    console.log('');
    
    if (successfulGenerations < count) {
      console.log('💡 Some generations failed - likely missing layer assets');
      console.log('   Please check your layer configuration and IPFS hashes');
    }
    
    return outputDir;
  }
}

// Helper function to check configuration
function checkConfiguration() {
  console.log('🔧 Checking Configuration...');
  console.log('================================================================================');
  
  if (LAYER_CONFIG.useLocalLayers) {
    console.log(`📁 Local layers path: ${LAYER_CONFIG.localLayersPath}`);
    if (fs.existsSync(LAYER_CONFIG.localLayersPath)) {
      console.log('✅ Local layers directory exists');
    } else {
      console.log('❌ Local layers directory not found');
      console.log('   Please update LAYER_CONFIG.localLayersPath');
    }
  }
  
  if (LAYER_CONFIG.usePinataLayers) {
    console.log(`🌐 Pinata base URL: ${LAYER_CONFIG.pinataBaseUrl}`);
    console.log(`📦 Layer base hash: ${LAYER_CONFIG.layerBaseHash}`);
    
    if (LAYER_CONFIG.layerBaseHash === 'YOUR_LAYERS_IPFS_HASH_HERE') {
      console.log('❌ Layer base hash not configured');
      console.log('   Please upload your layers to Pinata and update LAYER_CONFIG.layerBaseHash');
      console.log('');
      console.log('📝 To upload layers:');
      console.log('   1. Upload your GreedyGeckoz_Layers folder to Pinata');
      console.log('   2. Get the IPFS hash (starts with Qm...)');
      console.log('   3. Update LAYER_CONFIG.layerBaseHash in this script');
      return false;
    } else {
      console.log('✅ Layer base hash configured');
    }
  }
  
  console.log('');
  return true;
}

// Run the generator
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 10;
  
  if (!checkConfiguration()) {
    console.log('🛑 Configuration incomplete. Please fix the issues above.');
    process.exit(1);
  }
  
  const generator = new RealGeckoGenerator();
  
  generator.generateGeckoPngs(count)
    .then(outputPath => {
      console.log(`🚀 All ${count} geckos generated successfully!`);
      console.log(`📂 Check folder: ${outputPath}`);
    })
    .catch(error => {
      console.error('❌ Generation failed:', error);
    });
}

module.exports = { RealGeckoGenerator };
