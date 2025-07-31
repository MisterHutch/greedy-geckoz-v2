'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Users, MessageSquare } from 'lucide-react'

export default function SocialFeed() {
  const [twitterFollowers, setTwitterFollowers] = useState(2420)
  const [telegramMembers, setTelegramMembers] = useState(1337)

  // Simulate follower count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTwitterFollowers(prev => prev + Math.floor(Math.random() * 3))
      setTelegramMembers(prev => prev + Math.floor(Math.random() * 2))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const socialStats = [
    {
      platform: 'Twitter',
      handle: '@greedygeckoz',
      followers: twitterFollowers,
      link: 'https://twitter.com/greedygeckoz',
      icon: '🐦',
      color: 'bg-blue-500',
      description: 'Daily alpha & degen wisdom'
    },
    {
      platform: 'Telegram',
      handle: 'Gecko Gang',
      followers: telegramMembers,
      link: 'https://t.me/+TjyUbcWEorNlNDcx',
      icon: '📱',
      color: 'bg-blue-400',
      description: 'Real-time cope sessions'
    }
  ]

  const recentTweets = [
    {
      content: "Floor price update: Still going down 📉 But hey, at least we're consistent! 🦎",
      time: '2h ago',
      likes: 69,
      retweets: 42
    },
    {
      content: "New holder spotted! Welcome to the gecko family @DegenApe420 🎉 May your bags be heavy and your losses legendary",
      time: '4h ago',
      likes: 127,
      retweets: 31
    },
    {
      content: "Daily reminder: We're not just an NFT project, we're a support group for crypto trauma 🤝",
      time: '6h ago',
      likes: 203,
      retweets: 88
    }
  ]

  return (
    <div className="space-y-6">
      {/* Social Stats */}
      <div className="grid grid-cols-2 gap-4">
        {socialStats.map((social, index) => (
          <motion.a
            key={social.platform}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-void border border-degen-green rounded-lg p-4 hover:border-solana-purple transition-colors group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{social.icon}</span>
                <span className="font-bold text-white text-sm">{social.platform}</span>
              </div>
              <ExternalLink size={14} className="text-gray-400 group-hover:text-degen-green transition-colors" />
            </div>
            <div className="text-xs text-gray-400 mb-1">{social.handle}</div>
            <div className="flex items-center space-x-2">
              <Users size={14} className="text-degen-green" />
              <span className="font-bold text-degen-green">{social.followers.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{social.description}</div>
          </motion.a>
        ))}
      </div>

      {/* Recent Twitter Activity */}
      <motion.div
        className="bg-void border border-degen-green rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="font-bold text-degen-green mb-3 flex items-center">
          <MessageSquare size={16} className="mr-2" />
          LATEST TWEETS
        </h4>
        <div className="space-y-3">
          {recentTweets.map((tweet, index) => (
            <motion.div
              key={index}
              className="border-b border-gray-800 pb-3 last:border-b-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <p className="text-white text-sm font-body mb-2">{tweet.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{tweet.time}</span>
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <span>❤️</span>
                    <span>{tweet.likes}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>🔄</span>
                    <span>{tweet.retweets}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.a
          href="https://twitter.com/greedygeckoz"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-4 text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold text-sm transition-colors"
          whileHover={{ scale: 1.02 }}
        >
          Follow for More Alpha 🐦
        </motion.a>
      </motion.div>

      {/* Telegram CTA */}
      <motion.div
        className="bg-void border border-degen-green rounded-lg p-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-2xl mb-2">📱</div>
        <h4 className="font-bold text-degen-green mb-2">JOIN THE COPE CAVE</h4>
        <p className="text-gray-400 text-sm font-body mb-3">
          Real-time market reactions, group therapy sessions, and premium copium distribution
        </p>
        <motion.a
          href="https://t.me/+TjyUbcWEorNlNDcx"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors inline-block"
          whileHover={{ scale: 1.05 }}
        >
          Join Telegram Group
        </motion.a>
      </motion.div>
    </div>
  )
}