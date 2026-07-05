"use client"

import CryptoDetail from "@/components/investments/Binance/CryptoDetail"
import GenericInvestmentDetail from "@/components/investments/GenericInvestmentDetail"
import StockMarketDetail from "@/components/investments/stockMarket/StockMarketDetail"
import UnitTrustDetail from "@/components/investments/cal/UnitTrustDetail"
import { useParams, useSearchParams } from "next/navigation"


const InvestmentDetailPage = () => {
  const { id } = useParams()
  const searchParams = useSearchParams()

  const name = searchParams.get("name") ?? ""
  const subType = searchParams.get("subType") ?? ""
  const accountId = Number(id)

  // ← Determine component BEFORE any returns
  let DetailComponent: React.ReactNode

  if (subType === "STOCK" || name.toUpperCase() === "STOCK MARKET") {
    DetailComponent = <StockMarketDetail id={accountId} name={name} />
  } else if (subType === "UNIT_TRUST" || name.toUpperCase() === "CAL") {
    DetailComponent = <UnitTrustDetail id={accountId} name={name} />
  } else if (subType === "CRYPTO" || name.toUpperCase() === "BINANCE") {
    DetailComponent = <CryptoDetail id={accountId} name={name} />
  } else {
    DetailComponent = <GenericInvestmentDetail id={accountId} name={name} />
  }

  // ← Single return at the end
  return <>{DetailComponent}</>
}

export default InvestmentDetailPage