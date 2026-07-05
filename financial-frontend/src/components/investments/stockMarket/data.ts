// src/components/investments/data.ts
import { Holding, Trade, CompanyMetric } from "./types"

export const portfolioHistory = [
  { date: "Jan", value: 450000 },
  { date: "Feb", value: 480000 },
  { date: "Mar", value: 460000 },
  { date: "Apr", value: 510000 },
  { date: "May", value: 530000 },
  { date: "Jun", value: 520000 },
  { date: "Jul", value: 580000 },
  { date: "Aug", value: 610000 },
  { date: "Sep", value: 590000 },
  { date: "Oct", value: 640000 },
  { date: "Nov", value: 670000 },
  { date: "Dec", value: 720000 },
]

export const holdings: Holding[] = [
  { id: 1, symbol: "JKH", name: "John Keells Holdings", sector: "Diversified", shares: 500, avgCost: 185, currentPrice: 210, isSP20: true },
  { id: 2, symbol: "DIAL", name: "Dialog Axiata", sector: "Telecom", shares: 2000, avgCost: 14.5, currentPrice: 12.8, isSP20: true },
  { id: 3, symbol: "COMB", name: "Commercial Bank", sector: "Banking", shares: 300, avgCost: 95, currentPrice: 112, isSP20: true },
  { id: 4, symbol: "HHL", name: "Hemas Holdings", sector: "Healthcare", shares: 800, avgCost: 72, currentPrice: 78, isSP20: false },
  { id: 5, symbol: "LOLC", name: "LOLC Holdings", sector: "Finance", shares: 150, avgCost: 420, currentPrice: 465, isSP20: false },
]

export const sectorData = [
  { name: "Diversified", value: 35 },
  { name: "Banking", value: 22 },
  { name: "Telecom", value: 18 },
  { name: "Finance", value: 15 },
  { name: "Healthcare", value: 10 },
]

export const trades: Trade[] = [
  { id: 1, companyId: 1, date: "2024-01-15", type: "BUY", quantity: 200, price: 180 },
  { id: 2, companyId: 1, date: "2024-03-22", type: "BUY", quantity: 300, price: 188 },
  { id: 3, companyId: 1, date: "2024-07-10", type: "SELL", quantity: 100, price: 215 },
  { id: 4, companyId: 2, date: "2024-02-08", type: "BUY", quantity: 2000, price: 14.5 },
  { id: 5, companyId: 3, date: "2024-04-01", type: "BUY", quantity: 300, price: 95 },
]

export const metrics: CompanyMetric[] = [
  { id: 1, companyId: 1, eps: 18.5, peRatio: 11.35, dividendYield: 2.8, isSP20: true, paysDividends: true, netIncome: 4625000000, sharesOutstanding: 250000000, totalDividendsPaid: 1200000000 },
  { id: 2, companyId: 2, eps: 1.2, peRatio: 10.67, dividendYield: 4.5, isSP20: true, paysDividends: true, netIncome: 2400000000, sharesOutstanding: 2000000000, totalDividendsPaid: 900000000 },
]

export const metricGuideData = [
  {
    title: "EPS — Earnings Per Share",
    formula: "Net Income ÷ Shares Outstanding",
    definition: "How much profit the company made per share. Higher is generally better.",
    howToUse: "Compare EPS growth year over year. A consistently growing EPS signals a healthy company.",
  },
  {
    title: "P/E Ratio — Price to Earnings",
    formula: "Stock Price ÷ EPS",
    definition: "How much you are paying for 1 Rupee of the company's earnings.",
    howToUse: "A lower P/E might mean it's undervalued. Always compare against companies in the same sector — a P/E of 5 is normal for a bank, high for a tech company.",
  },
  {
    title: "Dividend Yield",
    formula: "(Dividends Per Share ÷ Stock Price) × 100",
    definition: "The annual dividend income you receive as a percentage of the stock price.",
    howToUse: "A yield above 4% is generally attractive. But check if the company can sustain it — very high yields can signal trouble.",
  },
]