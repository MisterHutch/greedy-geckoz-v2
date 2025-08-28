import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { Metaplex, keypairIdentity, walletAdapterIdentity } from '@metaplex-foundation/js'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    console.log('🧪 Test NFT creation starting for wallet:', walletAddress)
    
    // Create connection to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    
    console.log('🔗 Connected to devnet RPC')
    
    // Get wallet balance for debugging
    const publicKey = new PublicKey(walletAddress)
    const balance = await connection.getBalance(publicKey)
    console.log('💰 Wallet balance:', balance / 1e9, 'SOL')
    
    // Create basic metadata
    const metadata = {
      name: 'Test Gecko NFT',
      symbol: 'GECKO',
      description: 'A test gecko NFT to verify minting works',
      image: 'https://via.placeholder.com/400x400/00ff00/000000?text=Test+Gecko',
      attributes: [
        {
          trait_type: 'Type',
          value: 'Test'
        },
        {
          trait_type: 'Rarity',
          value: 'Common'
        }
      ],
      properties: {
        files: [
          {
            uri: 'https://via.placeholder.com/400x400/00ff00/000000?text=Test+Gecko',
            type: 'image/png'
          }
        ],
        category: 'image'
      }
    }
    
    // Create inline metadata URI
    const metadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`
    console.log('📋 Metadata URI created (inline):', metadataUri.substring(0, 100) + '...')
    
    // Initialize Metaplex (this will fail if wallet signing is required)
    const metaplex = Metaplex.make(connection)
    console.log('🔧 Metaplex initialized')
    
    // Try to create NFT - this should fail because we don't have signing capability
    try {
      console.log('🚨 Attempting NFT creation (this should fail without wallet signing)...')
      const { nft } = await metaplex.nfts().create({
        uri: metadataUri,
        name: metadata.name,
        symbol: metadata.symbol,
        sellerFeeBasisPoints: 0,
        creators: [
          {
            address: publicKey,
            share: 100
          }
        ]
      })
      
      console.log('❌ This should not have succeeded without wallet signing!')
      return NextResponse.json({
        success: false,
        error: 'Unexpected success without wallet signing',
        details: 'This indicates a configuration issue'
      })
      
    } catch (createError: any) {
      console.log('✅ Expected error without wallet signing:', createError.message)
      
      return NextResponse.json({
        success: false,
        error: 'Cannot create NFT from server-side',
        message: 'NFT creation requires client-side wallet signing',
        walletAddress,
        balance: balance / 1e9,
        network: 'devnet',
        metadataLength: metadataUri.length,
        rpcEndpoint: connection.rpcEndpoint,
        diagnosis: 'Server-side NFT creation properly blocked - client-side minting should work'
      })
    }

  } catch (error: any) {
    console.error('🔥 Test NFT creation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 })
  }
}