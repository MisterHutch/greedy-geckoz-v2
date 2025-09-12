// Generate Geckos directly from local layer files
// Uses your new layer structure without requiring Pinata upload

const { createCanvas, loadImage, Image } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const LAYERS_SOURCE = process.env.GECKO_LAYERS_PATH || 'C:/Users/Hutch/OneDrive/Pictures/GreedyGeckoz_Layers';
const CANVAS_SIZE = 512;

// Load the new trait system
const newTraitSystem = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'new-trait-system.json'), 'utf8')
);

class LocalGeckoGenerator {
  constructor() {
    this.layerPaths = new Map();
    this.imageCache = new Map();
  }

  // Map trait names to actual file paths
  discoverLocalLayers() {
    console.log('🔍 Discovering Local Layer Files...');
    console.log('================================================================================');

    const rarityFolders = {
      'Common': 50,
      'Rare': 25, 
      'Super Rare': 15,
      'Legendary': 5
    };

    let totalFound = 0;

    for (const category of ['Background', 'Skin', 'Eyez', 'Outfit', 'Head', 'Armz']) {
      const categoryPath = path.join(LAYERS_SOURCE, category);
      
      if (!fs.existsSync(categoryPath)) {
        console.log(`⚠️  ${category} folder not found`);
        continue;
      }

      console.log(`📂 ${category}:`);
      let categoryCount = 0;

      for (const [rarityFolder, weight] of Object.entries(rarityFolders)) {
        const rarityPath = path.join(categoryPath, rarityFolder);
        
        if (!fs.existsSync(rarityPath)) {
          continue;
        }

        const files = fs.readdirSync(rarityPath).filter(f => f.endsWith('.png'));
        
        for (const file of files) {
          const traitName = path.basename(file, '.png');
          const filePath = path.join(rarityPath, file);
          
          // Store path for this trait
          this.layerPaths.set(`${category}/${traitName}`, filePath);
          categoryCount++;
        }
      }

      console.log(`   Found ${categoryCount} files`);
      totalFound += categoryCount;
    }

    console.log(`✅ Total files discovered: ${totalFound}`);
    return totalFound > 0;
  }

  async loadImageFromPath(filePath) {
    if (this.imageCache.has(filePath)) {
      return this.imageCache.get(filePath);
    }

    try {
      if (!fs.existsSync(filePath)) {
        console.log(`   ❌ File not found: ${filePath}`);
        return null;
      }

      const image = await loadImage(filePath);
      this.imageCache.set(filePath, image);
      return image;
    } catch (error) {
      console.log(`   ❌ Error loading ${filePath}: ${error.message}`);
      return null;
    }
  }

  selectWeightedRandomTrait(categoryData) {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const layer of categoryData.layers) {
      cumulativeWeight += layer.rarity;
      if (random <= cumulativeWeight) {
        return layer;
      }
    }

    return categoryData.layers[categoryData.layers.length - 1];
  }

  generateRandomGecko(mintId) {
    const selectedTraits = {};
    const selectedLayers = [];
    let rarityScore = 0;

    for (const category of newTraitSystem) {
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
    const ultraRareTraits = [
      'Trippy', 'Zombie', 'Laser', 'Evil', 'Heaven', 'War Suit', 
      'Studded Diamonds', 'Studded Diamondsv2', 'Biloba Flower', 
      'Jasmin', 'Parchment', 'Salmon', 'Viking Helmet', 'Myth'
    ];
    return Object.values(traits).some(trait => ultraRareTraits.includes(trait));
  }

  async composeGeckoImage(gecko) {
    console.log(`🎨 Compositing ${gecko.name} (Score: ${gecko.rarityScore})...`);
    
    const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let layersComposited = 0;
    
    for (const layer of gecko.selectedLayers) {
      const pathKey = `${layer.category}/${layer.trait}`;
      const filePath = this.layerPaths.get(pathKey);
      
      if (filePath) {
        console.log(`  🖼️  Adding: ${layer.trait} (${layer.category})`);
        
        const image = await this.loadImageFromPath(filePath);
        if (image) {
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          layersComposited++;
        }
      } else {
        console.log(`  ⚠️  No file found for: ${layer.category}/${layer.trait}`);
      }
    }

    console.log(`  📊 Layers composited: ${layersComposited}/${gecko.selectedLayers.length}`);
    
    return canvas.toBuffer('image/png');
  }

  async generateGeckos(count = 20) {
    console.log(`🦎 Generating ${count} Local Geckos`);
    console.log('================================================================================');

    // Discover local files
    const hasFiles = this.discoverLocalLayers();
    if (!hasFiles) {
      throw new Error('No local layer files found');
    }

    // Create output directory
    const outputDir = path.join(__dirname, '..', 'local-gecko-previews');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`\n📁 Output Directory: ${outputDir}\n`);

    let ultraRareCount = 0;
    let totalRarity = 0;
    let successfulGenerations = 0;
    const generatedGeckos = [];

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
        
        // Show traits (excluding None)
        const visibleTraits = Object.entries(gecko.traits)
          .filter(([k, v]) => v !== 'None')
          .map(([k, v]) => `${k}:${v}`)
          .join(' | ');
        console.log(`   Traits: ${visibleTraits}`);
        console.log('');
        
        generatedGeckos.push({
          ...gecko,
          filename,
          filepath
        });
        
        successfulGenerations++;
        
      } catch (error) {
        console.error(`❌ Failed to generate gecko #${i}:`, error.message);
      }
    }

    console.log('✅ Generation Complete!');
    console.log('================================================================================');
    console.log(`📊 Statistics:`);
    console.log(`   🦎 Successfully Generated: ${successfulGenerations}/${count}`);
    console.log(`   ⭐ Ultra Rare: ${ultraRareCount}/${successfulGenerations} (${Math.round(ultraRareCount/successfulGenerations*100)}%)`);
    console.log(`   📈 Average Rarity: ${Math.round(totalRarity/successfulGenerations)}`);
    console.log(`   📁 Location: ${outputDir}`);

    // Save metadata
    const metadataFile = path.join(outputDir, 'generation-metadata.json');
    fs.writeFileSync(metadataFile, JSON.stringify({
      generatedAt: new Date().toISOString(),
      totalGenerated: successfulGenerations,
      ultraRareCount,
      averageRarity: Math.round(totalRarity/successfulGenerations),
      geckos: generatedGeckos.map(g => ({
        id: g.id,
        name: g.name,
        filename: g.filename,
        traits: g.traits,
        rarityScore: g.rarityScore,
        isUltraRare: g.isUltraRare
      }))
    }, null, 2));

    console.log(`💾 Metadata saved: ${metadataFile}`);
    
    return outputDir;
  }
}

// Run generator
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 20;
  
  const generator = new LocalGeckoGenerator();
  
  generator.generateGeckos(count)
    .then(outputPath => {
      console.log(`\n🚀 All ${count} geckos generated successfully!`);
      console.log(`📂 Check folder: ${outputPath}`);
    })
    .catch(error => {
      console.error('❌ Generation failed:', error.message);
    });
}

module.exports = { LocalGeckoGenerator };
