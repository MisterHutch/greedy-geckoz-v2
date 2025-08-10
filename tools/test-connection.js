const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🧪 Testing IPFS upload with sample Gecko...\n');

  try {
    // Check credentials
    const apiKey = process.env.PINATA_API_KEY;
    const secretKey = process.env.PINATA_SECRET_API_KEY;

    if (!apiKey || !secretKey) {
      console.error('❌ Missing Pinata credentials!');
      console.log('Add these to your .env.local file:');
      console.log('PINATA_API_KEY=your_api_key');
      console.log('PINATA_SECRET_API_KEY=your_secret_key');
      process.exit(1);
    }

    console.log('🔑 Found Pinata credentials');
    console.log(`API Key: ${apiKey}`);

    // Test authentication
    console.log('🔌 Testing connection to Pinata...');
    
    try {
      const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey
        }
      });
      
      console.log('✅ Connected to Pinata successfully!');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('❌ Failed to connect to Pinata');
      console.error('Error:', error.response?.data || error.message);
      process.exit(1);
    }

    // Find a sample image
    const assetsDir = path.join(process.cwd(), 'assets', 'images');
    if (!fs.existsSync(assetsDir)) {
      console.error(`❌ Assets directory not found: ${assetsDir}`);
      process.exit(1);
    }

    const sampleFiles = fs.readdirSync(assetsDir)
      .filter(f => f.endsWith('.png'))
      .slice(0, 1); // Just one file for testing

    if (sampleFiles.length === 0) {
      console.error('❌ No PNG files found in assets/images/');
      process.exit(1);
    }

    const sampleFile = path.join(assetsDir, sampleFiles[0]);
    console.log(`📸 Testing upload with: ${sampleFiles[0]}`);

    // Upload sample image
    const formData = new FormData();
    formData.append('file', fs.createReadStream(sampleFile));
    
    const metadata = JSON.stringify({
      name: `Test Gecko - ${sampleFiles[0]}`,
      keyvalues: {
        collection: 'GreedyGeckoz',
        type: 'test-image'
      }
    });
    formData.append('pinataMetadata', metadata);

    const uploadResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey
        }
      }
    );

    console.log('🎉 Upload successful!');
    console.log(`📍 IPFS Hash: ${uploadResponse.data.IpfsHash}`);
    console.log(`🌐 Gateway URL: https://gateway.pinata.cloud/ipfs/${uploadResponse.data.IpfsHash}`);
    console.log(`📏 File Size: ${(uploadResponse.data.PinSize / 1024).toFixed(2)} KB`);

    console.log('\n🎊 Test complete! Your IPFS setup is working perfectly.');
    console.log('\nReady to upload all 957 Geckos!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run test
testConnection();