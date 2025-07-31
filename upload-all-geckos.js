const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Updated credentials (admin API key)
const API_KEY = '94a1643973bd42ab1019';
const SECRET_KEY = 'ce38ca1a0c4cd65b90fe830a117ea7b280d57345f323c97ae7aa82a3772beaae';

console.log('🦎 **GREEDY GECKOZ MASS UPLOAD TO IPFS** 🦎\n');
console.log('🚀 Uploading all 957 Geckos to IPFS...\n');

// Get all PNG files
const assetsDir = path.join(process.cwd(), 'assets', 'images');
const outputDir = path.join(process.cwd(), 'assets', 'uploaded');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const imageFiles = fs.readdirSync(assetsDir)
  .filter(file => file.endsWith('.png'))
  .sort((a, b) => {
    const numA = parseInt(path.basename(a, '.png'));
    const numB = parseInt(path.basename(b, '.png'));
    return numA - numB;
  });

console.log(`📸 Found ${imageFiles.length} Gecko images`);
console.log('📊 Starting batch upload...\n');

const imageMapping = {};
const metadataMapping = {};
let completed = 0;
let errors = [];

// Upload function with curl
function uploadWithCurl(filePath, fileName, geckoId) {
  return new Promise((resolve, reject) => {
    const curlArgs = [
      '-X', 'POST',
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      '-H', `pinata_api_key: ${API_KEY}`,
      '-H', `pinata_secret_api_key: ${SECRET_KEY}`,
      '-F', `file=@${filePath}`,
      '-F', `pinataMetadata={"name":"Greedy Gecko #${geckoId}","keyvalues":{"collection":"GreedyGeckoz","type":"image","geckoId":"${geckoId}"}}`
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
          if (result.IpfsHash) {
            resolve(result);
          } else {
            reject(new Error(`Upload failed: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${output}`));
        }
      } else {
        reject(new Error(`curl failed with code ${code}: ${error}`));
      }
    });
  });
}

// Upload metadata function
function uploadMetadata(metadata, fileName) {
  return new Promise((resolve, reject) => {
    // Create temp file for metadata
    const tempFile = path.join(outputDir, `temp-${fileName}`);
    fs.writeFileSync(tempFile, JSON.stringify(metadata, null, 2));
    
    const curlArgs = [
      '-X', 'POST',
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      '-H', `pinata_api_key: ${API_KEY}`,
      '-H', `pinata_secret_api_key: ${SECRET_KEY}`,
      '-F', `file=@${tempFile}`,
      '-F', `pinataMetadata={"name":"${fileName}","keyvalues":{"collection":"GreedyGeckoz","type":"metadata"}}`
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
      // Clean up temp file
      try { fs.unlinkSync(tempFile); } catch {}
      
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          if (result.IpfsHash) {
            resolve(result);
          } else {
            reject(new Error(`Metadata upload failed: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse metadata response: ${output}`));
        }
      } else {
        reject(new Error(`curl failed with code ${code}: ${error}`));
      }
    });
  });
}

// Generate attributes for gecko
function generateAttributes(geckoNumber) {
  const backgrounds = ['Cosmic Purple', 'Neon Green', 'Void Black', 'Solana Blue', 'Rug Red', 'FOMO Gold'];
  const eyes = ['Laser Vision', 'Diamond Eyes', 'Void Stare', 'Degen Gaze', 'NGMI Look', 'Hopium High'];
  const hats = ['Diamond Crown', 'Cope Hat', 'Lambo Cap', 'Paper Hands Beanie', 'Moon Helmet', 'None'];
  const accessories = ['Gold Chain', 'Loss Tracker', 'Hopium Pipe', 'Degen Badge', 'Rug Detector', 'None'];
  
  const seed = geckoNumber;
  
  return [
    { trait_type: 'Background', value: backgrounds[seed % backgrounds.length] },
    { trait_type: 'Eyes', value: eyes[(seed * 2) % eyes.length] },
    { trait_type: 'Hat', value: hats[(seed * 3) % hats.length] },
    { trait_type: 'Accessory', value: accessories[(seed * 5) % accessories.length] },
    { trait_type: 'Rarity', value: calculateRarity(geckoNumber) },
    { trait_type: 'Degen Level', value: getDegenLevel(geckoNumber) }
  ];
}

