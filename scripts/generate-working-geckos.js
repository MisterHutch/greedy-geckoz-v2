// Generate 100 working geckos - creates proper PNGs with placeholders for now
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const CANVAS_SIZE = 512;

// Your actual trait system with proper rarity weights
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

class WorkingGeckoGenerator {
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

  createGeckoImage(gecko) {
    const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw each layer
    for (const layer of gecko.selectedLayers) {
      ctx.fillStyle = layer.color;
      
      switch (layer.category) {
        case 'Background':
          // Full background
          ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
          break;
        case 'Skin':
          // Gecko body
          ctx.fillRect(100, 200, 312, 200); // Body
          ctx.fillRect(150, 100, 212, 120); // Head
          break;
        case 'Outfit':
          // Clothing overlay
          ctx.fillRect(120, 220, 272, 160);
          break;
        case 'Eyes':
          // Eyes
          ctx.fillRect(180, 140, 30, 30);
          ctx.fillRect(302, 140, 30, 30);
          break;
        case 'Head':
          // Hat/head accessory
          ctx.fillRect(140, 80, 232, 60);
          break;
        case 'Arms':
          // Weapons/arms
          ctx.fillRect(50, 240, 40, 120); // Left arm/weapon
          ctx.fillRect(422, 240, 40, 120); // Right arm/weapon
          break;
      }
    }

    // Add trait labels at bottom
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    ctx.fillText(gecko.name, CANVAS_SIZE/2, CANVAS_SIZE - 60);
    ctx.fillText(`Rarity Score: ${gecko.rarityScore} ${gecko.isUltraRare ? '⭐' : ''}`, CANVAS_SIZE/2, CANVAS_SIZE - 40);
    
    const traitText = Object.entries(gecko.traits).filter(([k,v]) => v !== 'None').slice(0, 3).map(([k,v]) => `${k}:${v}`).join(' | ');
    ctx.font = '10px Arial';
    ctx.fillText(traitText, CANVAS_SIZE/2, CANVAS_SIZE - 20);

    return canvas.toBuffer('image/png');
  }

  async generateGeckoPngs(count = 100) {
    console.log(`🦎 Generating ${count} Working Gecko PNGs`);
    console.log('================================================================================');

    const outputDir = path.join(__dirname, '..', 'working-gecko-pngs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`📁 Output Directory: ${outputDir}`);
    console.log(`🎨 Canvas Size: ${CANVAS_SIZE}x${CANVAS_SIZE}`);
    console.log(`🎯 Method: Colored shapes representing each trait layer`);
    console.log('');

    let ultraRareCount = 0;
    let totalRarity = 0;
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

      // Generate the image
      const pngBuffer = this.createGeckoImage(gecko);
      
      // Save PNG file
      const filename = `working-gecko-${String(i).padStart(3, '0')}-score-${gecko.rarityScore}.png`;
      const filepath = path.join(outputDir, filename);
      
      fs.writeFileSync(filepath, pngBuffer);
      
      const rarityLabel = gecko.isUltraRare ? '⭐ ULTRA RARE' : '';
      console.log(`✅ Generated: ${filename} ${rarityLabel}`);
      
      if (i % 20 === 0) {
        console.log(`   Progress: ${i}/${count} (${Math.round(i/count*100)}%)`);
      }
    }

    console.log('');
    console.log('✅ Generation Complete!');
    console.log('================================================================================');
    console.log(`📊 Statistics:`);
    console.log(`   🦎 Total Generated: ${count}`);
    console.log(`   ⭐ Ultra Rare: ${ultraRareCount}/${count} (${Math.round(ultraRareCount/count*100)}%)`);
    console.log(`   📈 Average Rarity: ${Math.round(totalRarity/count)}`);
    console.log(`   📁 Location: ${outputDir}`);
    console.log('');
    
    // Show trait distribution for ultra rares
    console.log('🌟 Ultra Rare Traits Found:');
    const ultraRareTraits = ['Trippy', 'Zombie', 'Laser', 'Evil', 'Thunderseal', 'Space Suit', 'Studded Diamonds', 'Kollidz', 'Biloba Flower', 'Tattooz', 'Heaven', 'War Suit', 'Sunrise', 'Spear'];
    ultraRareTraits.forEach(trait => {
      let foundCount = 0;
      Object.values(traitCounts).forEach(categoryTraits => {
        if (categoryTraits[trait]) foundCount += categoryTraits[trait];
      });
      if (foundCount > 0) {
        console.log(`   ${trait}: ${foundCount} times`);
      }
    });
    
    return outputDir;
  }
}

// Run the generator
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 100;
  
  const generator = new WorkingGeckoGenerator();
  
  generator.generateGeckoPngs(count)
    .then(outputPath => {
      console.log(`\n🚀 All ${count} working geckos generated successfully!`);
      console.log(`📂 Check folder: ${outputPath}`);
      console.log('');
      console.log('💡 These are working prototypes with colored shapes.');
      console.log('   Next step: Replace shapes with your actual layer PNGs from Pinata.');
    })
    .catch(error => {
      console.error('❌ Generation failed:', error);
    });
}

module.exports = { WorkingGeckoGenerator };
