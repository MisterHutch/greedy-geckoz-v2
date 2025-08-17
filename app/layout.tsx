import type { Metadata } from 'next'
import { JetBrains_Mono, Inter } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-terminal',
  weight: ['400', '700']
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Geckoz - Degen Paradise | Where Lambos Go to Die',
  description: 'The ultimate Solana NFT community for degenerates. Join 3,500 Geckoz holders in the cope cave. Mint your mistakes, embrace the chaos.',
  keywords: ['Solana', 'NFT', 'Degen', 'Crypto', 'Geckoz', 'Community', 'Memes'],
  authors: [{ name: 'Geckoz Team' }],
  openGraph: {
    title: 'Geckoz - Degen Paradise',
    description: 'Where degenerates gather to lose money together. 3,500 unique Geckoz on Solana.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Geckoz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geckoz - Degen Paradise',
    description: 'Where lambos go to die. Join the cope cave.',
    creator: '@GreedyGeckoz',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

import WalletContextProvider from './components/WalletProvider'
import { Analytics } from '@vercel/analytics/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#00ff88" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body bg-gray-50 text-gray-900 antialiased min-h-screen">
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
        <Analytics />
        
        {/* Console Easter Egg */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('%c🦎 GREEDY GECKOZ DETECTED 🦎', 'color: #00ff88; font-size: 20px; font-weight: bold;');
              console.log('%cWelcome to the degen paradise!', 'color: #9945ff; font-size: 14px;');
              console.log('%cIf you can read this, you might be degen enough to join us.', 'color: #ffd700; font-size: 12px;');
              console.log('%cContract: [REDACTED] | Discord: discord.gg/geckoz', 'color: #ffffff; font-size: 10px;');
            `,
          }}
        />
      </body>
    </html>
  )
}