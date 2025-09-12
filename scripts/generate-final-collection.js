// Final Gecko Collection Generator - Hybrid approach with fallbacks
const { createCanvas, loadImage, Image } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
const https = require('https');

const LAYER_CID = 'bafybeibkzxmff7iqk5ltwu6mkbiii37xfcuhk53fpa3gfrbqspemprgnau';
const CANVAS_SIZE = 512;

// Your actual trait system with proper rarity weights and fallback colors
const TRAIT_SYSTEM = [
  {
    name: 'Background',
    zIndex: 1,
    layers: [
      { name: 'Aquamarine', rarity: 25, color: '#7FFFD4' },
      { name: 'Seafoam', rarity: 25, color: '#20B2AA' },
      { name: 'Chill', rarity: 7.5, color: '#B0E0E6' },
      { name: 'Driftwood', rarity: 7.5, color: '#8B7355' },
      { name: 'Hopbush', rarity: 7.5, color: '#CD5C5C' },
      { name: 'Sand', rarity: 7.5, color: '#F4A460' },
      { name: 'Jasmin', rarity: 5, color: '#F8DE7E' },
      { name: 'Parchment', rarity: 5, color: '#F1E9D2' },
      { name: 'Salmon', rarity: 5, color: '#FA8072' },
      { name: 'Biloba Flower', rarity: 0.7, color: '#FFB347' },
      { name: 'Studded Diamonds', rarity: 0.7, color: '#B9F2FF' },
      { name: 'Kollidz', rarity: 0.7, color: '#FF6347' }
    ]
  },
  {
    name: 'Skin',
    zIndex: 2,
    layers: [
      { name: 'Green', rarity: 45, color: '#32CD32' },
      { name: 'Corn', rarity: 15, color: '#FFDB58' },
      { name: 'Rusty', rarity: 15, color: '#CD853F' },
      { name: 'Ember', rarity: 10, color: '#FF4500' },
      { name: 'Rose', rarity: 7.5, color: '#FF69B4' },
      { name: 'Pale Cerulean', rarity: 5, color: '#87CEEB' },
      { name: 'Trippy', rarity: 2.5, color: '#FF00FF' },
      { name: 'Zombie', rarity: 2.5, color: '#9ACD32' }
    ]
  },
  {
    name: 'Outfit',
    zIndex: 3,
    layers: [
      { name: 'None', rarity: 25, color: null },
      { name: 'Black Sweater', rarity: 35, color: '#2F2F2F' },
      { name: 'Green Polo', rarity: 6.25, color: '#228B22' },
      { name: 'Tom Hill', rarity: 6.25, color: '#8B4513' },
      { name: 'Sleeveless', rarity: 6.25, color: '#A0A0A0' },
      { name: 'Tuxedo', rarity: 6.25, color: '#000000' },
      { name: 'Pullover Hoodie', rarity: 5, color: '#4169E1' },
      { name: 'War Suit', rarity: 1.7, color: '#556B2F' },
      { name: 'Space Suit', rarity: 1.6, color: '#C0C0C0' }
    ]
  },
  {
    name: 'Eyes',
    zIndex: 4,
    layers: [
      { name: 'Angry', rarity: 16.7, color: '#FF0000' },
      { name: 'Afraid', rarity: 16.7, color: '#000080' },
      { name: 'Complacent', rarity: 16.6, color: '#008080' },
      { name: 'Exhausted', rarity: 10, color: '#696969' },
      { name: 'Red Eye', rarity: 10, color: '#DC143C' },
      { name: 'Terrified', rarity: 10, color: '#4B0082' },
      { name: 'Hopeful', rarity: 5, color: '#FFD700' },
      { name: 'Bored', rarity: 5, color: '#808080' },
      { name: 'Disgusted', rarity: 5, color: '#228B22' },
      { name: 'Heaven', rarity: 1.7, color: '#87CEFA' },
      { name: 'Evil', rarity: 1.7, color: '#8B0000' },
      { name: 'Laser', rarity: 1.6, color: '#FF1493' }
    ]
  },
  {
    name: 'Head',
    zIndex: 5,
    layers: [
      { name: 'None', rarity: 40, color: null },
      { name: 'Rocket', rarity: 25, color: '#A52A2A' },
      { name: 'Beanie', rarity: 4, color: '#800080' },
      { name: 'Devil', rarity: 4, color: '#8B0000' },
      { name: 'Glowing Mushroom', rarity: 4, color: '#00FF00' },
      { name: 'Frank Bandana', rarity: 3.3, color: '#FF4500' },
      { name: 'Golden Horn', rarity: 3.3, color: '#FFD700' },
      { name: 'Cowboy Hat', rarity: 1, color: '#8B4513' },
      { name: 'Backwards Cap', rarity: 1, color: '#000080' },
      { name: 'Tattooz', rarity: 1, color: '#000000' }
    ]
  },
  {
    name: 'Arms',
    zIndex: 6,
    layers: [
      { name: 'None', rarity: 30, color: null },
      { name: 'Axe', rarity: 8.75, color: '#8B4513' },
      { name: 'Bane', rarity: 8.75, color: '#2F4F4F' },
      { name: 'Baseball', rarity: 8.75, color: '#CD853F' },
      { name: 'Crowbar', rarity: 8.75, color: '#708090' },
      { name: 'Montana', rarity: 4, color: '#FFD700' },
      { name: 'Phoenix Fury', rarity: 4, color: '#FF6347' },
      { name: 'Shotgun', rarity: 4, color: '#2F2F2F' },
      { name: 'Bearded Axe', rarity: 3.3, color: '#8B4513' },
      { name: 'Jungle Bolo', rarity: 3.3, color: '#228B22' },
      { name: 'Katana', rarity: 3.4, color: '#C0C0C0' },
      { name: 'Spear', rarity: 1.7, color: '#8B4513' },
      { name: 'Sunrise', rarity: 1.7, color: '#FFA500' },
      { name: 'Thunderseal', rarity: 1.6, color: '#4169E1' }
    ]
  }
];

