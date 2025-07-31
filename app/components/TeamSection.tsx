'use client'

import { motion } from 'framer-motion'
import { Twitter, MessageCircle, Briefcase } from 'lucide-react'

export default function TeamSection() {
  const team = [
    {
      name: 'Alpha Gecko',
      role: 'Founder & CEO',
      description: 'Serial entrepreneur who turned pocket change into a gecko empire. Believes greed can change the world.',
      traits: ['Visionary', 'Risk Taker', 'Community Builder'],
      socials: { twitter: '@alphagecko', telegram: 'alphagecko' }
    },
    {
      name: 'Beta Gecko',
      role: 'CTO & Dev',
      description: 'Code wizard who builds while others sleep. Makes magic happen behind the scenes.',
      traits: ['Builder', 'Innovator', 'Problem Solver'],
      socials: { twitter: '@betagecko', telegram: 'betagecko' }
    },
    {
      name: 'Sigma Gecko',
      role: 'Community Lead',
      description: 'The voice of the geckos. Keeps the community hyped and handles all the chaos.',
      traits: ['Communicator', 'Hype Master', 'Community First'],
      socials: { twitter: '@sigmagecko', telegram: 'sigmagecko' }
    }
  ]

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet the Gecko Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The entrepreneurial geckos building the future of digital collecting. 
            Each team member brings unique skills and gecko wisdom to the project.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="card hover:shadow-xl transition-shadow duration-300"
            >
              {/* Gecko Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🦎</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-primary-600 font-medium">{member.role}</p>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {member.description}
              </p>

              {/* Traits */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Core Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {member.traits.map((trait, traitIndex) => (
                    <span
                      key={traitIndex}
                      className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex justify-center space-x-4">
                <a 
                  href={`https://twitter.com/${member.socials.twitter.replace('@', '')}`}
                  className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href={`https://t.me/${member.socials.telegram}`}
                  className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card bg-gradient-to-r from-primary-50 to-accent-50 text-center"
        >
          <Briefcase className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            "To build the most entrepreneurial and community-driven gecko collection on Solana. 
            We believe that when greedy geckos work together, everyone wins. Our lottery system, 
            active community, and innovative approach make collecting geckos both fun and rewarding."
          </p>
          <div className="mt-6 flex justify-center space-x-8 text-sm">
            <div>
              <div className="font-bold text-primary-600">Community First</div>
              <div className="text-gray-600">Always listening</div>
            </div>
            <div>
              <div className="font-bold text-accent-500">Innovation</div>
              <div className="text-gray-600">Never stopping</div>
            </div>
            <div>
              <div className="font-bold text-gecko-green">Transparency</div>
              <div className="text-gray-600">Always honest</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}