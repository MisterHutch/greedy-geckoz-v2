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
  title: 'Greedy Geckoz ∞ | Degen Paradise Where Lambos Go to Die',
  description: '2222 interdimensional geckoz existing across infinite realities. Join the ultimate Solana NFT community for degenerates who embrace the chaos.',
  keywords: ['Solana', 'NFT', 'Degen', 'Crypto', 'Geckoz', 'Community', 'Memes', 'Greedy', 'Dimensional'],
  authors: [{ name: 'Greedy Geckoz Council' }],
  openGraph: {
    title: 'Greedy Geckoz ∞ - Degen Paradise',
    description: '2222 interdimensional geckoz where reality is optional and JPEGs are forever. 0.0169 SOL per dimension.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Greedy Geckoz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Greedy Geckoz ∞',
    description: 'Reality is optional, geckoz are forever. Enter the gecko dimension.',
    creator: '@greedygeckoz',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: '/gecko-favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
        sizes: 'any',
      }
    ],
    apple: '/gecko-favicon.svg',
    shortcut: '/gecko-favicon.svg',
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
              console.log('%c🌀 GREEDY GECKOZ ∞ DETECTED 🦎', 'color: #56ec6a; font-size: 20px; font-weight: bold;');
              console.log('%cWelcome to the interdimensional degen paradise!', 'color: #ff006e; font-size: 14px;');
              console.log('%cReality is optional, geckoz are forever 🌀', 'color: #06ffa5; font-size: 12px;');
              console.log('%cIf you can read this across dimensions, you are degen enough to join us.', 'color: #ffbe0b; font-size: 12px;');
              console.log('%cTwitter: @greedygeckoz | Telegram: t.me/+TjyUbcWEorNlNDcx', 'color: #8338ec; font-size: 10px;');
            `,
          }}
        />
      </body>
    </html>
  )
}