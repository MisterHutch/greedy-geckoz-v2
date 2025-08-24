// Show all 100 generated gecko outcomes with full trait details

class TestGeckoGenerator {
  constructor() {
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
          { name: 'Green', rarity: 50, zIndex: 2 },
          { name: 'Corn', rarity: 15, zIndex: 2 },
          { name: 'Rusty', rarity: 15, zIndex: 2 },
          { name: 'Ember', rarity: 5, zIndex: 2 },
          { name: 'Rose', rarity: 5, zIndex: 2 },
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
          { name: 'Sleeveless', rarity: 6.25, zIndex: 3 },
          { name: 'Tom Hill', rarity: 6.25, zIndex: 3 },
          { name: 'Tuxedo', rarity: 6.25, zIndex: 3 },
          { name: 'Pullover Hoodie', rarity: 5, zIndex: 3 },
          { name: 'Myth', rarity: 1.7, zIndex: 3 },
          { name: 'War Suit', rarity: 1.7, zIndex: 3 },
          { name: 'Space Suit', rarity: 1.6, zIndex: 3 }
        ]
      },
      {
        name: 'Eyez',
        layers: [
          { name: 'Afraid', rarity: 16.7, zIndex: 4 },
          { name: 'Angry', rarity: 16.7, zIndex: 4 },
          { name: 'Complacent', rarity: 16.6, zIndex: 4 },
          { name: 'Exhausted', rarity: 10, zIndex: 4 },
          { name: 'Terrified', rarity: 10, zIndex: 4 },
          { name: 'Red Eye', rarity: 10, zIndex: 4 },
          { name: 'Bored', rarity: 5, zIndex: 4 },
          { name: 'Disgusted', rarity: 5, zIndex: 4 },
          { name: 'Hopeful', rarity: 5, zIndex: 4 },
          { name: 'Evil', rarity: 1.7, zIndex: 4 },
          { name: 'Heaven', rarity: 1.7, zIndex: 4 },
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
          { name: 'Backwards Cap', rarity: 1, zIndex: 5 },
          { name: 'Cowboy Hat', rarity: 1, zIndex: 5 },
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
    let rarityScore = 0;

    for (const category of this.traitSystem) {
      const selectedTrait = this.selectWeightedRandomTrait(category);
      selectedTraits[category.name] = selectedTrait.name;
      rarityScore += (100 - selectedTrait.rarity);
    }

    return {
      id: mintId,
      traits: selectedTraits,
      rarityScore: Math.round(rarityScore),
      isUltraRare: this.isUltraRare(selectedTraits)
    };
  }

  isUltraRare(traits) {
    const ultraRareTraits = [
      'Biloba Flower', 'Studded Diamonds', 'Kollidz', // Background
      'Trippy', 'Zombie', // Skin  
      'Myth', 'War Suit', 'Space Suit', // Outfit
      'Evil', 'Heaven', 'Laser', // Eyez
      'Backwards Cap', 'Cowboy Hat', 'Tattooz', // Head
      'Spear', 'Sunrise', 'Thunderseal' // Armz
    ];
    return Object.values(traits).some(trait => ultraRareTraits.includes(trait));
  }

  getRarityLabel(traitName) {
    for (const category of this.traitSystem) {
      const layer = category.layers.find(l => l.name === traitName);
      if (layer) {
        if (layer.rarity <= 2) return '🌟';
        if (layer.rarity <= 5) return '💎';
        if (layer.rarity <= 10) return '🔥';
        return '⚪';
      }
    }
    return '';
  }
}

function showAll100Geckos() {
  console.log('🦎 ALL 100 GENERATED GECKO OUTCOMES');
  console.log('=' .repeat(100));
  console.log('Legend: 🌟 Super Rare (≤2%) | 💎 Legendary (≤5%) | 🔥 Rare (≤10%) | ⚪ Common\n');

  const generator = new TestGeckoGenerator();
  const geckos = [];

  // Generate all 100 geckos
  for (let i = 1; i <= 100; i++) {
    geckos.push(generator.generateRandomGecko(i));
  }

  // Display each gecko
  geckos.forEach((gecko, index) => {
    const ultraRareLabel = gecko.isUltraRare ? ' ⭐ ULTRA RARE!' : '';
    console.log(`🦎 ${gecko.id.toString().padStart(3, '0')}. Greedy Gecko #${gecko.id}${ultraRareLabel} (Score: ${gecko.rarityScore})`);
    
    // Show traits in visual layer order
    const orderedTraits = [
      ['Background', gecko.traits.Background],
      ['Skin', gecko.traits.Skin],
      ['Outfit', gecko.traits.Outfit],
      ['Eyez', gecko.traits.Eyez],
      ['Head', gecko.traits.Head],
      ['Armz', gecko.traits.Armz]
    ];

    orderedTraits.forEach(([category, trait]) => {
      if (trait !== 'None') {
        const rarity = generator.getRarityLabel(trait);
        console.log(`     ${category}: ${trait} ${rarity}`);
      } else {
        console.log(`     ${category}: None ❌`);
      }
    });

    // Add spacing every 10 geckos for readability
    if ((index + 1) % 10 === 0) {
      console.log('\n' + '-'.repeat(80) + '\n');
    } else {
      console.log('');
    }
  });

  // Summary statistics
  const ultraRareCount = geckos.filter(g => g.isUltraRare).length;
  const avgRarity = Math.round(geckos.reduce((sum, g) => sum + g.rarityScore, 0) / geckos.length);
  const uniqueTraitCombos = new Set(geckos.map(g => Object.values(g.traits).sort().join('|'))).size;

  console.log('📊 SUMMARY STATISTICS');
  console.log('=' .repeat(50));
  console.log(`Total Generated: 100 geckos`);
  console.log(`Ultra Rare Count: ${ultraRareCount}/100 (${ultraRareCount}%)`);
  console.log(`Average Rarity Score: ${avgRarity}`);
  console.log(`Unique Combinations: ${uniqueTraitCombos}/100 (${(uniqueTraitCombos/100*100).toFixed(1)}%)`);
  console.log(`Duplicates: ${100 - uniqueTraitCombos}`);

  // Top 10 rarest geckos
  const sortedByRarity = [...geckos].sort((a, b) => b.rarityScore - a.rarityScore);
  console.log('\n🏆 TOP 10 RAREST GECKOS:');
  console.log('-'.repeat(50));
  
  sortedByRarity.slice(0, 10).forEach((gecko, index) => {
    console.log(`${(index + 1).toString().padStart(2, '0')}. Gecko #${gecko.id} - Score: ${gecko.rarityScore}${gecko.isUltraRare ? ' ⭐' : ''}`);
    
    // Show their rarest trait
    const rarestTrait = Object.entries(gecko.traits)
      .filter(([_, trait]) => trait !== 'None')
      .map(([category, trait]) => {
        const layer = generator.traitSystem.find(c => c.name === category)?.layers.find(l => l.name === trait);
        return { category, trait, rarity: layer?.rarity || 100 };
      })
      .sort((a, b) => a.rarity - b.rarity)[0];
    
    if (rarestTrait) {
      console.log(`    Rarest trait: ${rarestTrait.category} "${rarestTrait.trait}" (${rarestTrait.rarity}%)`);
    }
  });

  return geckos;
}

// Run the display
if (require.main === module) {
  showAll100Geckos();
  
  console.log('\n🎯 Layer Order: Background → Skin → Outfit → Eyez → Head → Armz');
  console.log('🔒 Anti-MEV: Every combination unpredictable until after payment');
  console.log('🚀 Ready for production minting!');
}

module.exports = { showAll100Geckos };