"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, TrendingUp, TrendingDown, ArrowLeftRight, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell,
} from "recharts"

import { AccountTransfer, SpotCoin } from "./types"
import {
  spotHistory, futureHistory,
  PIE_COLORS
} from "./constants"
import { fmtUSD, fmtLKR, fmtBoth } from "./helpers"

import { CoinTransactionPanel } from "./CoinTransactionPanel"
import { FutureCalendar } from "./FutureCalendar"
import { FuturesLockedOverlay } from "./FuturesLockedOverlay" 
import { SpotTradeDialog, TransferDialog } from "./FutureDialog"             
import { bucketsApi, Bukets, snapshotsApi } from "@/lib/api/accounts"
import { subCategoryApi } from "@/lib/api/allocations"
import { getUsdToLkrRate } from "@/lib/utils"
import { cryptoApi } from "@/lib/api/binance"


export default function CryptoDetail({ id, name }: { id: number; name: string }) {
  const router = useRouter()
  const [selectedCoin, setSelectedCoin] = useState<SpotCoin | null>(null)

  const [spotCoins, setSpotCoins] = useState<any[]>([])
  const [futureJournals, setFutureJournals] = useState<any[]>([])

  const [snapshot, setSnapshot] = useState<any[]>([])
  const [exchangeRate, setExchangeRate] = useState<number>(0)

  const [spotAccount, setSpotAccount] = useState<Bukets | null>(null)
  const [futureAccount, setFutureAccount] = useState<Bukets | null>(null)

  const [totalInvestedUSD, setTotalInvestedUSD] = useState<number>(0)
  const [showTradeDialog, setShowTradeDialog] = useState(false)

  const spotInvestedUSD = spotCoins.reduce((s, c) => s + c.totalInvested, 0)
  const futureProfitUSD = futureJournals.reduce((totalPnl, journal) => totalPnl + journal.realizedPnl, 0)

  //(current - avg) × quantity, summed across all coins
  const spotProfitUSD = spotCoins.reduce((totalPnl, coin) => totalPnl + (coin.currentPrice - coin.avgPrice) * coin.totalQuantity,0)
  const spotCurrentUSD = spotInvestedUSD + spotProfitUSD

  

  const pieData = [
    { name: "Spot", value: Math.round(((spotInvestedUSD + spotAccount?.currentAmount || 0) / totalInvestedUSD) * 100) },
    { name: "Futures", value: Math.round((futureAccount?.currentAmount || 0) / totalInvestedUSD * 100) },
  ]

  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [transferDirection, setTransferDirection] = useState<"spot-to-future" | "future-to-spot">("spot-to-future")
  const [accountTransfer, setAccountTransfer] = useState<AccountTransfer | null>(null)

  const [hasFutureAccount, setHasFutureAccount] = useState(false) 

  const handleCreateFutureAccount = async () => {
    const payload = {
      name: "Future",
      percentage: 0,
      mainCategoryId:-1,
      accountId: Number(id)
    }

    const res = await subCategoryApi.create(payload)
    if(res.status === 201){
      setHasFutureAccount(true)
    }
  }

  useEffect(() => {
    Promise.all([
      bucketsApi.getBucketsByAccount(Number(id)),
      snapshotsApi.getSnapshotsByAccount(Number(id)),
      // Gracefully catch 404/errors so Promise.all does NOT fail
      cryptoApi.getSpotAssets(Number(id)).catch(() => ({ data: [] })), 
      cryptoApi.getFutureJournals(Number(id)).catch(() => ({ data: [] })),
      getUsdToLkrRate(),
    ])
      .then(([bucketsRes, snapshotRes, spotAssetsRes, futureJournalsRes, exchangeRate]) => {
        // 1. Handle Bucket Data
        const spotBuyingPower = bucketsRes.data?.find(bucket => bucket.name.toLowerCase() === "spot")?.currentAmount || 0
        const futureBuyingPower = bucketsRes.data?.find(bucket => bucket.name.toLowerCase() === "future")?.currentAmount || 0

        if (bucketsRes.data && bucketsRes.data.length > 0) {
          const futureBucket = bucketsRes.data.find(bucket => bucket.name.toLowerCase() === "future")
          if (futureBucket) {
            setHasFutureAccount(true)
            setFutureAccount(futureBucket)
          }

          const spotBucket = bucketsRes.data.find(bucket => bucket.name.toLowerCase() === "spot")
          if (spotBucket) {
            setSpotAccount(spotBucket)
          }
        }

        // 2. Handle Spot Coins (Defaults to [] if none found)
        setSpotCoins(spotAssetsRes.data || [])
        const spotInvested = spotAssetsRes.data?.reduce((total, coin) => total + coin.totalInvested, 0) || 0
        setTotalInvestedUSD(spotInvested + spotBuyingPower + futureBuyingPower)

        setFutureJournals(futureJournalsRes.data || [])
        setSnapshot(snapshotRes.data || [])
        setExchangeRate(exchangeRate)


      })
      .catch((error) => console.error("Failed to fetch account data", error))
  }, [id])

  useEffect(() => {
    if (spotCoins.length === 0) return

    const symbols = spotCoins.map(c => c.coin).join(",")
    let cancelled = false

    const refreshPrices = async () => {
      try {
        const res = await fetch(`/api/binance/crypto-prices?symbols=${symbols}`)
        const data = await res.json() // expected shape: { BTC: 65000, ETH: 3200, ... }

        if (cancelled) return
        setSpotCoins(prev =>
          prev.map(coin => ({
            ...coin,
            currentPrice: data[coin.coin] ?? coin.currentPrice, // keep old price if fetch didn't include it
          }))
        )
      } catch (err) {
        console.error("Failed to refresh spot prices", err)
      }
    }

    refreshPrices() // run once immediately
    const intervalId = setInterval(refreshPrices, 15000) // every 15s — tune as needed

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [spotCoins.length]) // re-arm only when the set of held coins changes (new buy/sell of a new coin), not on every price tick

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
            <p className="text-xs text-muted-foreground mt-0.5">{fmtLKR(totalInvestedUSD * exchangeRate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Spot P&L</p>
            <p className={`text-base font-semibold mt-1 ${spotProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
              {spotProfitUSD >= 0 ? "+" : ""}{fmtUSD(spotProfitUSD)}
            </p>
            <p className={`text-xs mt-0.5 ${spotProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
              {fmtLKR(spotProfitUSD * exchangeRate)}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden flex flex-col justify-center">
          <CardContent className={`pt-4 pb-4 ${!hasFutureAccount ? "blur-[2px] opacity-20 pointer-events-none" : ""}`}>
            <p className="text-xs text-muted-foreground">Futures P&L</p>
            <p className={`text-base font-semibold mt-1 ${futureProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
              {!hasFutureAccount ? "$0.00" : `${futureProfitUSD >= 0 ? "+" : ""}${fmtUSD(futureProfitUSD)}`}
            </p>
            <p className={`text-xs mt-0.5 ${futureProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
              {!hasFutureAccount ? "LKR 0" : fmtLKR(futureProfitUSD * exchangeRate)}
            </p>
          </CardContent>
          {!hasFutureAccount && <FuturesLockedOverlay compact onUnlock={() => handleCreateFutureAccount()} />}
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
                  <Tooltip formatter={(v) => `${Number(v) || 0}%`} />
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
      
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground">Binance Account Value</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={spotHistory}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmtUSD(Number(v) || 0)} />
              <Line type="monotone" dataKey="value" stroke="#f1ef63ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
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
                <Tooltip formatter={(v) => fmtUSD(Number(v) || 0)} />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className={!hasFutureAccount ? "blur-[4px] opacity-40 pointer-events-none" : ""}>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Futures Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {hasFutureAccount ? (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={futureHistory}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v) => fmtUSD(Number(v) || 0)} />
                    <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[160px] w-full bg-muted/20 rounded-lg border border-dashed border-border/50" />
              )}
            </CardContent>
          </div>
          {!hasFutureAccount && <FuturesLockedOverlay onUnlock={() => handleCreateFutureAccount()} />}
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
          <div className="grid grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Spot Balance</p>
                <p className="text-base font-semibold mt-0.5">{fmtUSD(spotAccount?.currentAmount ?? 0)}</p>
                <p className="text-xs text-muted-foreground">{fmtLKR((spotAccount?.currentAmount ?? 0) * exchangeRate)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Total Spot Value</p>
                <p className="text-base font-semibold mt-0.5">{fmtUSD(spotCurrentUSD)}</p>
                <p className="text-xs text-muted-foreground">{fmtLKR(spotCurrentUSD * exchangeRate)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Transfer to Futures</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Move funds between accounts</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 shrink-0"
                  onClick={() => {
                    setTransferDirection("spot-to-future")
                    setAccountTransfer({
                      fromAccountId: spotAccount?.id || 0, 
                      toAccountId: futureAccount?.id || 0
                    })
                    setShowTransferDialog(true)
                  }}>
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  Transfer
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Execute Trade</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Buy or sell spot coins</p>
                </div>
                <Button size="sm" className="gap-1.5 shrink-0"
                  onClick={() => setShowTradeDialog(true)}>
                  <Zap className="h-3.5 w-3.5" />
                  Trade
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            {spotCoins.length === 0 ? (
            <div className="rounded-lg border border-border py-12 flex items-center justify-center text-sm text-muted-foreground">
              No spot coins found.
            </div>
          ) : (
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
                    const invested = coin.totalInvested 
                    const pnl = (coin.currentPrice - coin.avgPrice) * coin.totalQuantity
                    const isProfit = pnl >= 0
                    const isSelected = selectedCoin?.id === coin.id

                    return (
                      <tr
                        key={coin.id}
                        onClick={() => setSelectedCoin(isSelected ? null : coin)}
                        className={`hover:bg-muted/20 transition-colors cursor-pointer ${isSelected ? "bg-primary/5" : ""}`}
                      >
                        <td className="px-4 py-3 border border-border">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary">{coin.coin}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border border-border text-right tabular-nums">{coin.totalQuantity}</td>
                        <td className="px-4 py-3 border border-border text-right tabular-nums text-muted-foreground">
                          {fmtUSD(coin.avgPrice)}
                        </td>
                        <td className="px-4 py-3 border border-border text-right tabular-nums font-medium">
                          {fmtUSD(coin.currentPrice)}
                        </td>
                        <td className="px-4 py-3 border border-border text-right tabular-nums text-muted-foreground">
                          {fmtUSD(invested)}
                        </td>
                        <td className={`px-4 py-3 border border-border text-right tabular-nums font-medium ${isProfit ? "text-green-600" : "text-destructive"}`}>
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
          )}
          </div>

          {selectedCoin && (
            <CoinTransactionPanel coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
          )}
        </TabsContent>

        {/* Futures tab */}
        <TabsContent value="futures" className="mt-4 space-y-4">
          {!hasFutureAccount ? (
            <div className="relative">
              <div className="pointer-events-none select-none blur-sm opacity-50 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Card><CardContent className="pt-3 pb-3"><p className="text-xs text-muted-foreground">Account Balance</p><p className="text-base font-semibold mt-0.5">$0.00 / LKR 0</p></CardContent></Card>
                  <Card><CardContent className="pt-3 pb-3"><p className="text-xs text-muted-foreground">Total Futures P&L</p><p className="text-base font-semibold mt-0.5 text-muted-foreground">$0.00</p></CardContent></Card>
                </div>
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground">Futures Monthly P&L</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4"><div className="h-40 bg-muted/30 rounded-lg" /></CardContent>
                </Card>
                <div className="h-64 rounded-lg bg-muted/20 border border-border" />
              </div>
              <FuturesLockedOverlay onUnlock={() => handleCreateFutureAccount()} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="pt-3 pb-3">
                    <p className="text-xs text-muted-foreground">Account Balance</p>
                    <p className="text-base font-semibold mt-0.5">{fmtBoth(futureAccount?.currentAmount ?? 0, exchangeRate)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-3 pb-3">
                    <p className="text-xs text-muted-foreground">Total Futures P&L</p>
                    <p className={`text-base font-semibold mt-0.5 ${futureProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
                      {futureProfitUSD >= 0 ? "+" : ""}{fmtBoth(futureProfitUSD, exchangeRate)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-3 pb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Transfer to Spot</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Move funds between accounts</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 shrink-0"
                      onClick={() => {
                        setTransferDirection("future-to-spot")
                        setShowTransferDialog(true)
                        setAccountTransfer({
                          fromAccountId: futureAccount?.id || 0,
                          toAccountId: spotAccount?.id || 0
                        })
                      }}>
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                      Transfer
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <FutureCalendar 
                accountId={id}
                bucketId={futureAccount?.id || 0}
                futureJournals={futureJournals}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <TransferDialog 
        open={showTransferDialog} 
        onClose={() => setShowTransferDialog(false)} 
        onSuccess={(data) => {
          // Update the local state instantly using the response DTO
          if (transferDirection === "spot-to-future") {
            setSpotAccount(prev => prev ? { ...prev, currentAmount: data.fromAccountCurrentValue} : prev)
            setFutureAccount(prev => prev ? { ...prev, currentAmount: data.toAccountCurrentValue } : prev)
          } else {
            setFutureAccount(prev => prev ? { ...prev, currentAmount: data.fromAccountCurrentValue } : prev)
            setSpotAccount(prev => prev ? { ...prev, currentAmount: data.toAccountCurrentValue } : prev)
          }
        }}
        spotBalance={spotAccount?.currentAmount || 0}
        futureBalance={futureAccount?.currentAmount || 0}
        direction={transferDirection}
        accountTransfer={accountTransfer}
      />

      <SpotTradeDialog
        open={showTradeDialog}
        accountId={id}
        bucketId={spotAccount?.id || 0}
        spotBalance={spotAccount?.currentAmount || 0}
        ownedCoins={spotCoins}
        onClose={() => setShowTradeDialog(false)}
        onSuccess={() => {
          setShowTradeDialog(false)
          // re-fetch coins list to update balances
        }}
      />
    </div>
  )
}