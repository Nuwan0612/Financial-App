// src/components/investments/CompanyDetail.tsx
"use client"

import { useState } from "react"
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Holding } from "./types"
import { metrics, trades } from "./data"
import { fmt, fmtNum } from "./utils"

export default function CompanyDetail({
  holding,
  onBack,
}: {
  holding: Holding
  onBack: () => void
}) {
  const metric = metrics.find(m => m.companyId === holding.id)
  const companyTrades = trades.filter(t => t.companyId === holding.id)
  const totalInvested = holding.shares * holding.avgCost
  const currentValue = holding.shares * holding.currentPrice
  const pnl = currentValue - totalInvested
  const pnlPct = ((pnl / totalInvested) * 100).toFixed(2)
  const isProfit = pnl >= 0

  const [calcForm, setCalcForm] = useState({
    stockPrice: String(holding.currentPrice),
    netIncome: metric ? String(metric.netIncome) : "",
    sharesOutstanding: metric ? String(metric.sharesOutstanding) : "",
    totalDividends: metric ? String(metric.totalDividendsPaid) : "",
  })

  const eps = calcForm.netIncome && calcForm.sharesOutstanding
    ? Number(calcForm.netIncome) / Number(calcForm.sharesOutstanding)
    : null
  const pe = eps && calcForm.stockPrice ? Number(calcForm.stockPrice) / eps : null
  const divYield = calcForm.totalDividends && calcForm.sharesOutstanding && calcForm.stockPrice
    ? ((Number(calcForm.totalDividends) / Number(calcForm.sharesOutstanding)) / Number(calcForm.stockPrice)) * 100
    : null

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{holding.symbol}</h1>
              <Badge variant="secondary">{holding.sector}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{holding.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-xs text-muted-foreground">Current Price</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-semibold">LKR {fmtNum(holding.currentPrice)}</p>
              <Button variant="ghost" size="icon" className="h-6 w-6"><Pencil className="h-3 w-3" /></Button>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Shares Owned</p>
            <p className="text-lg font-semibold">{holding.shares.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Cost</p>
            <p className="text-lg font-semibold">LKR {fmtNum(holding.avgCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">P&L</p>
            <p className={`text-lg font-semibold flex items-center gap-1 ${isProfit ? "text-green-600" : "text-destructive"}`}>
              {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {fmt(Math.abs(pnl))} ({pnlPct}%)
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Metrics & Ratios</TabsTrigger>
          <TabsTrigger value="trades">Transaction Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Saved metrics */}
            {metric ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-medium">Saved Metrics</h2>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Pencil className="h-3 w-3" /> Update Metrics
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "EPS", value: `LKR ${fmtNum(metric.eps)}` },
                    { label: "P/E Ratio", value: fmtNum(metric.peRatio) },
                    { label: "Dividend Yield", value: `${fmtNum(metric.dividendYield)}%` },
                    { label: "S&P 20", value: metric.isSP20 ? "Yes" : "No" },
                    { label: "Pays Dividends", value: metric.paysDividends ? "Yes" : "No" },
                    { label: "Net Income", value: fmt(metric.netIncome) },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg border border-border p-3 bg-card">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-base font-semibold mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">No metrics saved yet.</p>
                <Button size="sm" className="mt-3 gap-1.5">
                  <Plus className="h-3 w-3" /> Add Metrics
                </Button>
              </div>
            )}

            {/* Live calculator */}
            <div className="space-y-4">
              <h2 className="text-base font-medium">Live Calculator</h2>
              <div className="rounded-lg border border-border p-4 space-y-3">
                {[
                  { key: "stockPrice", label: "Stock Price (LKR)" },
                  { key: "netIncome", label: "Net Income (LKR)" },
                  { key: "sharesOutstanding", label: "Shares Outstanding" },
                  { key: "totalDividends", label: "Total Dividends Paid (LKR)" },
                ].map(field => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs">{field.label}</Label>
                    <Input
                      type="number"
                      value={calcForm[field.key as keyof typeof calcForm]}
                      onChange={e => setCalcForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "EPS", value: eps ? `LKR ${eps.toFixed(2)}` : "—", color: "text-blue-600" },
                  { label: "P/E Ratio", value: pe ? pe.toFixed(2) : "—", color: "text-purple-600" },
                  { label: "Div Yield", value: divYield ? `${divYield.toFixed(2)}%` : "—", color: "text-green-600" },
                ].map(r => (
                  <div key={r.label} className="rounded-lg border border-border p-3 text-center bg-card">
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className={`text-lg font-semibold mt-0.5 ${r.color}`}>{r.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trades" className="mt-6">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-28">Date</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-20">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-28">Quantity</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Price</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Total</th>
                </tr>
              </thead>
              <tbody>
                {companyTrades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      No trades recorded for this company.
                    </td>
                  </tr>
                ) : companyTrades.map(trade => (
                  <tr key={trade.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 border border-border text-muted-foreground text-xs">{trade.date}</td>
                    <td className="px-4 py-3 border border-border text-center">
                      <Badge className={trade.type === "BUY"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"}>
                        {trade.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums">{trade.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums">LKR {fmtNum(trade.price)}</td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums font-medium">
                      {fmt(trade.quantity * trade.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}