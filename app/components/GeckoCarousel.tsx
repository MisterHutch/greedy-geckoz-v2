'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function GeckoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Mock gecko data - replace with real gecko images/metadata
  const geckos = [
    { id: 1, name: 'Gecko #1337', rarity: 'Legendary', traits: ['Golden', 'Entrepreneur', 'Diamond Hands'] },
    { id: 2, name: 'Gecko #420', rarity: 'Epic', traits: ['Green', 'Hustler', 'HODL Master'] },
    { id: 3, name: 'Gecko #69', rarity: 'Rare', traits: ['Blue', 'Trader', 'Moon Seeker'] },
    { id: 4, name: 'Gecko #2222', rarity: 'Mythic', traits: ['Rainbow', 'Legend', 'Ultimate Greed'] },
    { id: 5, name: 'Gecko #1', rarity: 'Genesis', traits: ['Original', 'Founder', 'Alpha'] },
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % geckos.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + geckos.length) % geckos.length)
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
      default: return 'text-blue-500 border-blue-500'
    }
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet the Geckoz
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Each gecko is uniquely generated with different traits, rarities, and entrepreneurial spirit levels.
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
                  {/* Gecko Placeholder */}
                  <div className="w-64 h-64 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center">
                    <span className="text-8xl">🦎</span>
                  </div>

                  {/* Gecko Info */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {geckos[currentIndex].name}
                  </h3>
                  
                  <div className={`inline-block px-3 py-1 rounded-full border-2 text-sm font-medium mb-4 ${getRarityColor(geckos[currentIndex].rarity)}`}>
                    {geckos[currentIndex].rarity}
                  </div>

                  {/* Traits */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Traits</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {geckos[currentIndex].traits.map((trait, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
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
            {geckos.map((_, index) => (
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