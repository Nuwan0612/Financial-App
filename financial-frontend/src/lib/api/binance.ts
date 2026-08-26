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

export const cryptoApi = {
  executeTrade: (data: SpotTradeDto) => api.post("/binance/spot/trade", data),
}