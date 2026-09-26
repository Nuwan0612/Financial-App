// src/app/api/cse/sectors/route.ts
import { NextResponse } from "next/server"

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
    const response = await fetch("https://www.cse.lk/api/allSectors", fetchOptions)
    
    // Parse as raw text first to prevent JSON crash on empty responses
    const raw = await response.text()
    
    if (!raw || raw.trim() === "") {
      throw new Error("Received empty response from CSE.")
    }

    const data = JSON.parse(raw)
    
    // Extract array based on potential CSE data structures
    const sectors = Array.isArray(data) ? data : data.reqSectors || data.sectors || data
    
    return NextResponse.json(sectors)
  } catch (err) {
    console.error("Error fetching CSE sectors:", err)
    return NextResponse.json({ error: "Failed to fetch CSE sectors" }, { status: 500 })
  }
}