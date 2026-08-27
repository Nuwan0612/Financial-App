import { SpotTransactionDTO } from "@/lib/api/binance"

export type SpotCoin = {
  id: number
  coin: string
  totalQuantity: number
  currentPrice: number
  avgPrice: number
  totalInvested: number
  accountId: number
  bucketId: number
  transactions: SpotTransactionDTO[]
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