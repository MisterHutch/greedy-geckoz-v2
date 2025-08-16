'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface GeckoNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface GeckoNotificationProps {
  notifications: GeckoNotification[]
  onDismiss: (id: string) => void
}

const SARCASTIC_MESSAGES = {
  insufficientFunds: [
    "Broke much? 💸 Maybe try the couch cushions for spare change?",
    "Your wallet's emptier than your trading strategy 📉",
    "Time to ask mom for lunch money? 🍼",
    "Even the geckos are laughing at your balance 🦎😂",
    "Sir, this is a Wendy's... wait, wrong broke person 🍟"
  ],
  walletNotConnected: [
    "Connect your wallet, genius 🧠 (if you have one)",
    "Wallet? What wallet? Connect it first! 👛",
    "The geckos can't find your money if you don't connect your wallet 🔍",
    "Step 1: Connect wallet. Step 2: Lose money. Simple! 📚"
  ],
  mintFailed: [
    "Failed harder than your portfolio 📈❌",
    "Even our smart contract thinks you're unlucky 🤖",
    "The blockchain rejected you... personally 💔",
    "Try again, or don't. We're not your financial advisor 🤷‍♂️"
  ],
  soldOut: [
    "Too slow! All geckos found better homes 🏠",
    "You snooze, you lose! Classic FOMO victim 😴",
    "Sold out faster than your last good investment 📊"
  ],
  success: [
    "Holy gecko! You actually did something right! 🦎✨",
    "Congratulations on your expensive JPEG! 🖼️💸",
    "You're now officially a degen! Welcome to the club 🎉",
    "Your parents would be so proud... or concerned 👨‍👩‍👧‍👦"
  ],
  lotteryWin: [
    "WAIT... YOU WON?! The geckos must be drunk! 🍺🦎",
    "Somebody call the newspaper! A miracle happened! 📰",
    "Your luck just peaked for the decade 📈🎰",
    "The gecko gods have blessed your broke soul! 🙏✨"
  ]
}

const getRandomMessage = (category: keyof typeof SARCASTIC_MESSAGES): string => {
  const messages = SARCASTIC_MESSAGES[category]
  return messages[Math.floor(Math.random() * messages.length)]
}

const getIcon = (type: GeckoNotification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-6 h-6" />
    case 'error':
      return <XCircle className="w-6 h-6" />
    case 'warning':
      return <AlertTriangle className="w-6 h-6" />
    case 'info':
      return <Info className="w-6 h-6" />
    default:
      return <Info className="w-6 h-6" />
  }
}

export default function GeckoNotification({ notifications, onDismiss }: GeckoNotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ x: 400, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 400, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className={`gecko-notification ${notification.type} max-w-sm`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 pt-1">
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="trippy-notification-text text-sm font-bold mb-1">
                  {notification.title}
                </h4>
                <p className="text-xs opacity-90 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              
              <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Gecko emoji animation */}
            <div className="absolute -bottom-1 -right-1 text-2xl animate-bounce">
              🦎
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for using the notification system
export const useGeckoNotifications = () => {
  const [notifications, setNotifications] = useState<GeckoNotification[]>([])

  const addNotification = (
    type: GeckoNotification['type'],
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification = { id, type, title, message, duration }
    
    setNotifications(prev => [...prev, notification])
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Sarcastic helper functions
  const showInsufficientFunds = (needed: number, current: number) => {
    addNotification(
      'error',
      "Wallet's Looking Lonely! 💸",
      `${getRandomMessage('insufficientFunds')} You need ${needed.toFixed(4)} SOL but only have ${current.toFixed(4)} SOL.`,
      7000
    )
  }

  const showWalletNotConnected = () => {
    addNotification(
      'warning',
      "Wallet MIA! 👻",
      getRandomMessage('walletNotConnected'),
      5000
    )
  }

  const showMintFailed = (error?: string) => {
    addNotification(
      'error',
      "Mint Fail Spectacular! 💥",
      `${getRandomMessage('mintFailed')} ${error ? `Error: ${error}` : ''}`,
      6000
    )
  }

  const showMintSuccess = (geckoId: number) => {
    addNotification(
      'success',
      "Mint Success! 🎉",
      `${getRandomMessage('success')} You got Gecko #${geckoId}!`,
      8000
    )
  }

  const showLotteryWin = (geckoCount: number, solAmount: number) => {
    addNotification(
      'success',
      "LOTTERY WINNER! 🏆",
      `${getRandomMessage('lotteryWin')} You won ${geckoCount} geckos + ${solAmount} SOL!`,
      12000
    )
  }

  const showSoldOut = () => {
    addNotification(
      'error',
      "Sold Out! 😭",
      getRandomMessage('soldOut'),
      5000
    )
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    showInsufficientFunds,
    showWalletNotConnected,
    showMintFailed,
    showMintSuccess,
    showLotteryWin,
    showSoldOut
  }
}