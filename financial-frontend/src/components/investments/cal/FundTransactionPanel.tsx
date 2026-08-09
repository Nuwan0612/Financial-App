import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalFund } from "./types"
import { transactions } from "./constants"
import { fmt, fmtDate } from "./helpers"

export function FundTransactionPanel({
  fund,
  onClose,
}: {
  fund: CalFund
  onClose: () => void
}) {
  const fundTxns = transactions.filter(t => t.calFundId === fund.id)
  const isProfit = fund.totalProfit >= 0

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-3">
          <p className="font-semibold">{fund.name}</p>
          <Badge variant="secondary" className="text-xs">{fund.category.replace("_", " ")}</Badge>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Invested</p>
            <p className="text-sm font-medium">{fmt(fund.totalInvested)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Current Value</p>
            <p className="text-sm font-medium">{fmt(fund.currentValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Profit / Loss</p>
            <p className={`text-sm font-semibold ${isProfit ? "text-green-600" : "text-destructive"}`}>
              {isProfit ? "+" : "-"}{fmt(Math.abs(fund.totalProfit))}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {fundTxns.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        </div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/20">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground border border-border">Date</th>
              <th className="text-center px-4 py-2 font-medium text-muted-foreground border border-border w-24">Type</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border w-36">Amount</th>
            </tr>
          </thead>
          <tbody>
            {fundTxns.map(t => (
              <tr key={t.id} className="hover:bg-muted/10">
                <td className="px-4 py-2 border border-border text-muted-foreground text-xs">{fmtDate(t.transactionDate)}</td>
                <td className="px-4 py-2 border border-border text-center">
                  <Badge className={t.type === "INVEST"
                    ? "bg-green-500/10 text-green-600 border-green-500/20 text-xs"
                    : "bg-red-500/10 text-red-600 border-red-500/20 text-xs"}>
                    {t.type === "INVEST" ? "Invest" : "Redeem"}
                  </Badge>
                </td>
                <td className={`px-4 py-2 border border-border text-right tabular-nums font-medium
                  ${t.type === "INVEST" ? "text-green-600" : "text-destructive"}`}>
                  {t.type === "INVEST" ? "+" : "-"}{fmt(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}