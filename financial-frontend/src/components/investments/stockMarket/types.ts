// src/components/investments/types.ts

export type Holding = {
  id: number
  symbol: string
  name: string
  sector: string
  shares: number
  avgCost: number
  currentPrice: number
  isSP20: boolean
}

export type Trade = {
  id: number
  companyId: number
  date: string
  type: "BUY" | "SELL"
  quantity: number
  price: number
}

export type CompanyMetric = {
  id: number
  companyId: number
  eps: number
  peRatio: number
  dividendYield: number
  isSP20: boolean
  paysDividends: boolean
  netIncome: number
  sharesOutstanding: number
  totalDividendsPaid: number
}