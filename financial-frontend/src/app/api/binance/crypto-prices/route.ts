// src/app/api/crypto-prices/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const symbols = req.nextUrl.searchParams.get('symbols')?.split(',') ?? []
  const formatted = symbols.map(s => `"${s.toUpperCase()}USDT"`).join(',')
  const url = `https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(`[${formatted}]`)}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    const prices: Record<string, number> = {}
    data.forEach((item: { symbol: string; price: string }) => {
      prices[item.symbol.replace('USDT', '')] = parseFloat(item.price)
    })
    return NextResponse.json(prices)
  } catch {
    return NextResponse.json({}, { status: 500 })
  }
}