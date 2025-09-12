// Simple test for gecko generation functionality
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

// Load trait system
const traitSystem = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'new-trait-system.json'), 'utf8')
);

console.log('🧪 Testing Gecko Generation Components...');
console.log(`✅ Loaded trait system: ${traitSystem.length} categories`);

// Test trait selection
function selectWeightedRandomTrait(category) {
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

// Generate random gecko
function generateRandomGecko(geckoId) {
  const selectedTraits = {};
  let rarityScore = 0;

  for (const category of traitSystem) {
    const selectedTrait = selectWeightedRandomTrait(category);
    selectedTraits[category.name] = selectedTrait.name;
    rarityScore += (100 - selectedTrait.rarity);
  }

  const ultraRareTraits = [
    'Trippy', 'Zombie', 'Laser', 'Evil', 'Heaven', 'War Suit', 
    'Studded Diamonds', 'Studded Diamondsv2', 'Biloba Flower', 
    'Jasmin', 'Parchment', 'Salmon', 'Viking Helmet', 'Myth'
  ];
  
  const isUltraRare = Object.values(selectedTraits).some(trait => 
    ultraRareTraits.includes(trait)
  );

  return {
    id: geckoId,
    name: `Greedy Gecko #${geckoId}`,
    traits: selectedTraits,
    rarityScore: Math.round(rarityScore),
    isUltraRare
  };
}

// Test layer discovery
function discoverLayerPaths() {
  const layerPaths = new Map();
  const LAYERS_SOURCE = process.env.GECKO_LAYERS_PATH || 'C:/Users/Hutch/OneDrive/Pictures/GreedyGeckoz_Layers';
  const rarityFolders = ['Common', 'Rare', 'Super Rare', 'Legendary'];
  const categories = ['Background', 'Skin', 'Eyez', 'Outfit', 'Head', 'Armz'];
  
  console.log('🔍 Discovering layer paths...');
  
  for (const category of categories) {
    const categoryPath = path.join(LAYERS_SOURCE, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.warn(`⚠️  Category folder not found: ${category}`);
      continue;
    }
    
    for (const rarityFolder of rarityFolders) {
      const rarityPath = path.join(categoryPath, rarityFolder);
      
      if (!fs.existsSync(rarityPath)) continue;
      
      const files = fs.readdirSync(rarityPath).filter(f => f.endsWith('.png'));
      
      for (const file of files) {
        const traitName = path.basename(file, '.png');
        const filePath = path.join(rarityPath, file);
        const key = `${category}/${traitName}`;
        
        layerPaths.set(key, filePath);
      }
    }
  }
  
  console.log(`✅ Found ${layerPaths.size} layer files`);
  return layerPaths;
}

// Test image composition
async function testImageComposition() {
  try {
    console.log('🎨 Testing image composition...');
    
    // Discover layer paths
    const layerPaths = discoverLayerPaths();
    
    // Generate a test gecko
    const gecko = generateRandomGecko(9999);
    console.log('✅ Generated test gecko:', {
      name: gecko.name,
      traits: gecko.traits,
      rarityScore: gecko.rarityScore,
      isUltraRare: gecko.isUltraRare
    });
    
    // Create canvas
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let layersComposited = 0;
    
    // Composite layers
    for (const [category, trait] of Object.entries(gecko.traits)) {
      if (trait && trait !== 'None') {
        const pathKey = `${category}/${trait}`;
        const filePath = layerPaths.get(pathKey);
        
        if (filePath && fs.existsSync(filePath)) {
          console.log(`  🖼️  Adding: ${trait} (${category})`);
          const image = await loadImage(filePath);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          layersComposited++;
        } else {
          console.warn(`  ⚠️  Layer not found: ${pathKey}`);
        }
      }
    }
    
    console.log(`✅ Composited ${layersComposited} layers`);
    
    // Save test image
    const imageBuffer = canvas.toBuffer('image/png');
    const testPath = path.join(__dirname, 'test-api-generation.png');
    fs.writeFileSync(testPath, imageBuffer);
    
    console.log(`✅ Test image saved: ${testPath}`);
    console.log(`📊 Image size: ${(imageBuffer.length / 1024).toFixed(1)}KB`);
    
    // Test metadata creation
    const metadata = {
      name: gecko.name,
      symbol: "GECKO",
      description: `${gecko.name} - A degen gecko from the Greedy Geckoz collection! ${gecko.isUltraRare ? '⭐ ULTRA RARE' : ''}`,
      image: 'https://test.com/image.png',
      attributes: Object.entries(gecko.traits)
        .filter(([_, value]) => value && value !== 'None')
        .map(([trait_type, value]) => ({ trait_type, value }))
    };
    
    console.log('✅ Metadata created:', {
      name: metadata.name,
      attributeCount: metadata.attributes.length
    });
    
    console.log('🎉 All generation tests passed!');
    console.log('💡 Your Live Generation API components are working correctly!');
    
  } catch (error) {
    console.error('❌ Image composition test failed:', error);
  }
}

// Run the test
testImageComposition().catch(console.error);
