'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Twitter, MessageCircle } from 'lucide-react'
import WalletButton from './WalletButton'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Mint', href: '#mint' },
    { label: 'Lottery', href: '#lottery' },
    { label: 'Collection', href: '#collection' },
    { label: 'Portfolio Tracker', href: '/dashboard' },
    { label: 'Fluid Playground', href: '/playground' },
    { label: 'Team', href: '#team' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <motion.div
              className="text-xl sm:text-2xl flex-shrink-0"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🦎
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                Geckoz
              </h1>
              <p className="text-xs text-primary-600 font-medium hidden sm:block">
                Greed is Good
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Social Icons */}
            <div className="flex items-center space-x-3">
              <a
                href="https://twitter.com/greedygeckoz"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-primary-500 transition-colors rounded-full hover:bg-primary-50"
                title="Follow @greedygeckoz"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/+TjyUbcWEorNlNDcx"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-primary-500 transition-colors rounded-full hover:bg-primary-50"
                title="Join Telegram"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
            
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2 flex-shrink-0">
            <div className="scale-90">
              <WalletButton />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 border-t border-gray-200"
          >
            <nav className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
              
              {/* Mobile Social Links */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <a
                  href="https://twitter.com/greedygeckoz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </a>
                <a
                  href="https://t.me/+TjyUbcWEorNlNDcx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Telegram</span>
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}
