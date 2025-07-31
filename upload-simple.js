const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.PINATA_API_KEY;
const SECRET_KEY = process.env.PINATA_SECRET_API_KEY;

if (!API_KEY || !SECRET_KEY) {
  console.error('❌ Missing Pinata credentials in .env.local');
  process.exit(1);
}

console.log('🦎 Starting Greedy Geckoz upload to IPFS...\n');
console.log('🔑 API Key:', API_KEY);
console.log('✅ Credentials loaded successfully');

// Get all PNG files
const assetsDir = path.join(process.cwd(), 'assets', 'images');
if (!fs.existsSync(assetsDir)) {
  console.error(`❌ Assets directory not found: ${assetsDir}`);
  process.exit(1);
}

const imageFiles = fs.readdirSync(assetsDir)
  .filter(file => file.endsWith('.png'))
  .sort((a, b) => {
    const numA = parseInt(path.basename(a, '.png'));
    const numB = parseInt(path.basename(b, '.png'));
    return numA - numB;
  });

console.log(`📸 Found ${imageFiles.length} Gecko images`);

if (imageFiles.length === 0) {
  console.error('❌ No PNG files found');
  process.exit(1);
}

// Test with first image
const testFile = imageFiles[0];
const testPath = path.join(assetsDir, testFile);

console.log(`🧪 Testing upload with: ${testFile}`);

// Create upload function using curl
function uploadWithCurl(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    
    const curlArgs = [
      '-X', 'POST',
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      '-H', `pinata_api_key: ${API_KEY}`,
      '-H', `pinata_secret_api_key: ${SECRET_KEY}`,
      '-F', `file=@"${filePath}"`,
      '-F', `pinataMetadata={"name":"${fileName}","keyvalues":{"collection":"GreedyGeckoz","type":"image"}}`
    ];
    
    const curl = spawn('curl', curlArgs);
    let output = '';
    let error = '';
    
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    curl.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${output}`));
        }
      } else {
        reject(new Error(`curl failed: ${error}`));
      }
    });
  });
}

// Test upload
uploadWithCurl(testPath, `Test Gecko - ${testFile}`)
  .then(result => {
    console.log('🎉 Upload successful!');
    console.log(`📍 IPFS Hash: ${result.IpfsHash}`);
    console.log(`🌐 Gateway URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    console.log(`📏 File Size: ${(result.PinSize / 1024).toFixed(2)} KB`);
    
    console.log('\n✅ Test complete! Your IPFS setup is working perfectly.');
    console.log('\nReady to upload all 957 Geckos! This was just a test.');
    console.log('\nTo upload all images, we can proceed with the full batch upload.');
  })
  .catch(error => {
    console.error('❌ Upload failed:', error.message);
  });