'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle, Flame, TrendingUp, TrendingDown } from 'lucide-react'

interface Message {
  id: number
  user: string
  message: string
  timestamp: Date
  reactions: { emoji: string; count: number }[]
  type: 'message' | 'mint' | 'sale' | 'system'
}

export default function CommunityChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock messages for demo
  const mockMessages: Message[] = [
    {
      id: 1,
      user: 'DegenKing420',
      message: 'floor is lava rn 🔥',
      timestamp: new Date(Date.now() - 300000),
      reactions: [{ emoji: '🔥', count: 3 }, { emoji: '💀', count: 1 }],
      type: 'message'
    },
    {
      id: 2,
      user: 'SYSTEM',
      message: 'PaperHandsPete just panic sold Gecko #1337 for 0.42 SOL',
      timestamp: new Date(Date.now() - 240000),
      reactions: [{ emoji: '😂', count: 5 }, { emoji: '📉', count: 2 }],
      type: 'sale'
    },
    {
      id: 3,
      user: 'DiamondHandsDave',
      message: 'BOUGHT THE DIP AGAIN 💎🙌',
      timestamp: new Date(Date.now() - 180000),
      reactions: [{ emoji: '💎', count: 7 }, { emoji: '🚀', count: 3 }],
      type: 'message'
    },
    {
      id: 4,
      user: 'CryptoClown',
      message: 'anyone else broke or just me? 🤡',
      timestamp: new Date(Date.now() - 120000),
      reactions: [{ emoji: '🤡', count: 12 }, { emoji: '💔', count: 4 }],
      type: 'message'
    },
    {
      id: 5,
      user: 'SYSTEM',
      message: 'NgmiNoob minted Gecko #2841 - Welcome to the degen family!',
      timestamp: new Date(Date.now() - 60000),
      reactions: [{ emoji: '🎉', count: 8 }, { emoji: '🦎', count: 5 }],
      type: 'mint'
    }
  ]

  useEffect(() => {
    setMessages(mockMessages)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate new messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        const newMsg: Message = {
          id: Date.now(),
          user: ['DegenApe', 'CopeMaster', 'RektRanger', 'NgmiNinja'][Math.floor(Math.random() * 4)],
          message: [
            'wen moon? 🌙',
            'this is fine 🔥',
            'diamond hands activated 💎',
            'ngmi but still buying 🤷‍♂️',
            'floor price prediction: 0 or 100 SOL',
            'just minted my rent money 🏠'
          ][Math.floor(Math.random() * 6)],
          timestamp: new Date(),
          reactions: [],
          type: 'message'
        }
        setMessages(prev => [...prev.slice(-4), newMsg])
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now(),
      user: 'You',
      message: newMessage,
      timestamp: new Date(),
      reactions: [],
      type: 'message'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const addReaction = (messageId: number, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji)
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions.map(r => 
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            )
          }
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1 }]
          }
        }
      }
      return msg
    }))
  }

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'mint':
        return 'border-l-4 border-degen-green bg-degen-green/10'
      case 'sale':
        return 'border-l-4 border-rug-red bg-rug-red/10'
      case 'system':
        return 'border-l-4 border-fomo-gold bg-fomo-gold/10'
      default:
        return 'border-l-4 border-gray-600 bg-gray-800/30'
    }
  }

  return (
    <motion.div
      className="bg-void border border-degen-green rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="bg-gray-900 border-b border-degen-green p-4">
        <h4 className="text-xl font-bold text-degen-green flex items-center">
          <MessageCircle className="mr-2" size={20} />
          COPE CAVE
          <span className="ml-2 text-xs bg-rug-red text-white px-2 py-1 rounded-full">
            LIVE
          </span>
        </h4>
        <p className="text-xs text-gray-400 font-body">
          Where degenerates gather to cry together • 1,337 online
        </p>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`p-3 rounded-lg ${getMessageStyle(message.type)}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-bold text-sm ${
                      message.user === 'SYSTEM' ? 'text-fomo-gold' :
                      message.user === 'You' ? 'text-degen-green' : 'text-white'
                    }`}>
                      {message.user}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-white text-sm font-body">{message.message}</p>
                  
                  {/* Reactions */}
                  {message.reactions.length > 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                      {message.reactions.map((reaction, index) => (
                        <button
                          key={index}
                          onClick={() => addReaction(message.id, reaction.emoji)}
                          className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-full text-xs transition-colors"
                        >
                          {reaction.emoji} {reaction.count}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Quick Reactions */}
                <div className="flex space-x-1 ml-2">
                  {['🔥', '💀', '💎', '🤡'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(message.id, emoji)}
                      className="hover:bg-gray-700 p-1 rounded text-xs transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-degen-green p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Share your suffering with the community..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-degen-green font-body"
          />
          <motion.button
            onClick={sendMessage}
            className="bg-degen-green text-black px-4 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} />
          </motion.button>
        </div>
        <div className="text-xs text-gray-500 mt-2 font-body">
          Tip: Use 🔥💀💎🤡 for quick reactions • Be nice or get rekt
        </div>
      </div>
    </motion.div>
  )
}