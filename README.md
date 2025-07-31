# 🦎 Greedy Geckoz - Degen Paradise

**Where Lambos Go to Die** - The ultimate Solana NFT community refresh with maximum degen energy.

## 🔥 Features

### **Terminal Degen UI**
- Green-on-black terminal aesthetic with glitch effects
- Neon Solana purple/green color scheme  
- Animated chaos elements (scrolling text, flashing warnings)
- Mobile-first responsive design

### **Community Engagement**
- **Cope Cave**: Real-time chat with emoji reactions
- **Wall of Shame/Fame**: Community win/loss leaderboard
- **Degen Arcade**: Interactive games (slots, predictions, rarity gambling)
- **Social Integration**: Live Twitter & Telegram feeds

### **Live Dashboard**
- Real-time floor price, volume, holder metrics
- "Panic Meter" market sentiment gauge
- Recent transaction activity feed
- Daily degen tips and challenges

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Solana CLI tools
- A Solana wallet with SOL for deployment

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd greedy-geckoz-refresh

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the degen paradise in action.

## 🦎 **NFT Minting Setup**

### 1. Prepare Your Assets

**Option A: Zip File Upload**
- Create a zip file with 5000 images (gecko-1.png to gecko-5000.png)
- Include corresponding JSON metadata files (1.json to 5000.json)
- Upload via admin panel at `/admin`

**Option B: Individual Files**
- Prepare 5000 PNG images
- Create individual JSON metadata files
- Upload via admin interface

**Metadata Format:**
```json
{
  "name": "Greedy Gecko #1",
  "description": "A greedy little gecko ready to lose money on Solana",
  "image": "gecko-1.png",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Cosmic Purple"
    },
    {
      "trait_type": "Eyes", 
      "value": "Laser Vision"
    }
  ]
}
```

### 2. Deploy Solana Program

```bash
# Build the minting program (you'll need to create this)
solana program deploy target/deploy/gecko_mint.so

# Create program accounts
solana create-account-with-seed \
  --from <PAYER_KEYPAIR> \
  --seed "mint_authority" \
  --program-id <PROGRAM_ID>

# Initialize lottery vault
solana create-account-with-seed \
  --from <PAYER_KEYPAIR> \
  --seed "lottery_vault" \
  --program-id <PROGRAM_ID>
```

### 3. Configure Environment

Update `.env.local` with your program addresses:

```env
NEXT_PUBLIC_MINT_AUTHORITY=Your_Mint_Authority_Address
NEXT_PUBLIC_LOTTERY_VAULT=Your_Lottery_Vault_Address
NEXT_PUBLIC_UPDATE_AUTHORITY=Your_Update_Authority_Address
```

### 4. Upload Assets to IPFS

**Using Pinata:**
```bash
# Set up Pinata credentials
PINATA_API_KEY=your_api_key
PINATA_SECRET_API_KEY=your_secret_key

# Upload images folder
curl -X POST \
  -F "file=@./images" \
  -F "pinataMetadata={\"name\":\"GreedyGeckozImages\"}" \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET_KEY" \
  "https://api.pinata.cloud/pinning/pinFolderToIPFS"
```

### 5. Mint Configuration

The minting system includes:

- **Price**: 0.0169 SOL per Gecko
- **Lottery**: Every 100 mints, winner gets accumulated fees
- **Fee Structure**: 2% of each mint goes to lottery pool
- **Total Supply**: 957 Geckos (actual collection size)

### 6. Testing

```bash
# Test on devnet first
export NEXT_PUBLIC_NETWORK=devnet
export NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Run tests
npm run test

# Test mint functionality
npm run test:mint
```

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom degen theme
- **Animations**: Framer Motion
- **Blockchain**: Solana Web3.js
- **Real-time**: Socket.io ready
- **Fonts**: JetBrains Mono (terminal) + Inter (body)

## 🎨 Design System

### Colors
```css
--void-black: #0a0a0a
--degen-green: #00ff88  
--solana-purple: #9945ff
--rug-red: #ff0050
--fomo-gold: #ffd700
--cope-blue: #00d4ff
--paper-hands: #ffaa00
```

### Typography
- **Headers**: JetBrains Mono (terminal vibes)
- **Body**: Inter (readable chaos)  
- **Memes**: Comic Sans MS (ironically serious)

## 📱 Social Integration

- **Twitter**: [@greedygeckoz](https://twitter.com/greedygeckoz)
- **Telegram**: [Join Group](https://t.me/+TjyUbcWEorNlNDcx)

## 🎮 Interactive Features

### Degen Arcade
- **Gecko Slots**: Spin to win (or lose) credits
- **Pump or Dump**: Predict price movements
- **Trait Gambler**: Guess NFT rarity odds
- **Daily Challenges**: Earn rewards for completing tasks

### Community Tools
- Real-time holder chat with reactions
- Anonymous "confession booth" 
- Live trading activity feed
- Collaborative project ratings

## 📦 Deployment

### Vercel (Recommended)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### Custom Server
```bash
# Build and start
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables
```env
# Optional: Real Solana RPC endpoint
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Socket.io server for real-time features  
NEXT_PUBLIC_SOCKET_URL=wss://your-socket-server.com
```

### Customization
- Modify colors in `tailwind.config.js`
- Update social links in components
- Add real NFT contract integration
- Connect to live price feeds

## 📈 Performance

- **Lighthouse Score**: 95+ (Performance)
- **Core Web Vitals**: Optimized
- **Mobile First**: PWA ready
- **SEO**: Optimized meta tags & social cards

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/degen-enhancement`)
3. Commit changes (`git commit -m 'Add more chaos'`)
4. Push to branch (`git push origin feature/degen-enhancement`)
5. Open Pull Request

## 📝 License

MIT License - Build your own degen paradise!

## 🦎 Community

Join the gecko family:
- **Discord**: [Coming soon]
- **Twitter**: [@greedygeckoz](https://twitter.com/greedygeckoz) 
- **Telegram**: [Cope Cave](https://t.me/+TjyUbcWEorNlNDcx)

---

*Built by degenerates, for degenerates. Lose money responsibly.* 

**Remember**: This is not financial advice (but you're gonna lose money anyway) 🚨