function calculateRarity(geckoNumber) {
  if (geckoNumber <= 10) return 'Genesis';
  if (geckoNumber > 2200) return 'Legendary';
  if (geckoNumber % 100 === 0) return 'Epic';
  if (geckoNumber % 50 === 0) return 'Rare';
  if (geckoNumber % 10 === 0) return 'Uncommon';
  return 'Common';
}

function getDegenLevel(geckoNumber) {
  const levels = ['Rookie', 'Degen', 'Veteran', 'Chad', 'Diamond Hands', 'Legendary Degen'];
  return levels[geckoNumber % levels.length];
}

// Process files with concurrency control
async function processImages() {
  const concurrent = 3; // 3 concurrent uploads
  const delay = 200; // 200ms delay between batches
  
  console.log('📸 **PHASE 1: UPLOADING IMAGES**\n');
  
  for (let i = 0; i < imageFiles.length; i += concurrent) {
    const batch = imageFiles.slice(i, i + concurrent);
    const promises = batch.map(async (fileName) => {
      const geckoId = path.basename(fileName, '.png');
      const filePath = path.join(assetsDir, fileName);
      
      try {
        const result = await uploadWithCurl(filePath, fileName, geckoId);
        imageMapping[geckoId] = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
        completed++;
        
        const percentage = Math.round((completed / imageFiles.length) * 100);
        process.stdout.write(`\r   🦎 Gecko #${geckoId} uploaded (${completed}/${imageFiles.length}) ${percentage}%`);
        
        return { geckoId, ipfsHash: result.IpfsHash };
      } catch (error) {
        errors.push(`Gecko #${geckoId}: ${error.message}`);
        return null;
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between batches
    if (i + concurrent < imageFiles.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log(`\n✅ Images complete: ${completed}/${imageFiles.length} uploaded\n`);
}

// Process metadata
async function processMetadata() {
  console.log('📄 **PHASE 2: UPLOADING METADATA**\n');
  
  let metadataCompleted = 0;
  
  for (const [geckoId, imageUrl] of Object.entries(imageMapping)) {
    try {
      const geckoNumber = parseInt(geckoId);
      const metadata = {
        name: `Greedy Gecko #${geckoId}`,
        description: "A greedy little gecko ready to lose money on Solana. Part of the exclusive 957 Gecko collection where degens gather to embrace beautiful financial chaos.",
        image: imageUrl,
        attributes: generateAttributes(geckoNumber),
        properties: {
          files: [{ uri: imageUrl, type: "image/png" }],
          category: "image",
          creators: [{ address: "", share: 100 }]
        },
        collection: { name: "Greedy Geckoz", family: "GreedyGeckoz" }
      };
      
      const result = await uploadMetadata(metadata, `${geckoId}.json`);
      metadataMapping[geckoId] = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      
      metadataCompleted++;
      const percentage = Math.round((metadataCompleted / Object.keys(imageMapping).length) * 100);
      process.stdout.write(`\r   📄 Metadata #${geckoId} uploaded (${metadataCompleted}/${Object.keys(imageMapping).length}) ${percentage}%`);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      errors.push(`Metadata #${geckoId}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Metadata complete: ${metadataCompleted}/${Object.keys(imageMapping).length} uploaded\n`);
}

// Save mappings
function saveMappings() {
  fs.writeFileSync(
    path.join(outputDir, 'image-mapping.json'),
    JSON.stringify(imageMapping, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'metadata-mapping.json'),
    JSON.stringify(metadataMapping, null, 2)
  );
  
  console.log(`💾 Mappings saved to ${outputDir}/`);
}

// Main execution
async function main() {
  try {
    await processImages();
    await processMetadata();
    saveMappings();
    
    console.log('\n🎊 **UPLOAD COMPLETE!**');
    console.log(`✅ ${completed} images uploaded to IPFS`);
    console.log(`✅ ${Object.keys(metadataMapping).length} metadata files uploaded`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} errors occurred:`);
      errors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
      if (errors.length > 5) console.log(`   ... and ${errors.length - 5} more`);
    }
    
    console.log('\n🚀 **READY FOR MINT CONTRACT!**');
    console.log('Your 957 Geckos are now live on IPFS and ready to mint! 🦎💎');
    
  } catch (error) {
    console.error('💀 Upload failed:', error.message);
  }
}

// Start the upload
main();