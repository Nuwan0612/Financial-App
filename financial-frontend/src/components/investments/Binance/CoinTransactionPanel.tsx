import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SpotCoin } from "./types"
import { spotTrades } from "./constants"
import { fmtUSD } from "./helpers"

export function CoinTransactionPanel({ coin, onClose }: { coin: SpotCoin; onClose: () => void }) {
  const coinTrades = coin.transactions || []
  const invested = coin.totalInvested 
  // const pnl = coin.currentPrice - coin.avgPrice
  // const isProfit = pnl >= 0

  return (
    <div className="rounded-lg border border-border overflow-hidden mt-2">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{coin.coin}</p>
          {/* <span className="text-xs text-muted-foreground">{coin.name}</span> */}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Invested</p>
            <p className="text-sm font-medium">{fmtUSD(invested)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-sm font-medium">{fmtUSD(coin.currentPrice)}</p>
          </div>
          {/* <div className="text-right">
            <p className="text-xs text-muted-foreground">P&L</p>
            <p className={`text-sm font-semibold ${isProfit ? "text-green-600" : "text-destructive"}`}>
              {isProfit ? "+" : "-"}{fmtUSD(Math.abs(pnl))}
            </p>
          </div> */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-muted/20">
            <th className="text-left px-4 py-2 font-medium text-muted-foreground border border-border w-60">Date</th>
            <th className="text-center px-4 py-2 font-medium text-muted-foreground border border-border w-20">Type</th>
            <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border">Quantity</th>
            <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border">Execution Price</th>
            <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border">Invest Amount</th>
          </tr>
        </thead>
        <tbody>
          {coinTrades.map(t => (
            <tr key={t.id} className="hover:bg-muted/10">
              <td className="px-4 py-2 border border-border text-muted-foreground text-xs">
                {new Date(t.transactionDate).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-2 border border-border text-center">
                <Badge className={t.type === "BUY"
                  ? "bg-green-500/10 text-green-600 border-green-500/20 text-xs"
                  : "bg-red-500/10 text-red-600 border-red-500/20 text-xs"}>
                  {t.type}
                </Badge>
              </td>
              <td className="px-4 py-2 border border-border text-right tabular-nums">{t.quantity}</td>
              <td className="px-4 py-2 border border-border text-right tabular-nums">{fmtUSD(t.executionPrice)}</td>
              <td className="px-4 py-2 border border-border text-right tabular-nums font-medium">
                {fmtUSD(t.investAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}