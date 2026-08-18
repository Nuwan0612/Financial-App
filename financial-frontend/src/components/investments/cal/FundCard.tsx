import { useState } from "react"
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalFund, CalTransactionType } from "./types"
import { fmt } from "./helpers"
import { TransactionDialog, UpdateValueDialog } from "./Dialogs" 
import { CalTransactionResponseDTO } from "@/lib/api/cal"

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
  
  // New state to control the Update Value dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)

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

  const handleSuccess = (txn: CalTransactionResponseDTO, updatedFund: CalFund) => {
    onFundUpdated(updatedFund)
  }

  const handleUpdateSuccess = (updatedFund: CalFund) => {
    onFundUpdated(updatedFund)
  }

  return (
    <>
      <Card
        onClick={onClick}
        className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5
          ${selected ? "border-primary shadow-sm" : "hover:border-border/80"}`}
      >
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm">{fund.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Invested: {fmt(fund.totalInvested)}
              </p>
            </div>
            <div className="flex gap-1">
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
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            
            {/* Added a flex container here to align the label and the edit button */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Current Value</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary"
                onClick={handleOpenUpdateDialog}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
            
            <p className="text-base font-semibold mt-0.5">{fmt(fund.currentValue)}</p>
            <div className={`flex items-center gap-1 mt-1 ${isProfit ? "text-green-600" : "text-destructive"}`}>
              {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span className="text-xs font-medium">
                {isProfit ? "+" : "-"}{fmt(Math.abs(fund.totalProfit))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        fund={fund}
        defaultType={dialogType}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSuccess}
      />

      <UpdateValueDialog
        open={updateDialogOpen}
        fund={fund}
        onClose={() => setUpdateDialogOpen(false)}
        onSuccess={handleUpdateSuccess}
      />
    </>
  )
}