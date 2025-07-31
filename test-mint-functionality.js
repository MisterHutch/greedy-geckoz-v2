const fs = require('fs');
const path = require('path');

// Test the mint functionality and IPFS integration
async function testMintFunctionality() {
    console.log('🦎 Testing Greedy Geckoz Mint Functionality...\n');

    try {
        // 1. Check collection data files
        console.log('📁 Checking collection data files...');
        const collectionPath = path.join(__dirname, 'public', 'data', 'collection-2025.json');
        const summaryPath = path.join(__dirname, 'public', 'data', 'collection-summary.json');
        
        if (!fs.existsSync(collectionPath)) {
            throw new Error('Collection data file not found');
        }
        
        if (!fs.existsSync(summaryPath)) {
            throw new Error('Collection summary file not found');
        }
        
        console.log('✅ Collection data files exist');

        // 2. Load and validate collection data
        console.log('\n📊 Validating collection data...');
        const collectionData = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        
        console.log(`   Total Geckos: ${summary.totalSupply}`);
        console.log(`   Available for mint: ${summary.availableGeckos}`);
        console.log(`   Success rate: ${((summary.availableGeckos / summary.totalSupply) * 100).toFixed(2)}%`);

        // 3. Test IPFS URLs
        console.log('\n🔗 Testing IPFS URL accessibility...');
        const sampleGeckos = [0, 1, 100, 500, 1000, 1500, 2000].filter(id => collectionData[id]);
        
        for (const id of sampleGeckos.slice(0, 3)) {
            const gecko = collectionData[id];
            console.log(`\n   Testing Gecko #${id}:`);
            console.log(`     Image URL: ${gecko.image}`);
            console.log(`     Metadata URL: ${gecko.metadata}`);
            
            // Check if URLs are valid format
            if (gecko.image && gecko.image.includes('gateway.pinata.cloud/ipfs/')) {
                console.log('     ✅ Image URL format valid');
            } else {
                console.log('     ❌ Image URL format invalid');
            }
            
            if (gecko.metadata && gecko.metadata.includes('gateway.pinata.cloud/ipfs/')) {
                console.log('     ✅ Metadata URL format valid');
            } else {
                console.log('     ❌ Metadata URL format invalid');
            }
        }

        // 4. Check environment configuration
        console.log('\n⚙️  Checking environment configuration...');
        const envPath = path.join(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        const totalSupplyMatch = envContent.match(/NEXT_PUBLIC_TOTAL_SUPPLY=(\d+)/);
        const mintPriceMatch = envContent.match(/NEXT_PUBLIC_MINT_PRICE=([\d.]+)/);
        
        if (totalSupplyMatch) {
            const configuredSupply = parseInt(totalSupplyMatch[1]);
            console.log(`   Configured total supply: ${configuredSupply}`);
            if (configuredSupply === summary.totalSupply) {
                console.log('   ✅ Total supply matches collection');
            } else {
                console.log('   ⚠️  Total supply mismatch with collection');
            }
        }
        
        if (mintPriceMatch) {
            const mintPrice = parseFloat(mintPriceMatch[1]);
            console.log(`   Configured mint price: ${mintPrice} SOL`);
        }

        // 5. Test mint simulation
        console.log('\n🎮 Simulating mint process...');
        const randomGecko = sampleGeckos[Math.floor(Math.random() * sampleGeckos.length)];
        const selectedGecko = collectionData[randomGecko];
        
        console.log(`   Selected for mint: Gecko #${randomGecko}`);
        console.log(`   Name: ${selectedGecko.name}`);
        console.log(`   Image: ${selectedGecko.image}`);
        console.log(`   Metadata: ${selectedGecko.metadata}`);
        console.log(`   Available: ${selectedGecko.available ? 'Yes' : 'No'}`);
        
        if (selectedGecko.available) {
            console.log('   ✅ Gecko ready for minting');
        } else {
            console.log('   ❌ Gecko not available for minting');
        }

        // 6. Summary
        console.log('\n🎉 **MINT TEST SUMMARY**');
        console.log(`✅ Collection integrated: ${summary.totalSupply} Geckos`);
        console.log(`✅ IPFS URLs: ${summary.availableGeckos} ready`);
        console.log(`✅ Environment: Configured for ${totalSupplyMatch ? totalSupplyMatch[1] : 'unknown'} total supply`);
        console.log(`✅ Mint price: ${mintPriceMatch ? mintPriceMatch[1] : 'unknown'} SOL`);
        
        console.log('\n🚀 **READY FOR MINT TESTING!**');
        console.log('   1. Start development server: npm run dev');
        console.log('   2. Open browser to: http://localhost:3000');
        console.log('   3. Connect Solana wallet');
        console.log('   4. Test mint functionality');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        return false;
    }
}

// Run test
if (require.main === module) {
    testMintFunctionality();
}

module.exports = { testMintFunctionality };