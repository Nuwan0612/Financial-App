import { useState } from "react"
import { CalAssetCategory, CalFund } from "./types"
import { funds } from "./constants"
import { FundCard } from "./FundCard"
import { FundTransactionPanel } from "./FundTransactionPanel"

export function CategoryTab({ category }: { category: CalAssetCategory }) {
  const categoryFunds = funds.filter(f => f.category === category)
  const [selectedFund, setSelectedFund] = useState<CalFund | null>(null)

  const handleFundClick = (fund: CalFund) => {
    setSelectedFund(prev => prev?.id === fund.id ? null : fund)
  }

  return (
    <div className="space-y-4 mt-4">
      {categoryFunds.length === 0 ? (
        <div className="rounded-lg border border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">No funds in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryFunds.map(fund => (
            <FundCard
              key={fund.id}
              fund={fund}
              selected={selectedFund?.id === fund.id}
              onClick={() => handleFundClick(fund)}
            />
          ))}
        </div>
      )}

      {selectedFund && (
        <FundTransactionPanel
          fund={selectedFund}
          onClose={() => setSelectedFund(null)}
        />
      )}
    </div>
  )
}