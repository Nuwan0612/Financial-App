// src/app/page.tsx  (Dashboard)
"use client"

import { useEffect, useMemo, useState } from "react"
import {
  TrendingUp, TrendingDown, Zap, ArrowLeftRight,
  RefreshCw, Plus, Wallet, BarChart3,
  Bitcoin, Building2, Landmark, PiggyBank, Banknote,
  ChevronRight, ArrowUpRight, ArrowDownRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts"

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Account, accountsApi, DailyWealthSnapshotResponseDTO, snapshotsApi } from "@/lib/api/accounts"
import { getUsdToLkrRate } from "@/lib/utils"

// ─── Dummy Data ───────────────────────────────────────────────

const byAssetClass = [
  { name: "Liquid Cash", value: 25, color: "#6366f1" },
  { name: "Unit Trusts", value: 22, color: "#10b981" },
  { name: "Stocks", value: 18, color: "#f59e0b" },
  { name: "Crypto", value: 15, color: "#f97316" },
  { name: "Fixed Deposits", value: 20, color: "#3b82f6" },
]

const assetClassPnL = [
  { name: "Stocks", pnl: 125000, icon: BarChart3, color: "#f59e0b" },
  { name: "Crypto", pnl: -18000, icon: Bitcoin, color: "#f97316" },
  { name: "Unit Trusts", pnl: 85000, icon: Building2, color: "#10b981" },
  { name: "Fixed Deposits", pnl: 62000, icon: Landmark, color: "#3b82f6" },
]

const holdingsPnL = [
  { symbol: "JKH", name: "John Keells", pnl: 62500, pct: 13.5, type: "Stock" },
  { symbol: "FIOF", name: "First Capital", pnl: 45000, pct: 9.8, type: "Trust" },
  { symbol: "BTC", name: "Bitcoin", pnl: -12000, pct: -4.2, type: "Crypto" },
  { symbol: "COMB", name: "Commercial Bank", pnl: 38500, pct: 8.1, type: "Stock" },
  { symbol: "ETH", name: "Ethereum", pnl: -6000, pct: -2.1, type: "Crypto" },
  { symbol: "DIAL", name: "Dialog Axiata", pnl: 24000, pct: 5.3, type: "Stock" },
]

const recentActivity = [
  { id: 1, type: "BUY", asset: "JKH", amount: 105000, date: "Today, 10:42 AM", module: "Stock", positive: false },
  { id: 2, type: "INVEST", asset: "FIOF", amount: 50000, date: "Today, 09:15 AM", module: "Trust", positive: false },
  { id: 3, type: "TRANSFER", asset: "NSB → CAL", amount: 200000, date: "Yesterday, 3:30 PM", module: "Transfer", positive: false },
  { id: 4, type: "SELL", asset: "ETH", amount: 38000, date: "Yesterday, 11:00 AM", module: "Crypto", positive: true },
  { id: 5, type: "REDEEM", asset: "T-Bill 91", amount: 210000, date: "2 days ago", module: "Trust", positive: true },
  { id: 6, type: "BUY", asset: "COMB", amount: 95000, date: "3 days ago", module: "Stock", positive: false },
]


const masterPnL = 254000

// ─── Helpers ─────────────────────────────────────────────────
const fmtLKR = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)

const fmtCompact = (n: number) => {
  const abs = Math.abs(n)
  const sign = n < 0 ? "-" : "+"
  if (abs >= 1000000) return `${sign}LKR ${(abs / 1000000).toFixed(2)}M`
  if (abs >= 1000) return `${sign}LKR ${(abs / 1000).toFixed(0)}K`
  return `${sign}LKR ${abs}`
}

const moduleColor: Record<string, string> = {
  Stock: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Trust: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Crypto: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Transfer: "bg-blue-500/10 text-blue-600 border-blue-500/20",
}

const txTypeColor: Record<string, string> = {
  BUY: "text-green-600",
  INVEST: "text-green-600",
  TRANSFER: "text-blue-600",
  SELL: "text-destructive",
  REDEEM: "text-destructive",
}

