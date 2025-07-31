const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const ASSETS_DIR = 'C:\\Users\\Hutch\\OneDrive\\wallet\\Geckoz_2025\\images';
const METADATA_DIR = 'C:\\Users\\Hutch\\OneDrive\\wallet\\Geckoz_2025\\metadata';
const OUTPUT_DIR = path.join(__dirname, 'assets', 'uploaded');

// Read Pinata credentials from .env.local file
function loadEnvCredentials() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        let apiKey = null;
        let secretKey = null;
        
        envContent.split('\n').forEach(line => {
            if (line.startsWith('PINATA_API_KEY=')) {
                apiKey = line.split('=')[1];
            }
            if (line.startsWith('PINATA_SECRET_API_KEY=')) {
                secretKey = line.split('=')[1];
            }
        });
        
        return { apiKey, secretKey };
    } catch (error) {
        return { apiKey: null, secretKey: null };
    }
}

const { apiKey: PINATA_API_KEY, secretKey: PINATA_SECRET_API_KEY } = loadEnvCredentials();

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.error('❌ Missing Pinata credentials! Check your .env.local file.');
    process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function uploadToPinata(filePath, fileName, isMetadata = false) {
    try {
        const curlCmd = `curl -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" ` +
                       `-H "pinata_api_key: ${PINATA_API_KEY}" ` +
                       `-H "pinata_secret_api_key: ${PINATA_SECRET_API_KEY}" ` +
                       `-F "file=@${filePath.replace(/\\/g, '/')}" ` +
                       `-F "pinataMetadata={\\"name\\":\\"${fileName}\\",\\"keyvalues\\":{\\"type\\":\\"${isMetadata ? 'metadata' : 'image'}\\",\\"collection\\":\\"GreedyGeckoz2025\\"}}"`;

        const { stdout, stderr } = await execAsync(curlCmd, { 
            maxBuffer: 1024 * 1024 * 10,
            encoding: 'utf8'
        });

        try {
            const response = JSON.parse(stdout);
            if (response.IpfsHash) {
                const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`;
                return { hash: response.IpfsHash, url: ipfsUrl };
            } else if (response.error) {
                throw new Error(`Pinata error: ${response.error.reason} - ${response.error.details}`);
            } else {
                throw new Error(`No hash in response: ${stdout}`);
            }
        } catch (parseError) {
            console.log(`   ❌ Failed to parse response for ${fileName}:`, stdout);
            throw parseError;
        }
    } catch (error) {
        throw error;
    }
}

async function testUpload() {
    console.log('🦎 Testing upload with first Gecko from new collection...\n');

    // Get first PNG file
    const imageFiles = fs.readdirSync(ASSETS_DIR)
        .filter(file => file.endsWith('.png'))
        .sort((a, b) => {
            const numA = parseInt(a.replace('.png', ''));
            const numB = parseInt(b.replace('.png', ''));
            return numA - numB;
        });

    if (imageFiles.length === 0) {
        console.log('❌ No PNG files found in images directory');
        return false;
    }

    const testFile = imageFiles[0];
    const filePath = path.join(ASSETS_DIR, testFile);
    
    console.log(`📸 Testing with: ${testFile}`);
    console.log(`📁 File path: ${filePath}`);
    
    // Check file exists and get size
    const stats = fs.statSync(filePath);
    console.log(`📏 File size: ${(stats.size / 1024).toFixed(2)} KB`);

    try {
        console.log(`🚀 Uploading to Pinata...`);
        const result = await uploadToPinata(filePath, `Test-${testFile}`, false);
        
        console.log(`\n✅ Test successful!`);
        console.log(`📍 IPFS Hash: ${result.hash}`);
        console.log(`🌐 Gateway URL: ${result.url}`);
        
        // Test metadata upload too
        const metadataFiles = fs.readdirSync(METADATA_DIR)
            .filter(file => file.endsWith('.json'))
            .sort((a, b) => {
                const numA = parseInt(a.replace('.json', ''));
                const numB = parseInt(b.replace('.json', ''));
                return numA - numB;
            });

        if (metadataFiles.length > 0) {
            const testMetadataFile = metadataFiles[0];
            const metadataPath = path.join(METADATA_DIR, testMetadataFile);
            
            console.log(`\n📄 Testing metadata upload: ${testMetadataFile}`);
            const metadataResult = await uploadToPinata(metadataPath, `Test-${testMetadataFile}`, true);
            
            console.log(`✅ Metadata test successful!`);
            console.log(`📍 Metadata Hash: ${metadataResult.hash}`);
            console.log(`🌐 Metadata URL: ${metadataResult.url}`);
        }
        
        return true;
    } catch (error) {
        console.log(`\n❌ Test failed:`, error.message);
        return false;
    }
}

async function uploadAllFiles() {
    console.log('🦎 Starting full Geckoz 2025 collection upload...\n');

    // Get all PNG files
    const imageFiles = fs.readdirSync(ASSETS_DIR)
        .filter(file => file.endsWith('.png'))
        .sort((a, b) => {
            const numA = parseInt(a.replace('.png', ''));
            const numB = parseInt(b.replace('.png', ''));
            return numA - numB;
        });

    // Get all JSON files
    const metadataFiles = fs.readdirSync(METADATA_DIR)
        .filter(file => file.endsWith('.json'))
        .sort((a, b) => {
            const numA = parseInt(a.replace('.json', ''));
            const numB = parseInt(b.replace('.json', ''));
            return numA - numB;
        });

    console.log(`📸 Found ${imageFiles.length} images`);
    console.log(`📄 Found ${metadataFiles.length} metadata files`);

    const imageMapping = {};
    const metadataMapping = {};
    const failedUploads = [];

    // Phase 1: Upload images
    console.log(`\n📸 **PHASE 1: UPLOADING IMAGES**\n`);
    
    for (let i = 0; i < imageFiles.length; i++) {
        const fileName = imageFiles[i];
        const filePath = path.join(ASSETS_DIR, fileName);
        const geckoId = fileName.replace('.png', '');
        
        try {
            console.log(`   🦎 Uploading Gecko #${geckoId} (${i + 1}/${imageFiles.length}) ${((i + 1) / imageFiles.length * 100).toFixed(1)}%`);
            
            const result = await uploadToPinata(filePath, fileName, false);
            imageMapping[geckoId] = result.url;
            
            // Progress update every 50 files
            if ((i + 1) % 50 === 0) {
                console.log(`\n📊 Progress: ${i + 1}/${imageFiles.length} images uploaded (${((i + 1) / imageFiles.length * 100).toFixed(1)}%)`);
            }
            
            // Small delay to avoid rate limits
            if (i < imageFiles.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
        } catch (error) {
            console.log(`   ❌ Failed: Gecko #${geckoId} - ${error.message}`);
            failedUploads.push({ type: 'image', geckoId, fileName, error: error.message });
        }
    }

    // Save image mapping
    const imageMappingPath = path.join(OUTPUT_DIR, 'image-mapping-2025.json');
    fs.writeFileSync(imageMappingPath, JSON.stringify(imageMapping, null, 2));
    
    console.log(`\n✅ Image upload complete!`);
    console.log(`📊 Successfully uploaded: ${Object.keys(imageMapping).length}/${imageFiles.length} images`);
    console.log(`💾 Image mapping saved to: ${imageMappingPath}`);

    // Phase 2: Upload metadata
    console.log(`\n📄 **PHASE 2: UPLOADING METADATA**\n`);
    
    for (let i = 0; i < metadataFiles.length; i++) {
        const fileName = metadataFiles[i];
        const filePath = path.join(METADATA_DIR, fileName);
        const geckoId = fileName.replace('.json', '');
        
        try {
            console.log(`   📄 Uploading Gecko #${geckoId} metadata (${i + 1}/${metadataFiles.length}) ${((i + 1) / metadataFiles.length * 100).toFixed(1)}%`);
            
            const result = await uploadToPinata(filePath, fileName, true);
            metadataMapping[geckoId] = result.url;
            
            // Progress update every 50 files
            if ((i + 1) % 50 === 0) {
                console.log(`\n📊 Progress: ${i + 1}/${metadataFiles.length} metadata files uploaded (${((i + 1) / metadataFiles.length * 100).toFixed(1)}%)`);
            }
            
            // Small delay to avoid rate limits
            if (i < metadataFiles.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
        } catch (error) {
            console.log(`   ❌ Failed: Gecko #${geckoId} metadata - ${error.message}`);
            failedUploads.push({ type: 'metadata', geckoId, fileName, error: error.message });
        }
    }

    // Save metadata mapping
    const metadataMappingPath = path.join(OUTPUT_DIR, 'metadata-mapping-2025.json');
    fs.writeFileSync(metadataMappingPath, JSON.stringify(metadataMapping, null, 2));
    
    console.log(`\n✅ Metadata upload complete!`);
    console.log(`📊 Successfully uploaded: ${Object.keys(metadataMapping).length}/${metadataFiles.length} metadata files`);
    console.log(`💾 Metadata mapping saved to: ${metadataMappingPath}`);

    // Summary
    console.log(`\n🎉 **UPLOAD SUMMARY**`);
    console.log(`📸 Images uploaded: ${Object.keys(imageMapping).length}/${imageFiles.length}`);
    console.log(`📄 Metadata uploaded: ${Object.keys(metadataMapping).length}/${metadataFiles.length}`);
    console.log(`❌ Failed uploads: ${failedUploads.length}`);
    
    if (failedUploads.length > 0) {
        console.log(`\n⚠️  Failed uploads (${failedUploads.length}):`);
        failedUploads.slice(0, 10).forEach(({ type, geckoId, error }) => {
            console.log(`   - ${type} Gecko #${geckoId}: ${error}`);
        });
        if (failedUploads.length > 10) {
            console.log(`   ... and ${failedUploads.length - 10} more`);
        }
    }

    console.log(`\n🔥 Your 2,222 Geckos are now live on IPFS!`);
    console.log(`📁 Check the 'assets/uploaded/' directory for the mapping files.`);

    return { imageMapping, metadataMapping, failedUploads };
}

// Run based on command line argument
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'test') {
        console.log('🚀 Running test upload...\n');
        testUpload().then(success => {
            if (success) {
                console.log('\n🎯 Test passed! Ready for full upload.');
                console.log('Run: node upload-new-geckoz.js full');
            } else {
                console.log('\n❌ Test failed. Please check your configuration.');
            }
        }).catch(console.error);
    } else if (command === 'full') {
        console.log('🚀 Starting full upload...\n');
        uploadAllFiles().catch(console.error);
    } else {
        console.log('Usage:');
        console.log('  node upload-new-geckoz.js test  - Test upload with first files');
        console.log('  node upload-new-geckoz.js full  - Upload all 2,222 files');
    }
}

module.exports = { testUpload, uploadAllFiles };