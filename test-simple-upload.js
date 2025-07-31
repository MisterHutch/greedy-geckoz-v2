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

// Web3.Storage API Token
const WEB3_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDg3NDFlNzBENzFkQzY0OTU5RkI5QzEzODBGQ0U0QkI3YUFEMkUzNmQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE3MjIzNTM2NzE0NjAsIm5hbWUiOiJnZWNrb3oifQ.CJbTxFB6RFzBm4V6Qx-wJ8uE_9ry7oAiKdXh5xzWm0s';

async function testUpload() {
    console.log('🦎 Testing IPFS upload with first 3 Geckos...\n');

    // Get first 3 PNG files
    const allFiles = fs.readdirSync(ASSETS_DIR)
        .filter(file => file.endsWith('.png'))
        .sort((a, b) => {
            const numA = parseInt(a.replace('.png', ''));
            const numB = parseInt(b.replace('.png', ''));
            return numA - numB;
        });

    const testFiles = allFiles.slice(0, 3);
    console.log(`📸 Testing with files: ${testFiles.join(', ')}`);

    const results = {};

    for (let i = 0; i < testFiles.length; i++) {
        const fileName = testFiles[i];
        const filePath = path.join(ASSETS_DIR, fileName);
        const geckoId = fileName.replace('.png', '');

        try {
            console.log(`\n📦 Testing ${i + 1}/${testFiles.length}: ${fileName}`);
            console.log(`📁 File path: ${filePath}`);
            
            // Check file exists and get size
            const stats = fs.statSync(filePath);
            console.log(`📏 File size: ${(stats.size / 1024).toFixed(2)} KB`);

            // Test upload with curl
            const curlCmd = `curl -X POST "https://api.web3.storage/upload" ` +
                           `-H "Authorization: Bearer ${WEB3_STORAGE_TOKEN}" ` +
                           `-H "Content-Type: application/octet-stream" ` +
                           `--data-binary "@${filePath.replace(/\\/g, '/')}"`;

            console.log(`🚀 Uploading...`);
            
            const { stdout, stderr } = await execAsync(curlCmd, { 
                maxBuffer: 1024 * 1024 * 10,
                encoding: 'utf8'
            });

            console.log(`📤 Raw response:`, stdout);
            if (stderr) {
                console.log(`⚠️  Stderr:`, stderr);
            }

            try {
                const response = JSON.parse(stdout);
                if (response.cid) {
                    const ipfsUrl = `https://${response.cid}.ipfs.w3s.link`;
                    console.log(`✅ Success! IPFS URL: ${ipfsUrl}`);
                    results[geckoId] = ipfsUrl;
                } else {
                    console.log(`❌ No CID in response`);
                }
            } catch (parseError) {
                console.log(`❌ Failed to parse JSON response`);
            }

        } catch (error) {
            console.log(`❌ Upload failed for ${fileName}:`, error.message);
        }

        // Delay between uploads
        if (i < testFiles.length - 1) {
            console.log(`⏱️  Waiting 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\n🎉 Test complete!`);
    console.log(`📊 Successful uploads: ${Object.keys(results).length}/${testFiles.length}`);
    
    if (Object.keys(results).length > 0) {
        console.log(`\n📋 Results:`);
        Object.entries(results).forEach(([geckoId, url]) => {
            console.log(`   Gecko #${geckoId}: ${url}`);
        });
        
        console.log(`\n✅ IPFS upload is working! Ready for full upload.`);
        return true;
    } else {
        console.log(`\n❌ No successful uploads. Please check your setup.`);
        return false;
    }
}

// Run test
testUpload().catch(console.error);