class FinalGeckoGenerator {
  constructor() {
    this.imageCache = new Map();
    this.useRealImages = true;
    this.layerAttempts = 0;
    this.layerSuccesses = 0;
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

    for (const category of TRAIT_SYSTEM) {
      const selectedTrait = this.selectWeightedRandomTrait(category);
      selectedTraits[category.name] = selectedTrait.name;
      
      if (selectedTrait.name !== 'None' && selectedTrait.color) {
        selectedLayers.push({
          category: category.name,
          trait: selectedTrait.name,
          color: selectedTrait.color,
          zIndex: category.zIndex,
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

  async tryLoadRealImage(layer) {
    if (!this.useRealImages) return null;

    this.layerAttempts++;
    
    // Try different file naming patterns and folder mappings
    const folderMappings = {
      'Background': 'Background',
      'Skin': 'Facial',
      'Outfit': 'Clothing', 
      'Eyes': 'Facial',
      'Head': 'Hats',
      'Arms': 'Weapon'
    };

    const folder = folderMappings[layer.category] || layer.category;
    const variations = [
      layer.trait,
      layer.trait.toLowerCase(),
      layer.trait.replace(' ', '_'),
      layer.trait.replace(' ', ''),
      layer.trait.replace(' ', '-')
    ];

    for (const variation of variations) {
      try {
        const url = `https://ipfs.io/ipfs/${LAYER_CID}/${folder}/${variation}.png`;
        
        const imageBuffer = await new Promise((resolve, reject) => {
          const req = https.get(url, { timeout: 3000 }, (response) => {
            if (response.statusCode !== 200) {
              reject(new Error(`HTTP ${response.statusCode}`));
              return;
            }

            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
          });

          req.on('error', reject);
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
          });
        });

        const img = new Image();
        img.src = imageBuffer;
        
        this.layerSuccesses++;
        console.log(`    ✅ Loaded real image: ${folder}/${variation}.png`);
        return img;
      } catch (error) {
        // Continue to next variation
      }
    }

    return null;
  }

  async createGeckoImage(gecko) {
    const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    let realImagesUsed = 0;
    let fallbacksUsed = 0;

    // Draw each layer
    for (const layer of gecko.selectedLayers) {
      console.log(`  🖼️  Processing layer: ${layer.trait}`);
      
      // Try to load real image first
      const realImage = await this.tryLoadRealImage(layer);
      
      if (realImage) {
        ctx.drawImage(realImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        realImagesUsed++;
      } else {
        // Fallback to colored shapes
        console.log(`    🎨 Using fallback color for: ${layer.trait}`);
        ctx.fillStyle = layer.color;
        
        switch (layer.category) {
          case 'Background':
            ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            break;
          case 'Skin':
            ctx.fillRect(100, 200, 312, 200); // Body
            ctx.fillRect(150, 100, 212, 120); // Head
            break;
          case 'Outfit':
            ctx.fillRect(120, 220, 272, 160);
            break;
          case 'Eyes':
            ctx.fillRect(180, 140, 30, 30);
            ctx.fillRect(302, 140, 30, 30);
            break;
          case 'Head':
            ctx.fillRect(140, 80, 232, 60);
            break;
          case 'Arms':
            ctx.fillRect(50, 240, 40, 120);
            ctx.fillRect(422, 240, 40, 120);
            break;
        }
        fallbacksUsed++;
      }
    }

    // Add text overlay
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    ctx.fillText(gecko.name, CANVAS_SIZE/2, CANVAS_SIZE - 60);
    ctx.fillText(`Rarity Score: ${gecko.rarityScore} ${gecko.isUltraRare ? '⭐' : ''}`, CANVAS_SIZE/2, CANVAS_SIZE - 40);
    
    const compositionInfo = `${realImagesUsed} real images, ${fallbacksUsed} fallbacks`;
    ctx.font = '10px Arial';
    ctx.fillText(compositionInfo, CANVAS_SIZE/2, CANVAS_SIZE - 20);

    return {
      pngBuffer: canvas.toBuffer('image/png'),
      realImagesUsed,
      fallbacksUsed
    };
  }

  async generateFinalCollection(count = 100) {
    console.log(`🦎 Generating Final Collection: ${count} Greedy Geckos`);
    console.log('================================================================================');

    const outputDir = path.join(__dirname, '..', 'final-gecko-collection');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`📁 Output Directory: ${outputDir}`);
    console.log(`🎨 Canvas Size: ${CANVAS_SIZE}x${CANVAS_SIZE}`);
    console.log(`🌐 Layer Source: IPFS with colored fallbacks`);
    console.log(`📦 Layer CID: ${LAYER_CID}`);
    console.log('');

    let ultraRareCount = 0;
    let totalRarity = 0;
    let totalRealImages = 0;
    let totalFallbacks = 0;
    const traitCounts = {};

    for (let i = 1; i <= count; i++) {
      const gecko = this.generateRandomGecko(i);
      
      if (gecko.isUltraRare) ultraRareCount++;
      totalRarity += gecko.rarityScore;

      // Count traits for statistics
      Object.entries(gecko.traits).forEach(([category, trait]) => {
        if (!traitCounts[category]) traitCounts[category] = {};
        if (!traitCounts[category][trait]) traitCounts[category][trait] = 0;
        traitCounts[category][trait]++;
      });

      console.log(`🎨 Generating ${gecko.name}...`);
      
      // Generate the image
      const { pngBuffer, realImagesUsed, fallbacksUsed } = await this.createGeckoImage(gecko);
      
      totalRealImages += realImagesUsed;
      totalFallbacks += fallbacksUsed;
      
      // Save PNG file
      const filename = `greedy-gecko-${String(i).padStart(3, '0')}-score-${gecko.rarityScore}.png`;
      const filepath = path.join(outputDir, filename);
      
      fs.writeFileSync(filepath, pngBuffer);
      
      const rarityLabel = gecko.isUltraRare ? '⭐ ULTRA RARE' : '';
      console.log(`✅ Generated: ${filename} ${rarityLabel}`);
      console.log(`   Images: ${realImagesUsed} real, ${fallbacksUsed} fallback`);
      
      if (i % 20 === 0) {
        console.log(`   Progress: ${i}/${count} (${Math.round(i/count*100)}%)`);
        console.log('');
      }
    }

    console.log('');
    console.log('✅ Final Collection Complete!');
    console.log('================================================================================');
    console.log(`📊 Collection Statistics:`);
    console.log(`   🦎 Total Generated: ${count}`);
    console.log(`   ⭐ Ultra Rare: ${ultraRareCount}/${count} (${Math.round(ultraRareCount/count*100)}%)`);
    console.log(`   📈 Average Rarity: ${Math.round(totalRarity/count)}`);
    console.log(`   🖼️  Real Images Used: ${totalRealImages}`);
    console.log(`   🎨 Fallback Shapes Used: ${totalFallbacks}`);
    console.log(`   📁 Location: ${outputDir}`);
    
    if (this.layerAttempts > 0) {
      const successRate = Math.round((this.layerSuccesses / this.layerAttempts) * 100);
      console.log(`   📡 IPFS Success Rate: ${this.layerSuccesses}/${this.layerAttempts} (${successRate}%)`);
    }
    
    // Show ultra rare distribution
    console.log('');
    console.log('🌟 Ultra Rare Traits Distribution:');
    const ultraRareTraits = ['Trippy', 'Zombie', 'Laser', 'Evil', 'Thunderseal', 'Space Suit', 'Studded Diamonds', 'Kollidz', 'Biloba Flower', 'Tattooz', 'Heaven', 'War Suit', 'Sunrise', 'Spear'];
    ultraRareTraits.forEach(trait => {
      let foundCount = 0;
      Object.values(traitCounts).forEach(categoryTraits => {
        if (categoryTraits[trait]) foundCount += categoryTraits[trait];
      });
      if (foundCount > 0) {
        console.log(`   ${trait}: ${foundCount} occurrences`);
      }
    });
    
    return outputDir;
  }
}

// Run the generator
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 100;
  
  const generator = new FinalGeckoGenerator();
  
  generator.generateFinalCollection(count)
    .then(outputPath => {
      console.log(`\\n🚀 Final collection of ${count} geckos generated!`);
      console.log(`📂 Collection folder: ${outputPath}`);
      console.log('');
      console.log('🎉 Your Greedy Geckoz collection is ready!');
      console.log('💡 Each gecko uses real layer images when available,');
      console.log('   with colored shape fallbacks for missing assets.');
    })
    .catch(error => {
      console.error('❌ Generation failed:', error.message);
    });
}

module.exports = { FinalGeckoGenerator };
