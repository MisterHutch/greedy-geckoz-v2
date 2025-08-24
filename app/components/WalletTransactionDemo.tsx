'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, ArrowRight, CheckCircle, Coins } from 'lucide-react'

interface WalletTransactionDemoProps {
  show: boolean
  transactionData?: {
    geckoId: number
    solReceived?: number
    nftMintAddress?: string
    txHash: string
    lotteryWon: boolean
    totalGeckoz?: number
  }
  onComplete: () => void
}

export default function WalletTransactionDemo({ show, transactionData, onComplete }: WalletTransactionDemoProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const steps = [
    { id: 'processing', title: 'Processing Transaction', duration: 1500 },
    { id: 'transferring', title: 'Transferring Assets', duration: 2000 },
    { id: 'complete', title: 'Assets Delivered!', duration: 2500 }
  ]

  useEffect(() => {
    if (!show) {
      setCurrentStep(0)
      setIsAnimating(false)
      return
    }

    setIsAnimating(true)
    let stepIndex = 0

    const advanceStep = () => {
      if (stepIndex < steps.length - 1) {
        stepIndex++
        setCurrentStep(stepIndex)
        setTimeout(advanceStep, steps[stepIndex].duration)
      } else {
        setTimeout(() => {
          setIsAnimating(false)
          onComplete()
        }, 1000)
      }
    }

    setTimeout(advanceStep, steps[0].duration)
  }, [show])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl p-8 max-w-lg w-full border-2 border-primary-500 shadow-2xl relative overflow-hidden"
          initial={{ scale: 0.5, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          exit={{ scale: 0.5, rotateY: 180 }}
          transition={{ type: "spring", damping: 15 }}
        >
          {/* Background Animation */}
          <div className="absolute inset-0 opacity-20">
            <motion.div 
              className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl"
              animate={{ 
                x: [0, 100, 0], 
                y: [0, 50, 0],
                scale: [1, 1.5, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl"
              animate={{ 
                x: [0, -100, 0], 
                y: [0, -50, 0],
                scale: [1, 1.5, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            />
          </div>

          {/* Header */}
          <div className="relative z-10 text-center mb-8">
            <motion.h2 
              className="text-3xl font-bold text-white mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🦎 Wallet Transaction Demo
            </motion.h2>
            <p className="text-white/80 text-sm">
              Watch your assets flow directly into your wallet
            </p>
          </div>

          {/* Transaction Flow Visualization */}
          <div className="relative z-10 space-y-6">
            {/* Step Progress */}
            <div className="flex justify-between items-center mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <motion.div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      index <= currentStep 
                        ? 'bg-primary-500 border-primary-400 text-white' 
                        : 'border-white/30 text-white/50'
                    }`}
                    animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: index === currentStep ? Infinity : 0 }}
                  >
                    {index < currentStep ? '✓' : index + 1}
                  </motion.div>
                  <span className={`text-xs mt-1 ${index <= currentStep ? 'text-white' : 'text-white/50'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Visual Transaction Flow */}
            <div className="flex items-center justify-between p-6 bg-black/40 rounded-xl border border-primary-500/30">
              {/* Source (Protocol) */}
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2"
                  animate={currentStep >= 1 ? { scale: [1, 0.8, 1] } : {}}
                  transition={{ duration: 1, repeat: currentStep >= 1 ? Infinity : 0 }}
                >
                  🏛️
                </motion.div>
                <span className="text-white/80 text-xs">Gecko Protocol</span>
              </div>

              {/* Arrow with Assets */}
              <div className="flex-1 flex items-center justify-center relative">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={currentStep >= 1 ? { x: [0, 20, 0] } : {}}
                  transition={{ duration: 1.5, repeat: currentStep >= 1 ? Infinity : 0 }}
                >
                  <ArrowRight className="text-primary-400 w-8 h-8" />
                </motion.div>
                
                {/* Floating Assets */}
                <AnimatePresence>
                  {currentStep >= 1 && (
                    <motion.div className="flex space-x-2">
                      {/* NFT */}
                      <motion.div
                        className="flex flex-col items-center"
                        initial={{ opacity: 0, scale: 0, x: -100 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded border-2 border-white flex items-center justify-center">
                          🦎
                        </div>
                        <span className="text-xs text-white mt-1">NFT</span>
                      </motion.div>

                      {/* SOL (if lottery won) */}
                      {transactionData?.lotteryWon && (
                        <motion.div
                          className="flex flex-col items-center"
                          initial={{ opacity: 0, scale: 0, x: -100 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ delay: 1, type: "spring" }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Coins className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs text-white mt-1">{transactionData.solReceived} SOL</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Destination (User Wallet) */}
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-2"
                  animate={currentStep >= 2 ? { 
                    scale: [1, 1.2, 1],
                    boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.7)', '0 0 0 10px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                  } : {}}
                  transition={{ duration: 1.5, repeat: currentStep >= 2 ? Infinity : 0 }}
                >
                  <Wallet className="w-8 h-8 text-white" />
                </motion.div>
                <span className="text-white/80 text-xs">Your Wallet</span>
              </div>
            </div>

            {/* Transaction Details */}
            {transactionData && currentStep >= 2 && (
              <motion.div
                className="bg-green-900/40 border border-green-500/50 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-bold">Assets Successfully Delivered!</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Gecko NFT:</span>
                    <span className="text-white font-bold">#{transactionData.geckoId}</span>
                  </div>
                  
                  {transactionData.lotteryWon && transactionData.solReceived && (
                    <div className="flex justify-between">
                      <span className="text-white/70">SOL Prize:</span>
                      <span className="text-yellow-400 font-bold">+{transactionData.solReceived} SOL</span>
                    </div>
                  )}
                  
                  {transactionData.totalGeckoz && transactionData.totalGeckoz > 1 && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Total Geckoz:</span>
                      <span className="text-white font-bold">{transactionData.totalGeckoz}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-white/20">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Transaction:</span>
                      <span className="text-primary-400 font-mono">
                        {transactionData.txHash.slice(0, 8)}...{transactionData.txHash.slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Status Message */}
            <div className="text-center">
              <motion.p 
                className="text-white/80 text-sm"
                key={currentStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {currentStep === 0 && "🔄 Confirming transaction on blockchain..."}
                {currentStep === 1 && "📦 Packaging and transferring your assets..."}
                {currentStep === 2 && "🎉 Your assets are now in your wallet!"}
              </motion.p>
              
              {currentStep === 2 && (
                <motion.p
                  className="text-primary-400 text-xs mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Check your wallet to see your new gecko{transactionData?.lotteryWon ? ' and SOL prize' : ''}! 🦎
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}