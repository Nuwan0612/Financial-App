// src/app/api/cal-funds/route.ts
import { NextResponse } from "next/server"

interface CalFundRate {
  FUND: string
  FUND_NAME: string
  LATEST_DATE: string
  LATEST_PRICE: string
  OLD_DATE: string
  OLD_PRICE: string
  PORTFOLIO: string
  RATE_PERIOD: string
}

interface CalFundRatesResponse {
  UTMS_FUND: CalFundRate[]
}

interface FormattedCalFund {
  fundName: string
  sellPrice: number
  buyPrice: number
  asOfDate: string
}

export async function GET() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().slice(0, 10)
  const url = `https://cal.lk/wp-admin/admin-ajax.php?action=getUTFundRates&valuedate=${dateStr}`

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // cache for 1 hour
    })

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

    const data: CalFundRatesResponse = await response.json()
    const funds = data.UTMS_FUND ?? []

    // CAL's endpoint only returns a single NAV per fund (LATEST_PRICE), not
    // separate buy/sell prices like UTASL's table did. We map it to both
    // fields since that's what FundCard.tsx reads (liveFund.sellPrice).
    const formattedCalFunds: FormattedCalFund[] = funds.map((fund) => {
      const price = parseFloat(fund.LATEST_PRICE)
      return {
        fundName: fund.FUND_NAME.trim(),
        sellPrice: price,
        buyPrice: price,
        asOfDate: fund.LATEST_DATE,
      }
    })

    console.log("Formatted CAL Funds:", formattedCalFunds)

    return NextResponse.json(formattedCalFunds)
  } catch (err) {
    console.error("Fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch funds" }, { status: 500 })
  }
}