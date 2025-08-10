import fs from 'fs'
import FormData from 'form-data'
import axios from 'axios'

export interface PinataUploadResult {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

export interface PinataMetadata {
  name?: string
  keyvalues?: Record<string, string>
}

export interface BatchUploadOptions {
  concurrent?: number
  onProgress?: (completed: number, total: number, current: string) => void
  onError?: (error: Error, filePath: string) => void
}

export interface PinataUploader {
  testAuthentication(): Promise<boolean>
  uploadFile(filePath: string, metadata?: PinataMetadata): Promise<PinataUploadResult>
  uploadMetadata(metadata: any, fileName: string): Promise<PinataUploadResult>
  uploadBatch(filePaths: string[], options?: BatchUploadOptions): Promise<Map<string, PinataUploadResult>>
}

class PinataUploaderImpl implements PinataUploader {
  private apiKey: string
  private secretKey: string
  private baseURL = 'https://api.pinata.cloud'

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey
    this.secretKey = secretKey
  }

  private getHeaders() {
    return {
      'pinata_api_key': this.apiKey,
      'pinata_secret_api_key': this.secretKey
    }
  }

  async testAuthentication(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseURL}/data/testAuthentication`,
        { headers: this.getHeaders() }
      )
      return response.status === 200
    } catch (error) {
      console.error('Authentication test failed:', error)
      return false
    }
  }

  async uploadFile(filePath: string, metadata?: PinataMetadata): Promise<PinataUploadResult> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(filePath))

    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify(metadata))
    }

    // Set Pinata options for better organization
    const pinataOptions = {
      cidVersion: 1
    }
    formData.append('pinataOptions', JSON.stringify(pinataOptions))

    try {
      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      )

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Upload failed: ${error.response?.data?.error || error.message}`)
      }
      throw error
    }
  }

  async uploadMetadata(metadata: any, fileName: string): Promise<PinataUploadResult> {
    const pinataOptions = {
      cidVersion: 1
    }

    const pinataMetadata = {
      name: fileName
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/pinning/pinJSONToIPFS`,
        metadata,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json'
          },
          params: {
            pinataOptions: JSON.stringify(pinataOptions),
            pinataMetadata: JSON.stringify(pinataMetadata)
          }
        }
      )

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Metadata upload failed: ${error.response?.data?.error || error.message}`)
      }
      throw error
    }
  }

  async uploadBatch(filePaths: string[], options: BatchUploadOptions = {}): Promise<Map<string, PinataUploadResult>> {
    const { concurrent = 3, onProgress, onError } = options
    const results = new Map<string, PinataUploadResult>()
    const errors: Array<{ filePath: string, error: Error }> = []
    
    let completed = 0
    const total = filePaths.length

    // Process files in batches
    const processBatch = async (batch: string[]) => {
      const promises = batch.map(async (filePath) => {
        try {
          const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'unknown'
          const result = await this.uploadFile(filePath, {
            name: `Greedy Gecko - ${fileName}`,
            keyvalues: {
              collection: 'GreedyGeckoz',
              type: 'image'
            }
          })
          
          results.set(filePath, result)
          completed++
          
          if (onProgress) {
            onProgress(completed, total, filePath)
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Upload failed')
          errors.push({ filePath, error: err })
          
          if (onError) {
            onError(err, filePath)
          }
          
          completed++
          if (onProgress) {
            onProgress(completed, total, filePath)
          }
        }
      })

      await Promise.all(promises)
    }

    // Split files into batches
    for (let i = 0; i < filePaths.length; i += concurrent) {
      const batch = filePaths.slice(i, i + concurrent)
      await processBatch(batch)
      
      // Small delay to avoid rate limits
      if (i + concurrent < filePaths.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return results
  }
}

export function createPinataUploader(apiKey: string, secretKey: string): PinataUploader {
  return new PinataUploaderImpl(apiKey, secretKey)
}