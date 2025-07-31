const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const NFT_STORAGE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQzZDc0YzRlNjJhMTZlNGY5YzBjYWE5NmU4NjViZmFiNGJhNDQ5MjQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcyMjM1MzE3NDQ3OSwibmFtZSI6ImdlY2tveiJ9.G9J2_PIZIAmEU9qRmXiVe3oK7YnVrHrMqwX0X6lEP3w';

const ASSETS_DIR = path.join(__dirname, 'assets', 'images');
const OUTPUT_DIR = path.join(__dirname, 'assets', 'uploaded');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function uploadToNFTStorage(filePath, fileName) {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath), fileName);

        const response = await axios.post('https://api.nft.storage/upload', formData, {
            headers: {
                'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`,
                ...formData.getHeaders()
            }
        });

        return response.data.value.cid;
    } catch (error) {
        console.error(`Upload failed for ${fileName}:`, error.response?.data || error.message);
        throw error;
    }
}

async function uploadAllImages() {
    console.log('🦎 Starting Greedy Geckoz IPFS upload to NFT.Storage...\n');

    // Get all PNG files
    const imageFiles = fs.readdirSync(ASSETS_DIR)
        .filter(file => file.endsWith('.png'))
        .sort((a, b) => {
            // Sort numerically
            const numA = parseInt(a.replace('.png', ''));
            const numB = parseInt(b.replace('.png', ''));
            return numA - numB;
        });

    console.log(`📸 Found ${imageFiles.length} Gecko images`);

    const imageMapping = {};
    const failedUploads = [];

    // Upload images in batches
    const batchSize = 3;
    for (let i = 0; i < imageFiles.length; i += batchSize) {
        const batch = imageFiles.slice(i, i + batchSize);
        
        console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(imageFiles.length/batchSize)}`);
        
        const uploadPromises = batch.map(async (fileName) => {
            const filePath = path.join(ASSETS_DIR, fileName);
            const geckoId = fileName.replace('.png', '');
            
            try {
                console.log(`   📤 Uploading: ${fileName} (${i + batch.indexOf(fileName) + 1}/${imageFiles.length})`);
                
                const cid = await uploadToNFTStorage(filePath, fileName);
                const ipfsUrl = `https://nftstorage.link/ipfs/${cid}`;
                
                imageMapping[geckoId] = ipfsUrl;
                console.log(`   ✅ ${fileName} → ${ipfsUrl}`);
                
                return { success: true, fileName, cid, ipfsUrl };
            } catch (error) {
                console.log(`   ❌ Failed: ${fileName}`);
                failedUploads.push(fileName);
                return { success: false, fileName, error: error.message };
            }
        });

        await Promise.all(uploadPromises);
        
        // Small delay between batches to be respectful
        if (i + batchSize < imageFiles.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Save image mapping
    const imageMappingPath = path.join(OUTPUT_DIR, 'image-mapping.json');
    fs.writeFileSync(imageMappingPath, JSON.stringify(imageMapping, null, 2));
    
    console.log(`\n✅ Upload complete!`);
    console.log(`📊 Successfully uploaded: ${Object.keys(imageMapping).length}/${imageFiles.length} images`);
    console.log(`💾 Image mapping saved to: ${imageMappingPath}`);
    
    if (failedUploads.length > 0) {
        console.log(`⚠️  Failed uploads: ${failedUploads.join(', ')}`);
    }

    return imageMapping;
}

async function generateMetadata(imageMapping) {
    console.log('\n📄 Generating metadata files...');
    
    const metadataMapping = {};
    const metadataFiles = [];

    for (const [geckoId, imageUrl] of Object.entries(imageMapping)) {
        const metadata = {
            name: `Greedy Gecko #${geckoId}`,
            description: `A greedy little gecko ready to lose money on Solana. Part of the exclusive 957 Gecko collection where degens gather to embrace beautiful financial chaos.`,
            image: imageUrl,
            attributes: [
                {
                    trait_type: "Gecko ID",
                    value: geckoId
                },
                {
                    trait_type: "Collection",
                    value: "Greedy Geckoz"
                },
                {
                    trait_type: "Rarity",
                    value: "Degen"
                },
                {
                    trait_type: "Degen Level",
                    value: "Diamond Hands"
                }
            ]
        };

        metadataFiles.push({
            geckoId,
            metadata,
            fileName: `${geckoId}.json`
        });
    }

    // Upload metadata files in batches
    const batchSize = 5;
    for (let i = 0; i < metadataFiles.length; i += batchSize) {
        const batch = metadataFiles.slice(i, i + batchSize);
        
        console.log(`📦 Processing metadata batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(metadataFiles.length/batchSize)}`);
        
        const uploadPromises = batch.map(async ({ geckoId, metadata, fileName }) => {
            try {
                // Create temporary file
                const tempPath = path.join(__dirname, 'temp_metadata.json');
                fs.writeFileSync(tempPath, JSON.stringify(metadata, null, 2));
                
                console.log(`   📤 Uploading metadata: Gecko #${geckoId} (${i + batch.indexOf(batch.find(b => b.geckoId === geckoId)) + 1}/${metadataFiles.length})`);
                
                const cid = await uploadToNFTStorage(tempPath, fileName);
                const metadataUrl = `https://nftstorage.link/ipfs/${cid}`;
                
                metadataMapping[geckoId] = metadataUrl;
                console.log(`   ✅ Gecko #${geckoId} metadata → ${metadataUrl}`);
                
                // Clean up temp file
                fs.unlinkSync(tempPath);
                
                return { success: true, geckoId, metadataUrl };
            } catch (error) {
                console.log(`   ❌ Failed: Gecko #${geckoId} metadata`);
                return { success: false, geckoId, error: error.message };
            }
        });

        await Promise.all(uploadPromises);
        
        // Small delay between batches
        if (i + batchSize < metadataFiles.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Save metadata mapping
    const metadataMappingPath = path.join(OUTPUT_DIR, 'metadata-mapping.json');
    fs.writeFileSync(metadataMappingPath, JSON.stringify(metadataMapping, null, 2));
    
    console.log(`\n✅ Metadata upload complete!`);
    console.log(`📊 Successfully uploaded: ${Object.keys(metadataMapping).length}/${metadataFiles.length} metadata files`);
    console.log(`💾 Metadata mapping saved to: ${metadataMappingPath}`);
    
    return metadataMapping;
}

async function main() {
    try {
        console.log('🚀 Starting complete IPFS upload process...\n');
        
        // Step 1: Upload all images
        const imageMapping = await uploadAllImages();
        
        // Step 2: Generate and upload metadata
        const metadataMapping = await generateMetadata(imageMapping);
        
        console.log('\n🎉 Complete upload finished!');
        console.log(`📸 Images uploaded: ${Object.keys(imageMapping).length}`);
        console.log(`📄 Metadata files uploaded: ${Object.keys(metadataMapping).length}`);
        console.log(`\n🔥 Your 957 Geckos are now live on IPFS!`);
        console.log(`📁 Check the 'assets/uploaded/' directory for the mapping files.`);
        
    } catch (error) {
        console.error('\n❌ Upload process failed:', error);
        process.exit(1);
    }
}

// Run the upload if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = { uploadAllImages, generateMetadata };