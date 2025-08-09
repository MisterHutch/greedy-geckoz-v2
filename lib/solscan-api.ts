// Solscan API integration for portfolio tracking
// This service fetches transaction data and calculates P&L

interface SolscanTransaction {
  signature: string;
  slot: number;
  timestamp: number;
  fee: number;
  status: string;
  lamport: number;
  signer: string[];
  logMessage: string[];
}

interface TokenTransaction {
  signature: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'transfer';
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  price: number;
  solAmount: number;
  source: string;
}

interface WalletBalance {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAmount: string;
  tokenAccount: string;
  uiAmount: number;
}

class SolscanAPI {
  private readonly baseUrl = 'https://public-api.solscan.io';
  private readonly headers = {
    'Accept': 'application/json',
    'User-Agent': 'Geckoz-Portfolio-Tracker/1.0'
  };

  // Get wallet's transaction history
  async getWalletTransactions(
    walletAddress: string, 
    beforeSignature?: string, 
    limit: number = 50
  ): Promise<SolscanTransaction[]> {
    try {
      const url = new URL(`${this.baseUrl}/account/transactions`);
      url.searchParams.append('account', walletAddress);
      url.searchParams.append('limit', limit.toString());
      
      if (beforeSignature) {
        url.searchParams.append('beforeHash', beforeSignature);
      }

      const response = await fetch(url.toString(), { headers: this.headers });
      
      if (!response.ok) {
        throw new Error(`Solscan API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      return [];
    }
  }

  // Get wallet's token balances
  async getWalletTokenBalances(walletAddress: string): Promise<WalletBalance[]> {
    try {
      const url = `${this.baseUrl}/account/tokens?account=${walletAddress}`;
      const response = await fetch(url, { headers: this.headers });
      
      if (!response.ok) {
        throw new Error(`Solscan API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  // Get token price information
  async getTokenPrice(tokenAddress: string): Promise<number> {
    try {
      // For demo purposes, we'll use mock prices
      // In production, integrate with Jupiter or CoinGecko API
      const mockPrices: Record<string, number> = {
        'So11111111111111111111111111111111111111112': 89.50, // SOL
        'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 0.000023, // BONK
        'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': 1.85, // WIF
        // Add more token mappings as needed
      };
      
      return mockPrices[tokenAddress] || 0.001;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }

  // Parse transaction details to extract token operations
  async parseTokenTransaction(tx: SolscanTransaction): Promise<TokenTransaction | null> {
    try {
      // This is a simplified parser - in production you'd need more sophisticated
      // transaction parsing to identify DEX trades, transfers, etc.
      
      const logMessages = tx.logMessage || [];
      let type: 'buy' | 'sell' | 'transfer' = 'transfer';
      let tokenSymbol = 'UNKNOWN';
      let amount = 0;
      let price = 0;
      let solAmount = tx.lamport / 1e9; // Convert lamports to SOL

      // Simple heuristics to identify transaction type
      if (logMessages.some(msg => msg.includes('swap') || msg.includes('exchange'))) {
        type = solAmount > 0 ? 'sell' : 'buy';
      }

      // Extract token information from logs (simplified)
      const tokenMatch = logMessages.join(' ').match(/([A-Z]{2,10})/g);
      if (tokenMatch && tokenMatch.length > 0) {
        tokenSymbol = tokenMatch[0];
      }

      return {
        signature: tx.signature,
        timestamp: tx.timestamp * 1000, // Convert to milliseconds
        type,
        tokenAddress: 'unknown',
        tokenSymbol,
        amount: Math.abs(amount),
        price,
        solAmount: Math.abs(solAmount),
        source: 'solscan'
      };
    } catch (error) {
      console.error('Error parsing transaction:', error);
      return null;
    }
  }

  // Calculate P&L for a wallet over a time period
  async calculateWalletPnL(
    walletAddress: string,
    daysBack: number = 30
  ): Promise<{
    transactions: TokenTransaction[];
    totalPnl: number;
    totalPnlPercentage: number;
    winRate: number;
    summary: Record<string, any>;
  }> {
    try {
      const transactions = await this.getWalletTransactions(walletAddress, undefined, 100);
      const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
      
      const tokenTransactions: TokenTransaction[] = [];
      
      for (const tx of transactions) {
        if ((tx.timestamp * 1000) < cutoffTime) continue;
        
        const tokenTx = await this.parseTokenTransaction(tx);
        if (tokenTx) {
          // Get current price for P&L calculation
          const currentPrice = await this.getTokenPrice(tokenTx.tokenAddress);
          tokenTransactions.push({
            ...tokenTx,
            price: currentPrice
          });
        }
      }

      // Calculate P&L metrics
      let totalPnl = 0;
      let totalInvested = 0;
      let wins = 0;

      const holdings: Record<string, {amount: number, avgPrice: number, invested: number}> = {};

      for (const tx of tokenTransactions) {
        const key = tx.tokenSymbol;
        
        if (!holdings[key]) {
          holdings[key] = { amount: 0, avgPrice: 0, invested: 0 };
        }

        if (tx.type === 'buy') {
          const invested = tx.solAmount;
          const newAmount = holdings[key].amount + tx.amount;
          holdings[key].avgPrice = (holdings[key].invested + invested) / newAmount;
          holdings[key].amount = newAmount;
          holdings[key].invested += invested;
          totalInvested += invested;
        } else if (tx.type === 'sell') {
          const pnl = (tx.price - holdings[key].avgPrice) * tx.amount;
          totalPnl += pnl;
          holdings[key].amount = Math.max(0, holdings[key].amount - tx.amount);
          
          if (pnl > 0) wins++;
        }
      }

      // Add unrealized P&L for current holdings
      for (const [symbol, holding] of Object.entries(holdings)) {
        if (holding.amount > 0) {
          const currentPrice = await this.getTokenPrice('unknown'); // Would need token address mapping
          const unrealizedPnl = (currentPrice - holding.avgPrice) * holding.amount;
          totalPnl += unrealizedPnl;
        }
      }

      const totalPnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
      const winRate = tokenTransactions.length > 0 ? (wins / tokenTransactions.length) * 100 : 0;

      return {
        transactions: tokenTransactions,
        totalPnl,
        totalPnlPercentage,
        winRate,
        summary: {
          totalTransactions: tokenTransactions.length,
          totalInvested,
          holdings
        }
      };
    } catch (error) {
      console.error('Error calculating wallet P&L:', error);
      return {
        transactions: [],
        totalPnl: 0,
        totalPnlPercentage: 0,
        winRate: 0,
        summary: {}
      };
    }
  }
}

// Export singleton instance
export const solscanAPI = new SolscanAPI();

// Helper functions for the dashboard
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

export const getPerformanceColor = (value: number): string => {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
};

export const getSassyMessage = (pnl: number, winRate: number): string => {
  if (pnl > 5000) return "🚀 Holy gecko! You're actually a degen god! Teach us your ways!";
  if (pnl > 1000) return "💎 Damn, you've got diamond hands! Your portfolio is looking spicy!";
  if (pnl > 500) return "📈 Not bad, not bad! You're beating 90% of crypto Twitter!";
  if (pnl > 100) return "😎 Hey, profit is profit! Your mom would be proud!";
  if (pnl > 0) return "🤏 Barely green, but green nonetheless. Keep grinding!";
  if (pnl > -100) return "😅 Only slightly rekt. Could be worse... could be Luna!";
  if (pnl > -500) return "📉 Ouch. Time to DCA or cry? Maybe both?";
  if (pnl > -1000) return "💸 Your wallet is looking emptier than my DMs. RIP!";
  if (pnl > -5000) return "🪦 F in the chat. Your portfolio needs life support!";
  return "☠️ Absolute massacre! Have you considered just buying geckos instead?";
};