// Comprehensive Logging System for Greedy Geckoz
// Tracks mint failures, wallet issues, and deployment state

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  category: 'mint' | 'wallet' | 'deployment' | 'api' | 'ui' | 'system'
  message: string
  details?: any
  userId?: string
  walletAddress?: string
  sessionId: string
  buildId?: string
  environment: 'production' | 'development' | 'preview'
  userAgent?: string
  network?: string
}

interface MintFailureDetails {
  [key: string]: any
  step: 'wallet_connect' | 'balance_check' | 'payment_tx' | 'nft_generation' | 'nft_mint' | 'confirmation'
  errorCode?: string
  errorMessage: string
  stackTrace?: string
  walletType?: string
  networkEndpoint?: string
  transactionHash?: string
  solBalance?: number
  mintQuantity?: number
  attemptNumber?: number
  // Correlation and telemetry fields
  attemptId?: string
  timeElapsed?: number
  timestamp?: string
  sessionId?: string
  environment?: 'production' | 'development' | 'preview'
}

interface WalletIssueDetails {
  issueType: 'connection_failed' | 'signing_rejected' | 'insufficient_funds' | 'network_error' | 'timeout'
  walletType: string
  errorDetails: any
  networkStatus?: 'online' | 'offline' | 'slow'
  rpcEndpoint?: string
  retryCount?: number
}

class Logger {
  private sessionId: string
  private environment: 'production' | 'development' | 'preview'
  private buildId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.environment = this.detectEnvironment()
    this.buildId = process.env.NEXT_PUBLIC_BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA
    
