// src/app/api/crypto-search/route.ts — get all available USDT pairs
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/exchangeInfo')
    const data = await res.json()
    const usdtPairs = data.symbols
      .filter((s: any) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
      .map((s: any) => s.baseAsset)
    return NextResponse.json(usdtPairs)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}