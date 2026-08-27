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
  coinPair: string
  positionType: "LONG" | "SHORT"
  leverage: number
  margin: number
  realizedPnl: number
  openDate: Date
  closeDate: Date
  ss_path: string
  notes: string 
}


export type AccountTransfer = {
  fromAccountId: number
  toAccountId: number
}