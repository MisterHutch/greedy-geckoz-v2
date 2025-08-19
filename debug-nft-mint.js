// Debug script to test NFT minting components
// Run with: node debug-nft-mint.js

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debugging NFT Minting Pipeline...\n');

// Test 1: Check environment variables
console.log('📋 Environment Variables:');
console.log('PINATA_API_KEY:', process.env.PINATA_API_KEY ? '✅ Set' : '❌ Missing');
console.log('PINATA_SECRET_API_KEY:', process.env.PINATA_SECRET_API_KEY ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_RPC_ENDPOINT:', process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'Using default');
console.log('NEXT_PUBLIC_NETWORK:', process.env.NEXT_PUBLIC_NETWORK || 'Using default');

// Test 2: Check if layer files exist
const fs = require('fs');
const path = require('path');

console.log('\n🖼️ Checking layer files:');
const layersPath = path.join(__dirname, 'assets', 'layers');
console.log('Layers directory exists:', fs.existsSync(layersPath) ? '✅' : '❌');

if (fs.existsSync(layersPath)) {
  const categories = ['Background', 'Skin', 'Outfit', 'Eyez', 'Head', 'Armz'];
  categories.forEach(category => {
    const categoryPath = path.join(layersPath, category);
    console.log(`${category}:`, fs.existsSync(categoryPath) ? '✅' : '❌');
  });
}

// Test 3: Simple gecko generation test
console.log('\n🦎 Testing gecko generation:');
try {
  const GeckoGenerator = require('./lib/generative/gecko-generator.ts').default;
  const generator = new GeckoGenerator();
  const testGecko = generator.generateRandomGecko(999);
  
  console.log('✅ Gecko generation works');
  console.log('Generated traits:', testGecko.traits);
  console.log('Rarity score:', testGecko.rarityScore);
  console.log('Ultra rare:', testGecko.isUltraRare);
} catch (error) {
  console.log('❌ Gecko generation failed:', error.message);
}

// Test 4: IPFS connectivity test
console.log('\n📤 Testing IPFS connectivity:');
if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY) {
  console.log('🔄 Attempting IPFS connection test...');
  // Simple connectivity test would go here
  console.log('⚠️ IPFS test requires full implementation');
} else {
  console.log('❌ Cannot test IPFS - missing API keys');
  console.log('💡 Set PINATA_API_KEY and PINATA_SECRET_API_KEY in .env.local');
}

console.log('\n🔍 Debug Complete!');
console.log('\n💡 Common Issues:');
console.log('1. Missing PINATA API keys in .env.local');
console.log('2. Layer files not copied to assets/layers directory');
console.log('3. Wallet not properly connected to testnet');
console.log('4. NFT service failing silently due to missing dependencies');
console.log('\n✅ Next steps: Check console logs during actual mint attempt');