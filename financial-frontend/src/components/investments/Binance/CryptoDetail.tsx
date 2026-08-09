"use client"

import { useState } from "react"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell,
} from "recharts"

import { SpotCoin } from "./types"
import {
  spotCoins, spotHistory, futureHistory,
  FUTURE_ACCOUNT_BALANCE_USD, FUTURE_TOTAL_PROFIT_USD,
  PIE_COLORS, EXCHANGE_RATE
} from "./constants"
import { fmtUSD, fmtLKR, fmtBoth } from "./helpers"

import { CoinTransactionPanel } from "./CoinTransactionPanel"
import { FutureCalendar } from "./FutureCalendar"

export default function CryptoDetail({ id, name }: { id: number; name: string }) {
  const router = useRouter()
  const [selectedCoin, setSelectedCoin] = useState<SpotCoin | null>(null)

  // ── Spot calculations ──
  const spotInvestedUSD = spotCoins.reduce((s, c) => s + c.quantity * c.avgPrice, 0)
  const spotCurrentUSD = spotCoins.reduce((s, c) => s + c.quantity * c.currentPrice, 0)
  const spotProfitUSD = spotCurrentUSD - spotInvestedUSD

  // ── Future calculations ──
  const futureInvestedUSD = FUTURE_ACCOUNT_BALANCE_USD
  const futureProfitUSD = FUTURE_TOTAL_PROFIT_USD

  const totalInvestedUSD = spotInvestedUSD + futureInvestedUSD

  const pieData = [
    { name: "Spot", value: Math.round((spotInvestedUSD / totalInvestedUSD) * 100) },
    { name: "Futures", value: Math.round((futureInvestedUSD / totalInvestedUSD) * 100) },
  ]

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{name}</h1>
          <p className="text-sm text-muted-foreground">Crypto Portfolio</p>
        </div>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Invested</p>
            <p className="text-base font-semibold mt-1">{fmtUSD(totalInvestedUSD)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{fmtLKR(totalInvestedUSD * EXCHANGE_RATE)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Spot P&L</p>
            <p className={`text-base font-semibold mt-1 ${spotProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
              {spotProfitUSD >= 0 ? "+" : ""}{fmtUSD(spotProfitUSD)}
            </p>
            <p className={`text-xs mt-0.5 ${spotProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
              {fmtLKR(spotProfitUSD * EXCHANGE_RATE)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Futures P&L</p>
            <p className={`text-base font-semibold mt-1 ${futureProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
              {futureProfitUSD >= 0 ? "+" : ""}{fmtUSD(futureProfitUSD)}
            </p>
            <p className={`text-xs mt-0.5 ${futureProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
              {fmtLKR(futureProfitUSD * EXCHANGE_RATE)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-2 pb-2">
            <p className="text-xs text-muted-foreground mb-1">Distribution</p>
            <div className="flex items-center gap-2">
              <ResponsiveContainer width={80} height={80}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={36} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-[10px] text-muted-foreground">{d.name} {d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two charts side by side */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Spot Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={spotHistory}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmtUSD(v)} />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Futures Monthly P&L</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={futureHistory}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: number) => fmtUSD(v)} />
                <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="spot">
        <TabsList>
          <TabsTrigger value="spot">Spot</TabsTrigger>
          <TabsTrigger value="futures">Futures</TabsTrigger>
        </TabsList>

        {/* Spot tab */}
        <TabsContent value="spot" className="mt-4 space-y-3">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">Coin</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-24">Quantity</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-28">Avg Price</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-28">Current</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-28">Invested</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-32">P&L</th>
                </tr>
              </thead>
              <tbody>
                {spotCoins.map(coin => {
                  const invested = coin.quantity * coin.avgPrice
                  const current = coin.quantity * coin.currentPrice
                  const pnl = current - invested
                  const isProfit = pnl >= 0
                  const isSelected = selectedCoin?.id === coin.id

                  return (
                    <tr
                      key={coin.id}
                      onClick={() => setSelectedCoin(isSelected ? null : coin)}
                      className={`hover:bg-muted/20 transition-colors cursor-pointer
                        ${isSelected ? "bg-primary/5" : ""}`}
                    >
                      <td className="px-4 py-3 border border-border">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">{coin.symbol}</span>
                          <span className="text-xs text-muted-foreground">{coin.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border border-border text-right tabular-nums">{coin.quantity}</td>
                      <td className="px-4 py-3 border border-border text-right tabular-nums text-muted-foreground">
                        {fmtUSD(coin.avgPrice)}
                      </td>
                      <td className="px-4 py-3 border border-border text-right tabular-nums font-medium">
                        {fmtUSD(coin.currentPrice)}
                      </td>
                      <td className="px-4 py-3 border border-border text-right tabular-nums text-muted-foreground">
                        {fmtUSD(invested)}
                      </td>
                      <td className={`px-4 py-3 border border-border text-right tabular-nums font-medium
                        ${isProfit ? "text-green-600" : "text-destructive"}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {isProfit ? "+" : "-"}{fmtUSD(Math.abs(pnl))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {selectedCoin && (
            <CoinTransactionPanel coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
          )}
        </TabsContent>

        {/* Futures tab */}
        <TabsContent value="futures" className="mt-4 space-y-4">
          {/* Futures account summary */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Account Balance</p>
                <p className="text-base font-semibold mt-0.5">{fmtBoth(FUTURE_ACCOUNT_BALANCE_USD)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Total Futures P&L</p>
                <p className={`text-base font-semibold mt-0.5 ${futureProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {futureProfitUSD >= 0 ? "+" : ""}{fmtBoth(futureProfitUSD)}
                </p>
              </CardContent>
            </Card>
          </div>

          <FutureCalendar />
        </TabsContent>
      </Tabs>
    </div>
  )
}