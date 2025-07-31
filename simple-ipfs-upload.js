const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const ASSETS_DIR = path.join(__dirname, 'assets', 'images');
const OUTPUT_DIR = path.join(__dirname, 'assets', 'uploaded');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Web3.Storage API (Free alternative to Pinata)
const WEB3_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDg3NDFlNzBENzFkQzY0OTU5RkI5QzEzODBGQ0U0QkI3YUFEMkUzNmQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE3MjIzNTM2NzE0NjAsIm5hbWUiOiJnZWNrb3oifQ.CJbTxFB6RFzBm4V6Qx-wJ8uE_9ry7oAiKdXh5xzWm0s';

async function uploadFile(filePath, fileName) {
    try {
        console.log(`   📤 Uploading: ${fileName}`);
        
        const curlCmd = `curl -X POST "https://api.web3.storage/upload" ` +
                       `-H "Authorization: Bearer ${WEB3_STORAGE_TOKEN}" ` +  
                       `-H "Content-Type: application/octet-stream" ` +
                       `--data-binary "@${filePath}"`;

        const { stdout, stderr } = await execAsync(curlCmd, { 
            maxBuffer: 1024 * 1024 * 10, // 10MB buffer
            encoding: 'utf8'
        });

        if (stderr && !stderr.includes('100')) {
            console.log(`   ⚠️  Stderr for ${fileName}:`, stderr);
        }

        try {
            const response = JSON.parse(stdout);
            if (response.cid) {
                const ipfsUrl = `https://${response.cid}.ipfs.w3s.link`;
                console.log(`   ✅ ${fileName} → ${ipfsUrl}`);
                return ipfsUrl;
            } else {
                throw new Error(`No CID in response: ${stdout}`);
            }
        } catch (parseError) {
            console.log(`   ❌ Failed to parse response for ${fileName}:`, stdout);
            throw parseError;
        }
    } catch (error) {
        console.log(`   ❌ Upload failed for ${fileName}:`, error.message);
        throw error;
    }
}

async function uploadAllImages() {
    console.log('🦎 Starting Greedy Geckoz IPFS upload to Web3.Storage...\n');

    // Get all PNG files
    const imageFiles = fs.readdirSync(ASSETS_DIR)
        .filter(file => file.endsWith('.png'))
        .sort((a, b) => {
            const numA = parseInt(a.replace('.png', ''));
            const numB = parseInt(b.replace('.png', ''));
            return numA - numB;
        });

    console.log(`📸 Found ${imageFiles.length} Gecko images`);

    const imageMapping = {};
    const failedUploads = [];
    
    // Upload images one by one to avoid rate limits
    for (let i = 0; i < imageFiles.length; i++) {
        const fileName = imageFiles[i];
        const filePath = path.join(ASSETS_DIR, fileName);
        const geckoId = fileName.replace('.png', '');
        
        try {
            console.log(`\n📦 Processing ${i + 1}/${imageFiles.length}: ${fileName}`);
            
            const ipfsUrl = await uploadFile(filePath, fileName);
            imageMapping[geckoId] = ipfsUrl;
            
            // Small delay between uploads
            if (i < imageFiles.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
        } catch (error) {
            console.log(`   ❌ Failed: ${fileName} - ${error.message}`);
            failedUploads.push({ fileName, error: error.message });
        }
    }

    // Save image mapping
    const imageMappingPath = path.join(OUTPUT_DIR, 'image-mapping.json');
    fs.writeFileSync(imageMappingPath, JSON.stringify(imageMapping, null, 2));
    
    console.log(`\n✅ Image upload complete!`);
    console.log(`📊 Successfully uploaded: ${Object.keys(imageMapping).length}/${imageFiles.length} images`);
    console.log(`💾 Image mapping saved to: ${imageMappingPath}`);
    
    if (failedUploads.length > 0) {
        console.log(`⚠️  Failed uploads (${failedUploads.length}):`);
        failedUploads.forEach(({ fileName, error }) => {
            console.log(`   - ${fileName}: ${error}`);
        });
    }

    return imageMapping;
}

async function uploadMetadata(geckoId, imageUrl) {
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

    // Create temporary metadata file
    const tempPath = path.join(__dirname, `temp_metadata_${geckoId}.json`);
    fs.writeFileSync(tempPath, JSON.stringify(metadata, null, 2));

    try {
        const metadataUrl = await uploadFile(tempPath, `${geckoId}.json`);
        fs.unlinkSync(tempPath); // Clean up temp file
        return metadataUrl;
    } catch (error) {
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath); // Clean up temp file even on error
        }
        throw error;
    }
}

