"use client"

import CryptoDetail from "@/components/investments/CryptoDetail"
import GenericInvestmentDetail from "@/components/investments/GenericInvestmentDetail"
import StockMarketDetail from "@/components/investments/StockMarketDetail"
import UnitTrustDetail from "@/components/investments/UnitTrustDetail"
import { useParams, useSearchParams } from "next/navigation"


const InvestmentDetailPage = () => {
  const { id } = useParams()
  const searchParams = useSearchParams()

  const name = searchParams.get("name") ?? ""

  const accountId = Number(id)

  switch (name.toUpperCase()) {
    case "STOCK MARKET":
      return <StockMarketDetail id={accountId} name={name} />
    case "CAL":
      return <UnitTrustDetail id={accountId} name={name} />
    case "BINANCE":
      return <CryptoDetail id={accountId} name={name} />
    default:
      return <GenericInvestmentDetail id={accountId} name={name} />
  }
}

export default InvestmentDetailPage