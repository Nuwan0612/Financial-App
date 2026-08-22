// src/app/api/cal-funds/route.ts
import * as cheerio from 'cheerio'
import { NextResponse } from 'next/server'

export async function GET() {
  const url = "https://www.utasl.lk/unit-prices/"

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html"
      },
      next: { revalidate: 3600 } // cache for 1 hour
    })

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

    const html = await response.text()
    const $ = cheerio.load(html)

    const headers: string[] = []
    $("table thead th").each((_, el) => headers.push($(el).text().trim()))

    const allFunds: Record<string, string>[] = []
    $("table tbody tr").each((_, row) => {
      const cols = $(row).find("td")
      if (cols.length === 0) return
      
      const fund: Record<string, string> = {}
      cols.each((i, col) => {
        fund[headers[i] || `col_${i}`] = $(col).text().trim()
      })
      allFunds.push(fund)
    })

    // 1. Filter for CAL funds
    const calFundsRaw = allFunds.filter(f =>
      JSON.stringify(f).toLowerCase().includes("capital alliance")
    )

    // 2. Map the raw dynamic headers to your strict property names
    const formattedCalFunds = calFundsRaw.map(fund => {
      // We search the keys dynamically in case UTASL adds weird spacing to their headers
      const fundNameKey = Object.keys(fund).find(k => k.toLowerCase().includes('fund name')) || 'Fund Name'
      const sellPriceKey = Object.keys(fund).find(k => k.toLowerCase().includes('selling price')) || 'Selling Price (LKR)'
      const buyPriceKey = Object.keys(fund).find(k => k.toLowerCase().includes('buying price')) || 'Buying Price (LKR)'

      return {
        fundName: fund[fundNameKey] || "Unknown Fund",
        // Remove commas and convert to float for immediate calculation use
        sellPrice: parseFloat(fund[sellPriceKey]?.replace(/,/g, "") || "0"),
        buyPrice: parseFloat(fund[buyPriceKey]?.replace(/,/g, "") || "0")
      }
    })

    console.log("Formatted CAL Funds:", formattedCalFunds) 

    return NextResponse.json(formattedCalFunds)
    
  } catch (err) {
    console.error("Scrape error:", err)
    return NextResponse.json({ error: "Failed to fetch funds" }, { status: 500 })
  }
}