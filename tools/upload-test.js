const fs = require('fs');
const path = require('path');

// Direct credentials (from user's message)
const API_KEY = '94a1643973bd42ab1019';
const SECRET_KEY = 'ce38ca1a0c4cd65b90fe830a117ea7b280d57345f323c97ae7aa82a3772beaae';

console.log('🦎 Starting Greedy Geckoz IPFS upload test...\n');
console.log('🔑 Using provided Pinata credentials');

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
console.log(`📂 File path: ${testPath}`);

// Check if file exists
if (!fs.existsSync(testPath)) {
  console.error('❌ Test file not found');
  process.exit(1);
}

const fileSize = fs.statSync(testPath).size;
console.log(`📏 File size: ${(fileSize / 1024).toFixed(2)} KB`);

// Create upload function using curl
function uploadWithCurl(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    
    const curlArgs = [
      '-X', 'POST',
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      '-H', `pinata_api_key: ${API_KEY}`,
      '-H', `pinata_secret_api_key: ${SECRET_KEY}`,
      '-F', `file=@${filePath}`,
      '-F', `pinataMetadata={"name":"${fileName}","keyvalues":{"collection":"GreedyGeckoz","type":"test-image"}}`
    ];
    
    console.log('🚀 Executing curl command...');
    
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
      console.log(`📤 curl completed with code: ${code}`);
      console.log(`📄 Raw output: ${output}`);
      if (error) console.log(`⚠️  Stderr: ${error}`);
      
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${output}`));
        }
      } else {
        reject(new Error(`curl failed with code ${code}: ${error}`));
      }
    });
  });
}

// Test upload
uploadWithCurl(testPath, `Test-Gecko-${testFile}`)
  .then(result => {
    console.log('\n🎉 Upload successful!');
    console.log(`📍 IPFS Hash: ${result.IpfsHash}`);
    console.log(`🌐 Gateway URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    console.log(`📏 File Size: ${(result.PinSize / 1024).toFixed(2)} KB`);
    
    console.log('\n✅ Test complete! Your IPFS setup is working perfectly.');
    console.log(`\n🔥 Ready to upload all ${imageFiles.length} Geckos to IPFS!`);
    console.log('\nThis test proves your Pinata credentials and upload system work correctly.');
  })
  .catch(error => {
    console.error('\n❌ Upload failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Pinata credentials are correct');
    console.log('3. Make sure curl is installed and accessible');
  });