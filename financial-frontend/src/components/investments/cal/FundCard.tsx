import { useEffect, useState } from "react"
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, Edit2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalFund, CalTransactionType } from "./types"
import { fmt } from "./helpers"
import { TransactionDialog, UpdateValueDialog } from "./Dialogs" 
import { calFundsApi, CalTransactionResponseDTO } from "@/lib/api/cal"

// // Format helper
// const fmt = (n: number) => new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

export function FundCard({
  fund,
  selected,
  onClick,
  onFundUpdated,
}: {
  fund: CalFund
  selected: boolean
  onClick: () => void
  onFundUpdated: (updatedFund: CalFund) => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<CalTransactionType>("INVEST")
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  
  // Live Price State
  const [liveUnitPrice, setLiveUnitPrice] = useState<number | null>(null)
  const [fetchingPrice, setFetchingPrice] = useState(false)

 // Debugging log

  // Fetch live NAV specifically for this card's display
  useEffect(() => {
    const fetchLiveNav = async () => {
      setFetchingPrice(true)
      try {
        const res = await fetch("/api/cal-funds")
        const data = await res.json()
        
        // 1. Defend against non-array responses (like 500 Error objects)
        if (!Array.isArray(data)) {
          console.error("API did not return an array:", data)
          return
        }

        // 2. Bulletproof String Matching
        const savedName = fund.name.toLowerCase().trim()
        
        const liveFund = data.find((f: any) => 
          f.fundName && f.fundName.toLowerCase().trim() === savedName
        )
        
        if (liveFund) {
          setLiveUnitPrice(liveFund.sellPrice) 
          fund.currentValue = liveFund.sellPrice

          try {
            await calFundsApi.updateValue(fund.id, liveFund.sellPrice)
          } catch (e) {
            console.error("Failed to update fund with live NAV:", e)
          }

        } else {
          console.warn(`Could not find a live match for: "${fund.name}"`)
        }

        console.log(`Live NAV for "${fund.name}":`, liveFund?.sellPrice ?? "Not Found")

      } catch (e) {
        console.error("Failed to load live NAV for card", e)
      } finally {
        setFetchingPrice(false)
      }
    }
    fetchLiveNav()
  }, [fund.name])

  const isProfit = fund.totalProfit >= 0

  const handleOpenDialog = (type: CalTransactionType, e: React.MouseEvent) => {
    e.stopPropagation()
    setDialogType(type)
    setDialogOpen(true)
  }

  const handleOpenUpdateDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setUpdateDialogOpen(true)
  }

  return (
    <>
      <Card
        onClick={onClick}
        className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5
          ${selected ? "border-primary shadow-sm" : "hover:border-border/80"}`}
      >
        <CardContent className="pt-4 pb-4 space-y-3">
          
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="pr-2">
              <p className="font-semibold text-sm leading-tight">{fund.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground font-medium">
                  {fund.totalUnits ? fund.totalUnits.toFixed(4) : "0.0000"} Units
                </span>
                <span className="text-xs text-muted-foreground/40">•</span>
                <span className="text-xs text-muted-foreground flex items-center">
                  NAV: {fetchingPrice ? <Loader2 className="h-2 w-2 ml-1 animate-spin" /> : liveUnitPrice ? liveUnitPrice.toFixed(4) : "N/A"}              
                </span>
              </div>
              
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={e => handleOpenDialog("INVEST", e)}
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-red-50"
                onClick={e => handleOpenDialog("REDEEM", e)}
              >
                <ArrowUpFromLine className="h-3.5 w-3.5" />
              </Button>
              <button 
                  onClick={handleOpenUpdateDialog}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
            </div>
          </div>

          {/* Data Grid */}
          <div className="pt-3 border-t border-border grid grid-cols-2 gap-4">
            
            {/* Current Value & Profit */}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Current Fund Value</p>
              </div>
              <p className="text-base font-semibold mt-0.5">{fmt(fund.totalProfit+fund.totalInvested)}</p>
              
              <div className={`flex items-center gap-1 mt-0.5 ${isProfit ? "text-green-600" : "text-destructive"}`}>
                {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="text-xs font-medium">
                  {isProfit ? "+" : "-"}{fmt(Math.abs(fund.totalProfit))}
                </span>
              </div>
            </div>

            {/* Total Invested */}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-sm font-medium mt-0.5">{fmt(fund.totalInvested)}</p>
            </div>

          </div>
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        fund={fund}
        availableRedeemable={fund.totalProfit + fund.totalInvested}
        defaultType={dialogType}
        onClose={() => setDialogOpen(false)}
        onSuccess={(txn, updated) => onFundUpdated(updated)}
      />

      <UpdateValueDialog
        open={updateDialogOpen}
        fund={fund}
        onClose={() => setUpdateDialogOpen(false)}
        onSuccess={onFundUpdated}
      />
    </>
  )
}