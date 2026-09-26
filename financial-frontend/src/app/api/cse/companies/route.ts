// src/app/api/cse/companies/route.ts
import { NextResponse } from "next/server"

interface CseStock {
  symbol: string
  name: string
  price: number
  [key: string]: unknown
}

interface EnrichedCompany {
  symbol: string
  name: string
  currentPrice: number
  isSp20: boolean
}

const fetchOptions = {
  method: "POST",
  body: "",
  headers: {
    "User-Agent": "Mozilla/5.0",
    "X-Requested-With": "XMLHttpRequest",
  },
} as const

export async function GET() {
  try {
    const [aspiRes, spslRes] = await Promise.all([
      fetch("https://www.cse.lk/api/aspi", fetchOptions),
      fetch("https://www.cse.lk/api/spsl", fetchOptions),
    ])

    const aspiRaw = await aspiRes.text()
    const spslRaw = await spslRes.text()

    if (!aspiRaw || !spslRaw) {
      throw new Error("Received empty response from CSE.")
    }

    const aspiData = JSON.parse(aspiRaw)
    const spslData = JSON.parse(spslRaw)

    const allStocks: CseStock[] = aspiData.reqASPIIndices || aspiData
    const sp20Stocks: CseStock[] = spslData.reqSNPIndices || spslData

    const sp20Symbols = new Set(sp20Stocks.map((s) => s.symbol))

    const enrichedCompanies: EnrichedCompany[] = allStocks.map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: stock.price,
      isSp20: sp20Symbols.has(stock.symbol),
    }))

    return NextResponse.json(enrichedCompanies)
  } catch (err) {
    console.error("Error fetching CSE market data:", err)
    return NextResponse.json({ error: "Failed to fetch CSE data" }, { status: 500 })
  }
}