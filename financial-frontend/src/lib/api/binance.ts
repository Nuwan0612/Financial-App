import api from "@/lib/api"


export type SpotTradeDto = {
  accountId: number
  bucketId: number
  coin: string
  type: "BUY" | "SELL"
  quantity: number
  executionPrice: number
  amount: number
}

export type SpotTransactionDTO = {
  id: number
  type: string
  quantity: number
  executionPrice: number
  investAmount: number
  transactionDate: string
}

export type SpotTransactionResponseDTO = {
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

export type BinanceAccountTransferResponseDTO = {
  fromAccountId: number
  fromAccountCurrentValue: number
  toAccountId: number
  toAccountCurrentValue: number
}

export type FutureJournalRequestDto = {
  accountId: number
  bucketId: number
  coinPair: string
  positionType: "LONG" | "SHORT"
  leverage: number
  margin: number
  pnl: number           
  openDate: string      
  closeDate: string
  ss_path: string
  notes: string
}

export type FutureJournalResponseDto = {
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

export const cryptoApi = {
  executeTrade: (data: SpotTradeDto) => api.post<SpotTransactionResponseDTO>("/binance/spot/trade", data),
  getSpotAssets: (accountId: number) => api.get<SpotTransactionResponseDTO[]>(`/binance/spot/assets/${accountId}`),
  transferBetweenAccounts: (data: { fromAccountId: number, toAccountId: number, amount: number }) => api.post<BinanceAccountTransferResponseDTO>("/binance/account/transfer", data),

  createFutureJournal:  (data: FutureJournalRequestDto) => api.post<FutureJournalResponseDto>("/binance/futures/journal", data),
  getFutureJournals: (accountId: number) => api.get<FutureJournalResponseDto[]>(`/binance/futures/journal/${accountId}`),
}