'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function GeckoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Real gecko data with actual images
  const geckoz = [
    { 
      id: 1337, 
      name: 'Gecko #1337', 
      image: '/geckoz/gecko-1337.png',
      rarity: 'Legendary', 
      traits: ['Elite Hacker', 'Code Wizard', 'NFT Genius'],
      description: "This gecko wrote the smart contract for your portfolio (it's in the red)"
    },
    { 
      id: 420, 
      name: 'Gecko #420', 
      image: '/geckoz/gecko-420.png',
      rarity: 'Epic', 
      traits: ['Chill Vibes', 'Diamond Hands', 'Moon Walker'],
      description: "The most relaxed gecko in the collection. Probably high on hopium."
    },
    { 
      id: 69, 
      name: 'Gecko #69', 
      image: '/geckoz/gecko-69.png',
      rarity: 'Rare', 
      traits: ['Nice', 'Meme Lord', 'Culture Icon'],
      description: "Nice. This gecko gets it. Peak internet culture appreciation."
    },
    { 
      id: 1776, 
      name: 'Gecko #1776', 
      image: '/geckoz/gecko-1776.png',
      rarity: 'Patriotic', 
      traits: ['Freedom Lover', 'Revolution', 'Independence'],
      description: "This gecko declared independence from traditional finance. Very American."
    },
    { 
      id: 1, 
      name: 'Gecko #1', 
      image: '/geckoz/gecko-1.png',
      rarity: 'Genesis', 
      traits: ['OG', 'First', 'Alpha'],
      description: "The original gecko. Started this whole mess. You're welcome."
    },
    { 
      id: 721, 
      name: 'Gecko #721', 
      image: '/geckoz/gecko-721.png',
      rarity: 'Uncommon', 
      traits: ['Standard Issue', 'Regular Joe', 'Average'],
      description: "Just a regular gecko doing gecko things. Probably you IRL."
    },
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % geckoz.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + geckoz.length) % geckoz.length)
  }

  useEffect(() => {
    // Auto-advance carousel
    const timer = setInterval(nextSlide, 4000)
    return () => clearInterval(timer)
  }, [])

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'text-yellow-500 border-yellow-500'
      case 'epic': return 'text-purple-500 border-purple-500'
      case 'mythic': return 'text-pink-500 border-pink-500'
      case 'genesis': return 'text-primary-500 border-primary-500'
      case 'patriotic': return 'text-red-500 border-red-500'
      case 'uncommon': return 'text-gray-500 border-gray-500'
      default: return 'text-blue-500 border-blue-500'
    }
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Your New Overpriced Friends
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Each gecko has unique traits, questionable life choices, and an inflated sense of self-worth. Just like NFT collectors.
          </p>
        </div>

        <div className="relative">
          {/* Main Carousel */}
          <div className="flex justify-center items-center">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow z-10"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            <div className="mx-8 w-full max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                  {/* Gecko Image */}
                  <div className="w-64 h-64 mx-auto mb-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl overflow-hidden">
                    <img 
                      src={geckoz[currentIndex].image} 
                      alt={geckoz[currentIndex].name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-8xl flex items-center justify-center h-full">🦎</span>';
                        }
                      }}
                    />
                  </div>

                  {/* Gecko Info */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {geckoz[currentIndex].name}
                  </h3>
                  
                  <div className={`inline-block px-3 py-1 rounded-full border-2 text-sm font-medium mb-4 ${getRarityColor(geckoz[currentIndex].rarity)}`}>
                    {geckoz[currentIndex].rarity}
                  </div>

                  {/* Traits */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Traits</h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        {geckoz[currentIndex].traits.map((trait, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Sassy Description */}
                    <p className="text-sm text-gray-600 italic">
                      {geckoz[currentIndex].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow z-10"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {geckoz.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">100+</div>
            <div className="text-sm text-gray-600">Unique Traits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-500">5</div>
            <div className="text-sm text-gray-600">Rarity Levels</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gecko-green">2,222</div>
            <div className="text-sm text-gray-600">Total Geckoz</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">∞</div>
            <div className="text-sm text-gray-600">Possibilities</div>
          </div>
        </div>
      </div>
    </section>
  )
}