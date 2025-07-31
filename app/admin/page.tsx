'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, CheckCircle, AlertTriangle, FileText, Image } from 'lucide-react'
import { metadataProcessor } from '../../lib/metadata/metadata-processor'

export default function AdminPage() {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationResults, setValidationResults] = useState<any>(null)
  const [assetCount, setAssetCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const zipFileRef = useRef<HTMLInputElement>(null)
  const metadataFileRef = useRef<HTMLInputElement>(null)

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadState('uploading')
    setError(null)
    
    try {
      await metadataProcessor.loadAssetsFromZip(file)
      setAssetCount(metadataProcessor.getAssetCount())
      
      setUploadState('processing')
      setUploadProgress(50)
      
      // Validate assets
      const validation = metadataProcessor.validateAssets()
      setValidationResults(validation)
      
      setUploadProgress(100)
      setUploadState(validation.valid ? 'complete' : 'error')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadState('error')
    }
  }

  const handleMetadataUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploadState('uploading')
    setError(null)
    
    try {
      await metadataProcessor.loadAssetsFromJson(files)
      setAssetCount(metadataProcessor.getAssetCount())
      
      setUploadState('processing')
      setUploadProgress(50)
      
      // Validate assets
      const validation = metadataProcessor.validateAssets()
      setValidationResults(validation)
      
      setUploadProgress(100)
      setUploadState(validation.valid ? 'complete' : 'error')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadState('error')
    }
  }

  const getStateColor = () => {
    switch (uploadState) {
      case 'complete': return 'text-degen-green'
      case 'error': return 'text-rug-red'
      case 'uploading':
      case 'processing': return 'text-fomo-gold'
      default: return 'text-gray-400'
    }
  }

  const getStateMessage = () => {
    switch (uploadState) {
      case 'uploading': return 'Uploading files...'
      case 'processing': return 'Processing metadata...'
      case 'complete': return 'Assets loaded successfully!'
      case 'error': return 'Upload failed!'
      default: return 'Ready to upload'
    }
  }

  return (
    <div className="min-h-screen bg-void text-degen-green font-terminal p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-degen-green mb-2">
            🦎 GECKO ADMIN PANEL 🦎
          </h1>
          <p className="text-gray-400 font-body">
            Upload your 5,000 Gecko assets and metadata
          </p>
        </div>

        {/* Upload Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Zip Upload */}
          <motion.div
            className="bg-gray-900 border border-degen-green rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold text-degen-green mb-4 flex items-center">
              <Upload className="mr-2" size={20} />
              Upload Zip File
            </h3>
            <p className="text-gray-400 text-sm mb-4 font-body">
              Upload a zip file containing all images and metadata JSON files
            </p>
            
            <input
              ref={zipFileRef}
              type="file"
              accept=".zip"
              onChange={handleZipUpload}
              className="hidden"
            />
            
            <motion.button
              onClick={() => zipFileRef.current?.click()}
              disabled={uploadState === 'uploading' || uploadState === 'processing'}
              className="w-full bg-degen-green text-black py-3 px-4 rounded-lg font-bold hover:bg-green-400 disabled:bg-gray-600 disabled:text-gray-400 transition-colors flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload size={20} />
              <span>Choose Zip File</span>
            </motion.button>
          </motion.div>

          {/* Metadata Upload */}
          <motion.div
            className="bg-gray-900 border border-solana-purple rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-bold text-solana-purple mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Upload Metadata Files
            </h3>
            <p className="text-gray-400 text-sm mb-4 font-body">
              Upload individual JSON metadata files (1.json, 2.json, etc.)
            </p>
            
            <input
              ref={metadataFileRef}
              type="file"
              accept=".json"
              multiple
              onChange={handleMetadataUpload}
              className="hidden"
            />
            
            <motion.button
              onClick={() => metadataFileRef.current?.click()}
              disabled={uploadState === 'uploading' || uploadState === 'processing'}
              className="w-full bg-solana-purple text-white py-3 px-4 rounded-lg font-bold hover:bg-purple-600 disabled:bg-gray-600 disabled:text-gray-400 transition-colors flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText size={20} />
              <span>Choose JSON Files</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Status */}
        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Upload Status</h3>
            <span className={`font-bold ${getStateColor()}`}>
              {getStateMessage()}
            </span>
          </div>
          
          {(uploadState === 'uploading' || uploadState === 'processing') && (
            <div className="mb-4">
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-degen-green"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-center mt-2 text-sm text-gray-400">
                {uploadProgress}% complete
              </div>
            </div>
          )}

          {assetCount > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-degen-green">{assetCount}</div>
                <div className="text-xs text-gray-400">Assets Loaded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-solana-purple">5,000</div>
                <div className="text-xs text-gray-400">Target Count</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-fomo-gold">0.0169</div>
                <div className="text-xs text-gray-400">SOL Price</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cope-blue">500</div>
                <div className="text-xs text-gray-400">Lottery Interval</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Validation Results */}
        {validationResults && (
          <motion.div
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              {validationResults.valid ? (
                <CheckCircle className="mr-2 text-degen-green" size={20} />
              ) : (
                <AlertTriangle className="mr-2 text-rug-red" size={20} />
              )}
              Validation Results
            </h3>
            
            {validationResults.valid ? (
              <div className="text-degen-green">
                ✅ All assets validated successfully! Ready to deploy.
              </div>
            ) : (
              <div>
                <div className="text-rug-red mb-2">❌ Validation failed:</div>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  {validationResults.errors.map((error: string, index: number) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            className="bg-rug-red/20 border border-rug-red rounded-lg p-4 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center">
              <AlertTriangle className="mr-2 text-rug-red" size={20} />
              <span className="text-rug-red font-bold">Error: {error}</span>
            </div>
          </motion.div>
        )}

        {/* Deploy Button */}
        {uploadState === 'complete' && validationResults?.valid && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.button
              className="bg-degen-green text-black py-4 px-8 rounded-lg font-bold text-lg hover:bg-green-400 transition-colors flex items-center space-x-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckCircle size={24} />
              <span>DEPLOY TO MAINNET</span>
            </motion.button>
            <p className="text-gray-400 text-sm mt-2 font-body">
              Assets are ready for minting!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}