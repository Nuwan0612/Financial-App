import { SpotCoin, SpotTrade, FutureJournal } from "./types"

export const EXCHANGE_RATE = 320

export const spotCoins: SpotCoin[] = [
  { id: 1, symbol: "BTC", name: "Bitcoin", quantity: 0.05, avgPrice: 42000, currentPrice: 67000 },
  { id: 2, symbol: "ETH", name: "Ethereum", quantity: 1.2, avgPrice: 2200, currentPrice: 3500 },
  { id: 3, symbol: "BNB", name: "Binance Coin", quantity: 5, avgPrice: 280, currentPrice: 580 },
  { id: 4, symbol: "SOL", name: "Solana", quantity: 10, avgPrice: 95, currentPrice: 170 },
]

export const spotTrades: SpotTrade[] = [
  { id: 1, coinId: 1, type: "BUY", quantity: 0.03, price: 40000, date: "2024-01-10" },
  { id: 2, coinId: 1, type: "BUY", quantity: 0.02, price: 45000, date: "2024-03-15" },
  { id: 3, coinId: 2, type: "BUY", quantity: 1.0, price: 2100, date: "2024-01-20" },
  { id: 4, coinId: 2, type: "BUY", quantity: 0.2, price: 2500, date: "2024-04-01" },
  { id: 5, coinId: 3, type: "BUY", quantity: 5, price: 280, date: "2024-02-05" },
  { id: 6, coinId: 4, type: "BUY", quantity: 10, price: 95, date: "2024-02-20" },
]

export const futureJournals: FutureJournal[] = [
  { id: 1, date: "2026-05-05", pair: "BTC/USDT", direction: "LONG", entryPrice: 63000, exitPrice: 65000, size: 0.1, profit: 200, notes: "Strong breakout above resistance. Took profit at target." },
  { id: 2, date: "2026-05-08", pair: "ETH/USDT", direction: "SHORT", entryPrice: 3400, exitPrice: 3200, size: 1.0, profit: 200, notes: "Bearish divergence on 4H. Clean short." },
  { id: 3, date: "2026-05-08", pair: "BNB/USDT", direction: "LONG", entryPrice: 560, exitPrice: 540, size: 5, profit: -100, notes: "False breakout. Stopped out." },
  { id: 4, date: "2026-05-15", pair: "SOL/USDT", direction: "LONG", entryPrice: 165, exitPrice: 175, size: 10, profit: 100, notes: "Good momentum trade." },
  { id: 5, date: "2026-05-20", pair: "BTC/USDT", direction: "SHORT", entryPrice: 68000, exitPrice: 65000, size: 0.05, profit: 150, notes: "Distribution pattern at ATH." },
]

export const spotHistory = [
  { date: "Jan", value: 8500 },
  { date: "Feb", value: 9200 },
  { date: "Mar", value: 8800 },
  { date: "Apr", value: 10500 },
  { date: "May", value: 11200 },
  { date: "Jun", value: 12800 },
]

export const futureHistory = [
  { date: "Jan", pnl: 120 },
  { date: "Feb", pnl: -80 },
  { date: "Mar", pnl: 350 },
  { date: "Apr", pnl: 200 },
  { date: "May", pnl: 550 },
  { date: "Jun", pnl: -120 },
]

export const FUTURE_ACCOUNT_BALANCE_USD = 1500
export const FUTURE_TOTAL_PROFIT_USD = futureJournals.reduce((s, j) => s + j.profit, 0)
export const PIE_COLORS = ["#6366f1", "#f59e0b"]
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
export const CURRENT_YEAR = new Date().getFullYear()