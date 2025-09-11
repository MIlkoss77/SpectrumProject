export const MOCK_EXCHANGES = [
  { id: 'binance', name: 'Binance', fees: 0.1, enabled: true },
  { id: 'coinbase', name: 'Coinbase Pro', fees: 0.5, enabled: true },
  { id: 'kraken', name: 'Kraken', fees: 0.26, enabled: true },
  { id: 'bybit', name: 'Bybit', fees: 0.1, enabled: true },
  { id: 'okx', name: 'OKX', fees: 0.1, enabled: true },
  { id: 'bitso', name: 'Bitso', fees: 0.2, enabled: true },
  { id: 'mercado', name: 'Mercado Bitcoin', fees: 0.3, enabled: true }
];

export const MOCK_ARBITRAGE_OPPORTUNITIES = [
  {
    pair: 'BTCUSDT',
    buyExchange: 'Kraken',
    sellExchange: 'Coinbase Pro',
    buyPrice: 67350,
    sellPrice: 67420,
    profit: 70,
    profitPercent: 0.104,
    fees: 0.76,
    netProfit: 69.24,
    confidence: 'high'
  },
  {
    pair: 'ETHUSDT',
    buyExchange: 'Kraken',
    sellExchange: 'Coinbase Pro',
    buyPrice: 3415,
    sellPrice: 3435,
    profit: 20,
    profitPercent: 0.586,
    fees: 0.76,
    netProfit: 19.24,
    confidence: 'medium'
  }
];

export const MOCK_TOP_TRADERS = [
  {
    id: 1,
    name: 'CryptoMaster88',
    avatar: '👑',
    roi: 284.5,
    winRate: 76.3,
    followers: 12450,
    totalTrades: 1247,
    averageHold: '2.3 days',
    risk: 'Medium',
    verified: true,
    currentPositions: [
      { pair: 'BTCUSDT', side: 'LONG', entry: 66800, current: 67380, pnl: 0.87 },
      { pair: 'ETHUSDT', side: 'SHORT', entry: 3450, current: 3420, pnl: 0.87 }
    ]
  },
  {
    id: 2,
    name: 'ArbitrageKing',
    avatar: '💎',
    roi: 156.2,
    winRate: 82.1,
    followers: 8920,
    totalTrades: 892,
    averageHold: '4.2 hours',
    risk: 'Low',
    verified: true,
    currentPositions: [
      { pair: 'SOLUSDT', side: 'LONG', entry: 140, current: 142.5, pnl: 1.79 }
    ]
  }
];