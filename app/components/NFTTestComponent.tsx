'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js'

export default function NFTTestComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const wallet = useWallet()

  const testDirectNFTCreation = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setResult({ error: 'Wallet not connected' })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      console.log('🧪 Starting direct NFT test...')
      console.log('👛 Wallet:', wallet.publicKey.toString())
      console.log('🌐 Network:', process.env.NEXT_PUBLIC_NETWORK)
      
      // Create connection
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
        'confirmed'
      )
      
      console.log('🔗 RPC:', connection.rpcEndpoint)
      
      // Check balance
      const balance = await connection.getBalance(wallet.publicKey)
      console.log('💰 Balance:', balance / 1e9, 'SOL')
      
      if (balance < 0.001 * 1e9) { // Need at least 0.001 SOL for tx fees
        throw new Error('Insufficient balance for transaction fees')
      }

      // Create Metaplex instance with wallet
      const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet as any))
      
      console.log('🔧 Metaplex configured with wallet adapter')

      // Simple test metadata
      const metadata = {
        name: 'Direct Test Gecko',
        symbol: 'TEST',
        description: 'Direct NFT creation test',
        image: 'https://via.placeholder.com/400x400/ff0000/ffffff?text=DIRECT+TEST',
        attributes: [
          { trait_type: 'Test', value: 'Direct Creation' },
          { trait_type: 'Timestamp', value: new Date().toISOString() }
        ]
      }
      
      // Create inline metadata URI
      const metadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`
      console.log('📋 Metadata created:', metadataUri.substring(0, 100) + '...')

      // Attempt to create NFT
      console.log('🏗️ Creating NFT...')
      const { nft, response } = await metaplex.nfts().create({
        uri: metadataUri,
        name: metadata.name,
        symbol: metadata.symbol,
        sellerFeeBasisPoints: 0,
        creators: [
          {
            address: wallet.publicKey,
            share: 100
          }
        ],
        tokenOwner: wallet.publicKey
      })

      console.log('✅ NFT Created successfully!')
      console.log('📍 Mint Address:', nft.address.toString())
      console.log('📋 TX Signature:', response.signature)
      
      // Get token account
      const tokenAccounts = await connection.getTokenAccountsByOwner(wallet.publicKey, {
        mint: nft.address
      })
      
      const tokenAccount = tokenAccounts.value[0]?.pubkey.toString()
      console.log('🏦 Token Account:', tokenAccount)
      
      const explorerUrl = `https://explorer.solana.com/address/${nft.address.toString()}?cluster=${process.env.NEXT_PUBLIC_NETWORK || 'devnet'}`
      console.log('🔗 Explorer:', explorerUrl)

      setResult({
        success: true,
        mintAddress: nft.address.toString(),
        tokenAccount,
        txSignature: response.signature,
        explorerUrl,
        metadata: nft.json,
        name: nft.name,
        symbol: nft.symbol,
        message: 'NFT created successfully! Check your wallet and the explorer link.'
      })

    } catch (error: any) {
      console.error('❌ Direct NFT creation failed:', error)
      setResult({
        success: false,
        error: error.message,
        details: error.toString(),
        stack: error.stack
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!wallet.connected) {
    return (
      <div style={{ 
        padding: '2rem', 
        background: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: '12px',
        margin: '2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>🧪 NFT Direct Test</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Connect your wallet to test direct NFT creation</p>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '2rem', 
      background: 'rgba(255, 255, 255, 0.1)', 
      borderRadius: '12px',
      margin: '2rem'
    }}>
      <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>🧪 NFT Direct Test</h3>
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
        This will attempt to create an NFT directly using Metaplex to isolate any wallet integration issues.
      </p>
      
      <button
        onClick={testDirectNFTCreation}
        disabled={isLoading}
        style={{
          background: isLoading ? '#666' : '#ff6b6b',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}
      >
        {isLoading ? 'Creating NFT...' : '🚀 Test Direct NFT Creation'}
      </button>

      {result && (
        <div style={{
          background: result.success ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
          border: `1px solid ${result.success ? '#00ff00' : '#ff0000'}`,
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1rem'
        }}>
          <h4 style={{ 
            color: result.success ? '#00ff00' : '#ff0000',
            marginBottom: '0.5rem'
          }}>
            {result.success ? '✅ Success!' : '❌ Failed'}
          </h4>
          
          {result.success ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              <p><strong>Mint Address:</strong> {result.mintAddress}</p>
              <p><strong>Token Account:</strong> {result.tokenAccount}</p>
              <p><strong>TX Signature:</strong> {result.txSignature}</p>
              <p><strong>Explorer:</strong> <a href={result.explorerUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff00' }}>View on Solana Explorer</a></p>
              <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{result.message}</p>
            </div>
          ) : (
            <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              <p><strong>Error:</strong> {result.error}</p>
              {result.details && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#ff6b6b' }}>Show Details</summary>
                  <pre style={{ 
                    background: 'rgba(0, 0, 0, 0.3)', 
                    padding: '0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    overflow: 'auto',
                    marginTop: '0.5rem'
                  }}>
                    {result.details}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}