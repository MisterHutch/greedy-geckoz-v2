const fs = require('fs');
const path = require('path');

// Load the IPFS mapping files
const imageMappingPath = path.join(__dirname, 'assets', 'uploaded', 'image-mapping-2025.json');
const metadataMappingPath = path.join(__dirname, 'assets', 'uploaded', 'metadata-mapping-2025.json');

function integrateIPFSData() {
    try {
        // Read the mapping files
        const imageMapping = JSON.parse(fs.readFileSync(imageMappingPath, 'utf8'));
        const metadataMapping = JSON.parse(fs.readFileSync(metadataMappingPath, 'utf8'));

        console.log('🦎 Integrating IPFS data into Greedy Geckoz site...\n');
        
        // Create a combined collection data file
        const collectionData = {};
        
        const imageIds = Object.keys(imageMapping);
        const metadataIds = Object.keys(metadataMapping);
        
        console.log(`📸 Found ${imageIds.length} image mappings`);
        console.log(`📄 Found ${metadataIds.length} metadata mappings`);
        
        // Combine the data
        const allIds = [...new Set([...imageIds, ...metadataIds])];
        
        for (const id of allIds) {
            collectionData[id] = {
                id: parseInt(id),
                name: `Greedy Gecko #${id}`,
                image: imageMapping[id] || null,
                metadata: metadataMapping[id] || null,
                available: !!(imageMapping[id] && metadataMapping[id])
            };
        }
        
        // Create output directory
        const outputDir = path.join(__dirname, 'public', 'data');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save the collection data
        const collectionDataPath = path.join(outputDir, 'collection-2025.json');
        fs.writeFileSync(collectionDataPath, JSON.stringify(collectionData, null, 2));
        
        // Create a summary file
        const summary = {
            totalSupply: allIds.length,
            availableGeckos: Object.values(collectionData).filter(g => g.available).length,
            imagesUploaded: imageIds.length,
            metadataUploaded: metadataIds.length,
            lastUpdated: new Date().toISOString(),
            sampleGeckos: Object.values(collectionData).slice(0, 5)
        };
        
        const summaryPath = path.join(outputDir, 'collection-summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        
        console.log(`\n✅ Integration complete!`);
        console.log(`📊 Collection Stats:`);
        console.log(`   Total Geckos: ${summary.totalSupply}`);
        console.log(`   Available for mint: ${summary.availableGeckos}`);
        console.log(`   Images uploaded: ${summary.imagesUploaded}`);
        console.log(`   Metadata uploaded: ${summary.metadataUploaded}`);
        
        console.log(`\n📁 Files created:`);
        console.log(`   ${collectionDataPath}`);
        console.log(`   ${summaryPath}`);
        
        // Show some sample URLs
        console.log(`\n🔗 Sample Gecko URLs:`);
        const sampleIds = [0, 1, 100, 500, 1000].filter(id => collectionData[id]);
        sampleIds.forEach(id => {
            const gecko = collectionData[id];
            console.log(`   Gecko #${id}:`);
            console.log(`     Image: ${gecko.image}`);
            console.log(`     Metadata: ${gecko.metadata}`);
        });
        
        return summary;
        
    } catch (error) {
        console.error('❌ Error integrating IPFS data:', error.message);
        throw error;
    }
}

// Run integration
if (require.main === module) {
    integrateIPFSData();
}

module.exports = { integrateIPFSData };