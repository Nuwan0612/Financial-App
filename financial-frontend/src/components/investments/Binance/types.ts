export type SpotCoin = {
  id: number
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
}

export type SpotTrade = {
  id: number
  coinId: number
  type: "BUY" | "SELL"
  quantity: number
  price: number
  date: string
}

export type FutureJournal = {
  id: number
  date: string
  pair: string
  direction: "LONG" | "SHORT"
  entryPrice: number
  exitPrice: number
  size: number
  profit: number
  notes: string
}