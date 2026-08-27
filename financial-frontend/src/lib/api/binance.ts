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

export const cryptoApi = {
  executeTrade: (data: SpotTradeDto) => api.post<SpotTransactionResponseDTO>("/binance/spot/trade", data),
  getSpotAssets: (accountId: number) => api.get<SpotTransactionResponseDTO[]>(`/binance/spot/assets/${accountId}`),
}