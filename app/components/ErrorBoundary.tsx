'use client'

import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo)
    
    // Log error details for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })

    this.setState({
      hasError: true,
      error,
      errorInfo: errorInfo.componentStack
    })

    // In production, send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, { extra: errorInfo })
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Something went wrong!
            </h2>
            <p className="text-white/80 mb-6">
              The gambling system encountered an unexpected error. Don't worry - no funds were lost.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 bg-black/50 p-3 rounded">
                <summary className="cursor-pointer text-yellow-400 font-medium mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-300 whitespace-pre-wrap break-words">
                  {this.state.error.message}
                  {this.state.errorInfo && (
                    <>
                      {'\n\nComponent Stack:'}
                      {this.state.errorInfo}
                    </>
                  )}
                </pre>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined })
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🔄 Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                🔃 Reload Page
              </button>
            </div>
            
            <p className="text-xs text-white/60 mt-4">
              If this problem persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Specific error boundary for gambling components
export function GamblingErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100]">
          <div className="max-w-sm w-full bg-red-900/30 border-2 border-red-500/50 rounded-xl p-6 mx-4">
            <div className="text-center">
              <div className="text-4xl mb-3">🎰💥</div>
              <h3 className="text-xl font-bold text-red-400 mb-3">
                Gambling System Error
              </h3>
              <p className="text-white/80 text-sm mb-4">
                The coin flip system encountered an error. Your payment is safe.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                🔄 Restart Gambling
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary