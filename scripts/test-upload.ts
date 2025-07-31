#!/usr/bin/env node

import { createPinataUploader } from '../lib/ipfs/pinata-uploader'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testUpload() {
  console.log('🧪 Testing IPFS upload with sample Gecko...\n')

  try {
    // Check credentials
    const apiKey = process.env.PINATA_API_KEY
    const secretKey = process.env.PINATA_SECRET_API_KEY

    if (!apiKey || !secretKey) {
      console.error('❌ Missing Pinata credentials!')
      console.log('Add these to your .env.local file:')
      console.log('PINATA_API_KEY=your_api_key')
      console.log('PINATA_SECRET_API_KEY=your_secret_key')
      process.exit(1)
    }

    console.log('🔑 Found Pinata credentials')

    // Create uploader
    const uploader = createPinataUploader(apiKey, secretKey)

    // Test authentication
    console.log('🔌 Testing connection to Pinata...')
    const isConnected = await uploader.testAuthentication()
    
    if (!isConnected) {
      console.error('❌ Failed to connect to Pinata')
      console.log('Check your API keys are correct')
      process.exit(1)
    }

    console.log('✅ Connected to Pinata successfully!')

    // Find a sample image
    const assetsDir = path.join(process.cwd(), 'assets', 'images')
    const sampleFiles = fs.readdirSync(assetsDir)
      .filter(f => f.endsWith('.png'))
      .slice(0, 1) // Just one file for testing

    if (sampleFiles.length === 0) {
      console.error('❌ No PNG files found in assets/images/')
      process.exit(1)
    }

    const sampleFile = path.join(assetsDir, sampleFiles[0])
    console.log(`📸 Testing upload with: ${sampleFiles[0]}`)

    // Upload sample image
    const result = await uploader.uploadFile(sampleFile, {
      name: `Test Gecko - ${sampleFiles[0]}`,
      keyvalues: {
        collection: 'GreedyGeckoz',
        type: 'test-image'
      }
    })

    console.log('🎉 Upload successful!')
    console.log(`📍 IPFS Hash: ${result.IpfsHash}`)
    console.log(`🌐 Gateway URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`)
    console.log(`📏 File Size: ${(result.PinSize / 1024).toFixed(2)} KB`)

    // Test metadata upload
    console.log('\n📄 Testing metadata upload...')
    const testMetadata = {
      name: "Test Greedy Gecko #0",
      description: "A test gecko for IPFS upload verification",
      image: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      attributes: [
        { trait_type: "Type", value: "Test" },
        { trait_type: "Rarity", value: "Testing" }
      ]
    }

    const metadataResult = await uploader.uploadMetadata(testMetadata, 'test-metadata.json')
    
    console.log('✅ Metadata upload successful!')
    console.log(`📍 Metadata Hash: ${metadataResult.IpfsHash}`)
    console.log(`🌐 Metadata URL: https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`)

    console.log('\n🎊 Test complete! Your IPFS setup is working perfectly.')
    console.log('\nReady to upload all 957 Geckos? Run:')
    console.log('npm run upload-geckos')

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// Run test
testUpload()