// ─── Quick Action Dialogs ─────────────────────────────────────
function AddTradeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Trade</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Asset Type</Label>
              <Select defaultValue="stock">
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 w-24">
              <Label className="text-xs">Side</Label>
              <Select defaultValue="BUY">
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Symbol</Label>
              <Input placeholder="e.g. JKH" className="h-9" />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Quantity</Label>
              <Input type="number" placeholder="0" className="h-9" />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Price (LKR)</Label>
              <Input type="number" placeholder="0" className="h-9" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Record Trade</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TransferDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Transfer Cash</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">From Account</Label>
            <Select defaultValue="nsb">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nsb">NSB</SelectItem>
                <SelectItem value="comb">COMB</SelectItem>
                <SelectItem value="cal">CAL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To Account</Label>
            <Select defaultValue="cal">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nsb">NSB</SelectItem>
                <SelectItem value="comb">COMB</SelectItem>
                <SelectItem value="cal">CAL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Amount (LKR)</Label>
            <Input type="number" placeholder="0" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length && label) {
    // If rawDate is YYYY-MM-DD, parse without timezone skew
    const formattedDate = new Date(label).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-md">
        <p className="text-xs text-muted-foreground mb-1">{formattedDate}</p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <p className="text-sm font-medium text-foreground">
            Total Wealth: <span className="font-semibold">{fmt(payload[0].value)}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

const getDeterministicColor = (index: number, total: number) => {
  // Use golden angle approximation (137.5 deg) for optimal distribution
  const hue = (index * 137.508) % 360
  return `hsl(${hue}, 70%, 55%)`
}


// ─── Dashboard ────────────────────────────────────────────────
export default function DashboardPage() {
  const [showAddTrade, setShowAddTrade] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pnlRange, setPnlRange] = useState<"alltime" | "24h">("alltime")
  const [snapshot, setSnapshot] = useState<DailyWealthSnapshotResponseDTO[]>([])

  const [accounts, setAccounts] = useState<Account[]>([])
  const [usdToLkrRate, setUsdToLkrRate] = useState<number>(0)

  useEffect(() => {
    Promise.all([
      accountsApi.getAll(),
      getUsdToLkrRate(),
      snapshotsApi.getWealthSnapshots()
      // more fetches go here later
    ]).then(([accountsRes, usdToLkrRate, snapshot]) => {

      console.log("Fetched accounts:", accountsRes.data)
      setAccounts(accountsRes.data)
      setUsdToLkrRate(usdToLkrRate)
      setSnapshot(snapshot.data)
    }).catch(() => console.error("Failed to fetch dashboard data"))
  }, [])

  const bankAccounts = accounts.filter(a => a.type === "Bank")
  const buyingPowerLKR = bankAccounts.reduce((s, a) => s + a.currentBalance, 0)
  const totalNAVLKR = accounts.reduce((s, a) => s + a.currentBalance, 0)
  const buyingPowerUSD = buyingPowerLKR / usdToLkrRate
  const totalNAVUSD = totalNAVLKR / usdToLkrRate

   const earliestDate = snapshot.length > 0
      ? snapshot.reduce((earliest, s) => s.date < earliest ? s.date : earliest, snapshot[0].date.split("T")[0])
      : null


// 2. Area Chart Data (Sort by date ascending)
  const chartData = [...snapshot]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(s => ({
      rawDate: s.date, // e.g. "2026-05-12"
      amount: Number(s.totalBalance || 0),
    }))

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1800)
  }

  const byAccount = useMemo(() => {
    const activeAccounts = accounts.filter(
      (a) => a.isActive && Number(a.currentBalance || 0) > 0
    )

    return activeAccounts.map((acc, index) => ({
      name: acc.name,
      value: Number(acc.currentBalance),
      color: getDeterministicColor(index, activeAccounts.length),
    }))
  }, [accounts])

  const totalNAV = useMemo(() => {
    return byAccount.reduce((sum, item) => sum + item.value, 0)
  }, [byAccount])

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1600px" }}>

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Quick Action Hub */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Update Prices
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowTransfer(true)} className="gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Transfer Cash
          </Button>
          <Button size="sm" onClick={() => setShowAddTrade(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Trade
          </Button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-4 gap-4">

        {/* Buying Power */}
        <Card className="border-border/60">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Buying Power</p>
              <p className="text-2xl font-semibold mt-1">{fmtLKR(buyingPowerLKR)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{fmtUSD(buyingPowerUSD)}</p>
              <p className="text-xs text-muted-foreground mt-1">Liquid cash across bank accounts</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-indigo-500" />
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Master P&L */}
        <Card className="border-border/60">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Master P&L</p>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {(["alltime", "24h"] as const).map(r => (
                      <button key={r} onClick={() => setPnlRange(r)}
                        className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors
                          ${pnlRange === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                        {r === "alltime" ? "All" : "24h"}
                      </button>
                    ))}
                  </div>
                </div>
                <p className={`text-2xl font-semibold mt-1 ${masterPnL >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {masterPnL >= 0 ? "+" : ""}{fmtLKR(masterPnL)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((masterPnL / (totalNAV - masterPnL)) * 100).toFixed(1)}% return on invested capital
                </p>
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center
                ${masterPnL >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                {masterPnL >= 0
                  ? <TrendingUp className="h-4 w-4 text-green-600" />
                  : <TrendingDown className="h-4 w-4 text-destructive" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total NAV */}
        <Card className="border-border/60">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Net Worth</p>
                <p className="text-2xl font-semibold mt-1">{fmtLKR(totalNAVLKR)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{fmtUSD(totalNAVUSD)}</p>
                <p className="text-xs text-muted-foreground mt-1">Across all accounts & assets</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <PiggyBank className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best / Worst performer */}
        <Card className="border-border/60">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Top Movers</p>
            <div className="space-y-2">
              {[...holdingsPnL].sort((a, b) => b.pnl - a.pnl).slice(0, 2).map(h => (
                <div key={h.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-semibold">{h.symbol}</span>
                    <span className="text-xs text-muted-foreground">{h.name}</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">+{h.pct}%</span>
                </div>
              ))}
              {[...holdingsPnL].sort((a, b) => a.pnl - b.pnl).slice(0, 1).map(h => (
                <div key={h.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                    <span className="text-xs font-semibold">{h.symbol}</span>
                    <span className="text-xs text-muted-foreground">{h.name}</span>
                  </div>
                  <span className="text-xs font-medium text-destructive">{h.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Chart + Asset Class P&L ── */}
      <div className="grid grid-cols-[1fr_320px] gap-4">

        {/* NAV trend */}
        <Card className="lg:col-span-1 shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Total Wealth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-62.5 flex items-center justify-center text-sm text-muted-foreground">
                No history available yet.
              </div>
            ) : (
              <div className="h-62.5 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                      dataKey="rawDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                      dy={10}
                      tickFormatter={(value) => {
                        // This tells the axis to ONLY draw "May 12" on the screen
                        return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      tickFormatter={(value) => `Rs.${(value / 1000)}k`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="var(--primary)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* P&L by Asset Class */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold">P&L by Asset Class</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {assetClassPnL.map(a => {
              const Icon = a.icon
              const isProfit = a.pnl >= 0
              return (
                <div key={a.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${a.color}18` }}>
                      <Icon className="h-4 w-4" style={{ color: a.color }} />
                    </div>
                    <span className="text-sm font-medium">{a.name}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isProfit ? "text-green-600" : "text-destructive"}`}>
                      {fmtCompact(a.pnl)}
                    </p>
                  </div>
                </div>
              )
            })}

            <div className="border-t border-border pt-3 mt-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Total P&L</span>
                <span className={`font-semibold ${masterPnL >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {fmtCompact(masterPnL)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row + Holdings P&L ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Wealth by Account — Pie */}
        <Card>
          <CardHeader className="pb-0 pt-4 px-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Wealth by Account</CardTitle>
            <span className="text-xs text-muted-foreground font-medium">
              Total: {fmtLKR(totalNAV)}
            </span>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {byAccount.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
                No active funded accounts
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={byAccount}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35} // Modern donut cut
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {byAccount.map((a, i) => (
                      <Cell key={`cell-${i}`} fill={a.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [fmtLKR(Number(v) || 0), "Balance"]}
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, paddingTop: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Wealth by Asset Class — Donut */}
        {/* <Card>
          <CardHeader className="pb-0 pt-4 px-5">
            <CardTitle className="text-sm font-semibold">Wealth by Asset Class</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byAssetClass} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                  dataKey="value" paddingAngle={2}>
                  {byAssetClass.map((a, i) => <Cell key={i} fill={a.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtLKR(Number(v) || 0)} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}

        {/* Holdings P&L — scrollable list */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold">P&L by Holding</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-2 max-h-[168px] overflow-y-auto pr-1">
              {[...holdingsPnL].sort((a, b) => b.pnl - a.pnl).map(h => {
                const isProfit = h.pnl >= 0
                return (
                  <div key={h.symbol} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-6 rounded-full ${isProfit ? "bg-green-500" : "bg-destructive"}`} />
                      <div>
                        <p className="text-xs font-semibold leading-none">{h.symbol}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{h.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${isProfit ? "text-green-600" : "text-destructive"}`}>
                        {fmtCompact(h.pnl)}
                      </p>
                      <p className={`text-[10px] ${isProfit ? "text-green-600" : "text-destructive"}`}>
                        {h.pct > 0 ? "+" : ""}{h.pct}%
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity Feed ── */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
              View All <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="space-y-1">
            {recentActivity.map((tx, idx) => (
              <div key={tx.id}>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${tx.positive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      {tx.type === "TRANSFER"
                        ? <ArrowLeftRight className="h-3.5 w-3.5" />
                        : tx.positive
                          ? <ArrowUpRight className="h-3.5 w-3.5" />
                          : <ArrowDownRight className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${txTypeColor[tx.type]}`}>{tx.type}</span>
                        <span className="text-sm font-medium">{tx.asset}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${moduleColor[tx.module]}`}>
                          {tx.module}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{tx.date}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold tabular-nums
                    ${tx.positive ? "text-green-600" : "text-foreground"}`}>
                    {tx.positive ? "+" : "-"}{fmtLKR(tx.amount)}
                  </p>
                </div>
                {idx < recentActivity.length - 1 && (
                  <div className="border-b border-border/50" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Dialogs ── */}
      <AddTradeDialog open={showAddTrade} onClose={() => setShowAddTrade(false)} />
      <TransferDialog open={showTransfer} onClose={() => setShowTransfer(false)} />
    </div>
  )
}