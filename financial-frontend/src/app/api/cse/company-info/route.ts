// src/app/api/cse/company-info/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "symbol query param is required" }, { status: 400 })
  }

  try {
    const response = await fetch("https://www.cse.lk/api/companyInfoSummery", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: `symbol=${encodeURIComponent(symbol)}`,
    })

    const raw = await response.text()
    if (!raw) throw new Error("Received empty response from CSE.")

    const data = JSON.parse(raw)

    // NOTE: The exact field name CSE uses for sector is unconfirmed — I could not
    // verify it directly (no POST access to cse.lk from this environment). This
    // searches the response defensively for any key containing "sector",
    // mirroring the dynamic header-matching approach used for UTASL. Log the raw
    // `data` once in the browser/network tab to confirm the real key, then you
    // can tighten this to a direct property access if you want.
    const findSectorValue = (obj: unknown): string | null => {
      if (!obj || typeof obj !== "object") return null
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (key.toLowerCase().includes("sector") && typeof value === "string" && value.trim()) {
          return value.trim()
        }
        if (typeof value === "object") {
          const nested = findSectorValue(value)
          if (nested) return nested
        }
      }
      return null
    }

    const sectorName = findSectorValue(data)

    return NextResponse.json({ symbol, sectorName, raw: data })
  } catch (err) {
    console.error("Error fetching CSE company info:", err)
    return NextResponse.json({ error: "Failed to fetch company info" }, { status: 500 })
  }
}