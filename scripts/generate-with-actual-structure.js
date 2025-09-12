// Generate geckos using your ACTUAL layer structure
const { createCanvas, loadImage, Image } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Your actual layer structure discovered from IPFS
const LAYERS_BASE_URL = 'https://gateway.pinata.cloud/ipfs/bafybeibkzxmff7iqk5ltwu6mkbiii37xfcuhk53fpa3gfrbqspemprgnau';
const CANVAS_SIZE = 512;

// Simplified trait system using your actual folder names
const TRAIT_SYSTEM = [
  {
    name: 'Background',
    folder: 'Background',
    zIndex: 1,
    traits: ['Aquamarine', 'Seafoam', 'Chill', 'Driftwood', 'Hopbush', 'Sand', 'Jasmin', 'Parchment', 'Salmon']
  },
  {
    name: 'Facial', // This likely contains both skin + eyes
    folder: 'Facial', 
    zIndex: 2,
    traits: ['Green', 'Corn', 'Rusty', 'Angry', 'Afraid', 'Complacent'] // We'll discover the actual names
  },
  {
    name: 'Clothing',
    folder: 'Clothing',
    zIndex: 3,
    traits: ['None', 'Black_Sweater', 'Green_Polo', 'Tom_Hill', 'Tuxedo', 'Pullover_Hoodie'] // Will discover actual names
  },
  {
    name: 'Hats',
    folder: 'Hats',
    zIndex: 4,
    traits: ['None', 'Rocket', 'Beanie', 'Devil', 'Frank_Bandana', 'Cowboy_Hat'] // Will discover actual names
  },
  {
    name: 'Weapon',
    folder: 'Weapon',
    zIndex: 5,
    traits: ['None', 'Axe', 'Baseball', 'Crowbar', 'Montana', 'Shotgun', 'Katana'] // Will discover actual names
  }
];

class SimpleGeckoGenerator {
  constructor() {
    this.imageCache = new Map();
  }

  async downloadImage(url) {
    return new Promise((resolve, reject) => {
      console.log(`  📥 Downloading: ${url.substring(0, 80)}...`);
      https.get(url, { timeout: 5000 }, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
      }).on('error', reject).on('timeout', () => {
        reject(new Error('Timeout'));
      });
    });
  }

  async loadImage(imagePath) {
    if (this.imageCache.has(imagePath)) {
      return this.imageCache.get(imagePath);
    }

    try {
      const url = `${LAYERS_BASE_URL}/${imagePath}`;
      const imageBuffer = await this.downloadImage(url);
      
      const img = new Image();
      img.src = imageBuffer;
      
      this.imageCache.set(imagePath, img);
      return img;
    } catch (error) {
      console.log(`    ❌ Failed to load ${imagePath}: ${error.message}`);
      return null;
    }
  }

  getRandomTrait(category) {
    const traits = category.traits;
    const randomTrait = traits[Math.floor(Math.random() * traits.length)];
    return randomTrait;
  }

  async generateTestGecko(id) {
    console.log(`🎨 Generating Test Gecko #${id}...`);
    
    const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    const selectedTraits = {};
    let layersComposited = 0;

    // Generate traits and composite layers
    for (const category of TRAIT_SYSTEM) {
      const selectedTrait = this.getRandomTrait(category);
      selectedTraits[category.name] = selectedTrait;
      
      if (selectedTrait === 'None') {
        console.log(`  ⭕ Skipping ${category.name}: None selected`);
        continue;
      }
      
      console.log(`  🖼️  Adding ${category.name}: ${selectedTrait}`);
      
      // Try different file extensions and naming conventions
      const possiblePaths = [
        `${category.folder}/${selectedTrait}.png`,
        `${category.folder}/${selectedTrait.replace('_', ' ')}.png`,
        `${category.folder}/${selectedTrait.toLowerCase()}.png`,
        `${category.folder}/${selectedTrait.replace('_', '')}.png`
      ];
      
      let imageLoaded = false;
      for (const imagePath of possiblePaths) {
        const image = await this.loadImage(imagePath);
        if (image) {
          ctx.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
          console.log(`    ✅ Composited: ${imagePath}`);
          layersComposited++;
          imageLoaded = true;
          break;
        }
      }
      
      if (!imageLoaded) {
        console.log(`    ⚠️  No image found for ${selectedTrait} in any naming variation`);
      }
    }

    console.log(`  📊 Composited ${layersComposited} layers`);
    
    // Save the gecko
    const outputDir = path.join(__dirname, '..', 'test-geckos-actual');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `test-gecko-${String(id).padStart(3, '0')}.png`;
    const filepath = path.join(outputDir, filename);
    
    const pngBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, pngBuffer);
    
    console.log(`✅ Generated: ${filename}`);
    console.log(`   Traits: ${Object.entries(selectedTraits).map(([k,v]) => `${k}:${v}`).join(' | ')}`);
    console.log('');
    
    return {
      id,
      filename,
      traits: selectedTraits,
      layersComposited
    };
  }

  async generateTestBatch(count = 3) {
    console.log(`🦎 Generating ${count} Test Geckos with Your Actual Layer Structure`);
    console.log('================================================================================');
    console.log(`📁 Layer Base: ${LAYERS_BASE_URL}`);
    console.log(`🎨 Canvas Size: ${CANVAS_SIZE}x${CANVAS_SIZE}`);
    console.log(`📂 Structure: Background, Facial, Clothing, Hats, Weapon`);
    console.log('');

    const results = [];
    
    for (let i = 1; i <= count; i++) {
      try {
        const result = await this.generateTestGecko(i);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to generate gecko #${i}:`, error.message);
      }
    }

    console.log('✅ Test Generation Complete!');
    console.log('================================================================================');
    console.log(`📊 Successfully generated: ${results.length}/${count}`);
    console.log(`📁 Output folder: test-geckos-actual/`);
    
    const avgLayers = results.reduce((sum, r) => sum + r.layersComposited, 0) / results.length;
    console.log(`🎨 Average layers per gecko: ${avgLayers.toFixed(1)}`);
    
    return results;
  }
}

// Run the test
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 3;
  
  const generator = new SimpleGeckoGenerator();
  generator.generateTestBatch(count)
    .then(() => {
      console.log('\n🎯 Next Steps:');
      console.log('1. Check the generated images in test-geckos-actual/');
      console.log('2. See which layers are loading successfully');
      console.log('3. Update the trait names based on what we find');
      console.log('4. Generate the full collection of 100!');
    })
    .catch(error => {
      console.error('❌ Generation failed:', error);
    });
}

module.exports = { SimpleGeckoGenerator };