    // Initialize session logging
    this.logInfo('system', 'Logger initialized', {
      sessionId: this.sessionId,
      environment: this.environment,
      buildId: this.buildId,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      timestamp: new Date().toISOString()
    })
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private detectEnvironment(): 'production' | 'development' | 'preview' {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.includes('vercel.app') && !hostname.includes('preview')) return 'production'
      if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development'
      return 'preview'
    }
    return process.env.NODE_ENV === 'production' ? 'production' : 'development'
  }

  private async sendToLoggingService(entry: LogEntry) {
    try {
      // Send to multiple endpoints for redundancy
      const endpoints = [
        '/api/logs', // Internal API endpoint
        'https://logs.greedygeckoz.com/ingest' // External logging service (if available)
      ]

      const promises = endpoints.map(endpoint => 
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        }).catch(err => console.warn(`Failed to send to ${endpoint}:`, err))
      )

      await Promise.allSettled(promises)

      // Also store locally for offline analysis
      this.storeLocalLog(entry)
      
    } catch (error) {
      console.error('Logging service failed:', error)
      this.storeLocalLog(entry) // Fallback to local storage
    }
  }

  private storeLocalLog(entry: LogEntry) {
    try {
      if (typeof window !== 'undefined') {
        const logs = JSON.parse(localStorage.getItem('geckoz_logs') || '[]')
        logs.push(entry)
        
        // Keep only last 1000 entries to prevent storage bloat
        if (logs.length > 1000) {
          logs.splice(0, logs.length - 1000)
        }
        
        localStorage.setItem('geckoz_logs', JSON.stringify(logs))
      }
    } catch (error) {
      console.error('Failed to store local log:', error)
    }
  }

  private createLogEntry(
    level: LogEntry['level'],
    category: LogEntry['category'],
    message: string,
    details?: any,
    userId?: string,
    walletAddress?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      userId,
      walletAddress,
      sessionId: this.sessionId,
      buildId: this.buildId,
      environment: this.environment,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      network: process.env.NEXT_PUBLIC_NETWORK || 'mainnet-beta'
    }
  }

  // General logging methods
  logInfo(category: LogEntry['category'], message: string, details?: any, userId?: string, walletAddress?: string) {
    const entry = this.createLogEntry('info', category, message, details, userId, walletAddress)
    console.log(`[${category.toUpperCase()}] ${message}`, details)
    this.sendToLoggingService(entry)
  }

  logWarn(category: LogEntry['category'], message: string, details?: any, userId?: string, walletAddress?: string) {
    const entry = this.createLogEntry('warn', category, message, details, userId, walletAddress)
    console.warn(`[${category.toUpperCase()}] ${message}`, details)
    this.sendToLoggingService(entry)
  }

  logError(category: LogEntry['category'], message: string, details?: any, userId?: string, walletAddress?: string) {
    const entry = this.createLogEntry('error', category, message, details, userId, walletAddress)
    console.error(`[${category.toUpperCase()}] ${message}`, details)
    this.sendToLoggingService(entry)
  }

  logDebug(category: LogEntry['category'], message: string, details?: any, userId?: string, walletAddress?: string) {
    const entry = this.createLogEntry('debug', category, message, details, userId, walletAddress)
    if (this.environment === 'development') {
      console.debug(`[${category.toUpperCase()}] ${message}`, details)
    }
    this.sendToLoggingService(entry)
  }

  // Specialized mint failure logging
  logMintFailure(
    step: MintFailureDetails['step'],
    errorMessage: string,
    details: Partial<MintFailureDetails> = {},
    walletAddress?: string,
    userId?: string
  ) {
    const mintDetails: MintFailureDetails = {
      step,
      errorMessage,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      sessionId: this.sessionId,
      ...details
    }

    this.logError('mint', `Mint failed at ${step}: ${errorMessage}`, mintDetails, userId, walletAddress)

    // Additional context logging
    this.logInfo('mint', 'Mint failure context', {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : undefined,
      connectionType: typeof navigator !== 'undefined' && 'connection' in navigator ? 
        (navigator as any).connection?.effectiveType : undefined
    }, userId, walletAddress)
  }

  // Specialized wallet issue logging
  logWalletIssue(
    issueType: WalletIssueDetails['issueType'],
    walletType: string,
    errorDetails: any,
    additionalDetails: Partial<WalletIssueDetails> = {},
    walletAddress?: string,
    userId?: string
  ) {
    const walletIssueDetails: WalletIssueDetails = {
      issueType,
      walletType,
      errorDetails,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      ...additionalDetails
    }

    this.logError('wallet', `Wallet issue (${walletType}): ${issueType}`, walletIssueDetails, userId, walletAddress)
  }

  // Deployment and performance logging
  logDeployment(status: 'started' | 'completed' | 'failed', details: any = {}) {
    this.logInfo('deployment', `Deployment ${status}`, {
      buildId: this.buildId,
      environment: this.environment,
      timestamp: new Date().toISOString(),
      ...details
    })
  }

  logPerformanceMetric(metric: string, value: number, unit: string = 'ms', details?: any) {
    this.logInfo('ui', `Performance: ${metric}`, {
      metric,
      value,
      unit,
      timestamp: new Date().toISOString(),
      ...details
    })
  }

  // Transaction state tracking
  logTransactionState(
    transactionHash: string,
    state: 'initiated' | 'signed' | 'submitted' | 'confirmed' | 'failed',
    details: any = {},
    walletAddress?: string,
    userId?: string
  ) {
    this.logInfo('mint', `Transaction ${state}: ${transactionHash}`, {
      transactionHash,
      state,
      network: process.env.NEXT_PUBLIC_NETWORK,
      rpcEndpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
      timestamp: new Date().toISOString(),
      ...details
    }, userId, walletAddress)
  }

  // Get logs for analysis
  async getLogs(filters?: {
    level?: LogEntry['level']
    category?: LogEntry['category']
    fromDate?: string
    toDate?: string
    walletAddress?: string
    limit?: number
  }) {
    try {
      if (typeof window !== 'undefined') {
        const logs: LogEntry[] = JSON.parse(localStorage.getItem('geckoz_logs') || '[]')
        
        let filteredLogs = logs
        
        if (filters) {
          if (filters.level) {
            filteredLogs = filteredLogs.filter(log => log.level === filters.level)
          }
          if (filters.category) {
            filteredLogs = filteredLogs.filter(log => log.category === filters.category)
          }
          if (filters.walletAddress) {
            filteredLogs = filteredLogs.filter(log => log.walletAddress === filters.walletAddress)
          }
          if (filters.fromDate) {
            filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.fromDate!)
          }
          if (filters.toDate) {
            filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.toDate!)
          }
        }
        
        // Sort by timestamp (newest first)
        filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        
        return filteredLogs.slice(0, filters?.limit || 100)
      }
      return []
    } catch (error) {
      console.error('Failed to retrieve logs:', error)
      return []
    }
  }

  // Export logs for analysis
  exportLogs() {
    try {
      if (typeof window !== 'undefined') {
        const logs = localStorage.getItem('geckoz_logs') || '[]'
        const blob = new Blob([logs], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `geckoz_logs_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        this.logInfo('system', 'Logs exported successfully')
      }
    } catch (error) {
      this.logError('system', 'Failed to export logs', { error: error.message })
    }
  }

  // Clear old logs
  clearLogs() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('geckoz_logs')
        this.logInfo('system', 'Logs cleared successfully')
      }
    } catch (error) {
      this.logError('system', 'Failed to clear logs', { error: error.message })
    }
  }
}

// Create singleton instance
export const logger = new Logger()

// Export types for use in other modules
export type { LogEntry, MintFailureDetails, WalletIssueDetails }
