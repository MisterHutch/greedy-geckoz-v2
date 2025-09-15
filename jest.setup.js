import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => require('next-router-mock'))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Solana Wallet Adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: () => ({
    connection: {
      getAccountInfo: jest.fn(),
      getBalance: jest.fn(),
      getConfirmedSignaturesForAddress2: jest.fn(),
      getTransaction: jest.fn(),
      sendTransaction: jest.fn(),
      confirmTransaction: jest.fn(),
    }
  }),
  useWallet: () => ({
    connected: false,
    connecting: false,
    disconnecting: false,
    wallet: null,
    publicKey: null,
    signTransaction: jest.fn(),
    signAllTransactions: jest.fn(),
    signMessage: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
  useAnchorWallet: () => null,
}))

// Mock Metaplex
jest.mock('@metaplex-foundation/js', () => ({
  Metaplex: jest.fn().mockImplementation(() => ({
    nfts: () => ({
      findAllByOwner: jest.fn(),
      findByMint: jest.fn(),
      load: jest.fn(),
    }),
  })),
  sol: jest.fn(),
  lamports: jest.fn(),
}))

// Mock Web3.js
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  PublicKey: jest.fn(),
  Keypair: jest.fn(),
  SystemProgram: {
    transfer: jest.fn(),
  },
  Transaction: jest.fn(),
  LAMPORTS_PER_SOL: 1000000000,
}))

// Global test environment setup
global.fetch = jest.fn()
global.TextEncoder = global.TextEncoder || require('util').TextEncoder
global.TextDecoder = global.TextDecoder || require('util').TextDecoder

// Setup environment variables for testing
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_RPC_ENDPOINT = 'https://api.devnet.solana.com'
process.env.SOLANA_RPC_ENDPOINT = 'https://api.devnet.solana.com'

// Console error suppression for cleaner test output
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global cleanup
afterEach(() => {
  jest.clearAllMocks()
})