async function uploadAllMetadata(imageMapping) {
    console.log('\n📄 Starting metadata upload...');
    
    const metadataMapping = {};
    const failedMetadata = [];
    const geckoIds = Object.keys(imageMapping);

    for (let i = 0; i < geckoIds.length; i++) {
        const geckoId = geckoIds[i];
        const imageUrl = imageMapping[geckoId];
        
        try {
            console.log(`\n📦 Processing metadata ${i + 1}/${geckoIds.length}: Gecko #${geckoId}`);
            
            const metadataUrl = await uploadMetadata(geckoId, imageUrl);
            metadataMapping[geckoId] = metadataUrl;
            
            // Small delay between uploads
            if (i < geckoIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
        } catch (error) {
            console.log(`   ❌ Failed metadata for Gecko #${geckoId}: ${error.message}`);
            failedMetadata.push({ geckoId, error: error.message });
        }
    }

    // Save metadata mapping
    const metadataMappingPath = path.join(OUTPUT_DIR, 'metadata-mapping.json');
    fs.writeFileSync(metadataMappingPath, JSON.stringify(metadataMapping, null, 2));
    
    console.log(`\n✅ Metadata upload complete!`);
    console.log(`📊 Successfully uploaded: ${Object.keys(metadataMapping).length}/${geckoIds.length} metadata files`);
    console.log(`💾 Metadata mapping saved to: ${metadataMappingPath}`);
    
    if (failedMetadata.length > 0) {
        console.log(`⚠️  Failed metadata uploads (${failedMetadata.length}):`);
        failedMetadata.forEach(({ geckoId, error }) => {
            console.log(`   - Gecko #${geckoId}: ${error}`);
        });
    }

    return metadataMapping;
}

async function main() {
    try {
        console.log('🚀 Starting complete IPFS upload process...\n');
        
        // Step 1: Upload all images
        const imageMapping = await uploadAllImages();
        
        if (Object.keys(imageMapping).length === 0) {
            console.log('❌ No images were uploaded successfully. Stopping.');
            return;
        }
        
        // Step 2: Upload metadata
        const metadataMapping = await uploadAllMetadata(imageMapping);
        
        console.log('\n🎉 Complete upload finished!');
        console.log(`📸 Images uploaded: ${Object.keys(imageMapping).length}`);
        console.log(`📄 Metadata files uploaded: ${Object.keys(metadataMapping).length}`);
        console.log(`\n🔥 Your Geckos are now live on IPFS!`);
        console.log(`📁 Check the 'assets/uploaded/' directory for the mapping files.`);
        
        // Show some example URLs
        const sampleGeckoIds = Object.keys(imageMapping).slice(0, 3);
        if (sampleGeckoIds.length > 0) {
            console.log(`\n📋 Sample URLs:`);
            sampleGeckoIds.forEach(geckoId => {
                console.log(`   Gecko #${geckoId}:`);
                console.log(`   📸 Image: ${imageMapping[geckoId]}`);
                if (metadataMapping[geckoId]) {
                    console.log(`   📄 Metadata: ${metadataMapping[geckoId]}`);
                }
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('\n❌ Upload process failed:', error);
        process.exit(1);
    }
}

// Run the upload if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = { uploadAllImages, uploadAllMetadata };