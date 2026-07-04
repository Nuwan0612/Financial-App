// src/components/investments/StockMarketDetail.tsx
"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Zap, TrendingUp, TrendingDown, Pencil, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts"

// ─── Types ───────────────────────────────────────────────────
type Holding = {
  id: number
  symbol: string
  name: string
  sector: string
  shares: number
  avgCost: number
  currentPrice: number
}

type Trade = {
  id: number
  companyId: number
  date: string
  type: "BUY" | "SELL"
  quantity: number
  price: number
}

type CompanyMetric = {
  id: number
  companyId: number
  eps: number
  peRatio: number
  dividendYield: number
  isSP20: boolean
  paysDividends: boolean
  netIncome: number
  sharesOutstanding: number
  totalDividendsPaid: number
}

// ─── Dummy Data ───────────────────────────────────────────────
const portfolioHistory = [
  { date: "Jan", value: 450000 },
  { date: "Feb", value: 480000 },
  { date: "Mar", value: 460000 },
  { date: "Apr", value: 510000 },
  { date: "May", value: 530000 },
  { date: "Jun", value: 520000 },
  { date: "Jul", value: 580000 },
  { date: "Aug", value: 610000 },
  { date: "Sep", value: 590000 },
  { date: "Oct", value: 640000 },
  { date: "Nov", value: 670000 },
  { date: "Dec", value: 720000 },
]

const holdings: Holding[] = [
  { id: 1, symbol: "JKH", name: "John Keells Holdings", sector: "Diversified", shares: 500, avgCost: 185, currentPrice: 210 },
  { id: 2, symbol: "DIAL", name: "Dialog Axiata", sector: "Telecom", shares: 2000, avgCost: 14.5, currentPrice: 12.8 },
  { id: 3, symbol: "COMB", name: "Commercial Bank", sector: "Banking", shares: 300, avgCost: 95, currentPrice: 112 },
  { id: 4, symbol: "HHL", name: "Hemas Holdings", sector: "Healthcare", shares: 800, avgCost: 72, currentPrice: 78 },
  { id: 5, symbol: "LOLC", name: "LOLC Holdings", sector: "Finance", shares: 150, avgCost: 420, currentPrice: 465 },
]

const sectorData = [
  { name: "Diversified", value: 35 },
  { name: "Banking", value: 22 },
  { name: "Telecom", value: 18 },
  { name: "Finance", value: 15 },
  { name: "Healthcare", value: 10 },
]

const trades: Trade[] = [
  { id: 1, companyId: 1, date: "2024-01-15", type: "BUY", quantity: 200, price: 180 },
  { id: 2, companyId: 1, date: "2024-03-22", type: "BUY", quantity: 300, price: 188 },
  { id: 3, companyId: 1, date: "2024-07-10", type: "SELL", quantity: 100, price: 215 },
  { id: 4, companyId: 2, date: "2024-02-08", type: "BUY", quantity: 2000, price: 14.5 },
  { id: 5, companyId: 3, date: "2024-04-01", type: "BUY", quantity: 300, price: 95 },
]

const metrics: CompanyMetric[] = [
  { id: 1, companyId: 1, eps: 18.5, peRatio: 11.35, dividendYield: 2.8, isSP20: true, paysDividends: true, netIncome: 4625000000, sharesOutstanding: 250000000, totalDividendsPaid: 1200000000 },
  { id: 2, companyId: 2, eps: 1.2, peRatio: 10.67, dividendYield: 4.5, isSP20: true, paysDividends: true, netIncome: 2400000000, sharesOutstanding: 2000000000, totalDividendsPaid: 900000000 },
]



const SECTOR_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

const fmtNum = (n: number) =>
  new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(n)

// ─── Level 2: Company Detail ──────────────────────────────────
function CompanyDetail({
  holding, onBack,
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

  // Calculator state
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

      {/* Mini tabs */}
      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Metrics & Ratios</TabsTrigger>
          <TabsTrigger value="trades">Transaction Ledger</TabsTrigger>
        </TabsList>

        {/* Mini-Tab A: Metrics */}
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

        {/* Mini-Tab B: Trades */}
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

// ─── Metric Field Guide (Accordion) ──────────────────────────
const metricGuide = [
  {
    title: "EPS — Earnings Per Share",
    formula: "Net Income ÷ Shares Outstanding",
    definition: "How much profit the company made per share. Higher is generally better.",
    howToUse: "Compare EPS growth year over year. A consistently growing EPS signals a healthy company.",
  },
  {
    title: "P/E Ratio — Price to Earnings",
    formula: "Stock Price ÷ EPS",
    definition: "How much you are paying for 1 Rupee of the company's earnings.",
    howToUse: "A lower P/E might mean it's undervalued. Always compare against companies in the same sector — a P/E of 5 is normal for a bank, high for a tech company.",
  },
  {
    title: "Dividend Yield",
    formula: "(Dividends Per Share ÷ Stock Price) × 100",
    definition: "The annual dividend income you receive as a percentage of the stock price.",
    howToUse: "A yield above 4% is generally attractive. But check if the company can sustain it — very high yields can signal trouble.",
  },
]

function MetricGuide() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="space-y-2">
      {metricGuide.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-border overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors text-left"
            onClick={() => setOpen(open === idx ? null : idx)}
          >
            <span>{item.title}</span>
            {open === idx ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {open === idx && (
            <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
              <p className="text-xs font-mono bg-muted/50 rounded px-2 py-1 text-muted-foreground">{item.formula}</p>
              <p className="text-sm text-foreground">{item.definition}</p>
              <p className="text-xs text-muted-foreground">{item.howToUse}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Level 1: Dashboard ───────────────────────────────────────
export default function StockMarketDetail({
  id, name,
}: {
  id: number
  name: string
}) {
  const router = useRouter()
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null)
  const [calcForm, setCalcForm] = useState({
    stockPrice: "", netIncome: "", sharesOutstanding: "", totalDividends: "",
  })

  // If a company is selected → show Level 2
  if (selectedHolding) {
    return <CompanyDetail holding={selectedHolding} onBack={() => setSelectedHolding(null)} />
  }

  // KPIs
  const totalValue = holdings.reduce((s, h) => s + h.shares * h.currentPrice, 0)
  const totalInvested = holdings.reduce((s, h) => s + h.shares * h.avgCost, 0)
  const totalPnL = totalValue - totalInvested
  const buyingPower = 50000 // dummy

  // Calculator
  const eps = calcForm.netIncome && calcForm.sharesOutstanding
    ? Number(calcForm.netIncome) / Number(calcForm.sharesOutstanding) : null
  const pe = eps && calcForm.stockPrice ? Number(calcForm.stockPrice) / eps : null
  const divYield = calcForm.totalDividends && calcForm.sharesOutstanding && calcForm.stockPrice
    ? ((Number(calcForm.totalDividends) / Number(calcForm.sharesOutstanding)) / Number(calcForm.stockPrice)) * 100 : null

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1400px" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{name}</h1>
            <p className="text-sm text-muted-foreground">Stock Market Portfolio</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> New Sector
          </Button>
          <Button size="sm" className="gap-2">
            <Zap className="h-4 w-4" /> Execute Trade
          </Button>
        </div>
      </div>

      <Tabs defaultValue="portfolio">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio Summary</TabsTrigger>
          <TabsTrigger value="fundamentals">Fundamentals Lab</TabsTrigger>
        </TabsList>

        {/* Tab 1: Portfolio Summary */}
        <TabsContent value="portfolio" className="mt-6 space-y-6">

          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Value", value: fmt(totalValue), color: "text-foreground" },
              { label: "Buying Power", value: fmt(buyingPower), color: "text-blue-600" },
              { label: "Total Invested", value: fmt(totalInvested), color: "text-foreground" },
              { label: "Total P&L", value: fmt(Math.abs(totalPnL)), color: totalPnL >= 0 ? "text-green-600" : "text-destructive" },
            ].map(kpi => (
              <Card key={kpi.label}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className={`text-xl font-semibold mt-1 ${kpi.color}`}>{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={portfolioHistory}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bottom split */}
          <div className="grid grid-cols-[1fr_300px] gap-6">

            {/* Holdings table */}
            <div className="space-y-3">
              <h2 className="text-base font-medium">Active Holdings</h2>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">Symbol</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-24">Sector</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-20">Shares</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-28">Avg Cost</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-28">Current</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-32">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map(h => {
                      const pnl = (h.currentPrice - h.avgCost) * h.shares
                      const isProfit = pnl >= 0
                      return (
                        <tr
                          key={h.id}
                          className="hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => setSelectedHolding(h)}
                        >
                          <td className="px-4 py-3 border border-border font-semibold text-primary">{h.symbol}</td>
                          <td className="px-4 py-3 border border-border">{h.name}</td>
                          <td className="px-4 py-3 border border-border">
                            <Badge variant="outline" className="text-xs">{h.sector}</Badge>
                          </td>
                          <td className="px-4 py-3 border border-border text-right tabular-nums">{h.shares.toLocaleString()}</td>
                          <td className="px-4 py-3 border border-border text-right tabular-nums text-muted-foreground">
                            {fmtNum(h.avgCost)}
                          </td>
                          <td className="px-4 py-3 border border-border text-right tabular-nums font-medium">
                            {fmtNum(h.currentPrice)}
                          </td>
                          <td className={`px-4 py-3 border border-border text-right tabular-nums font-medium ${isProfit ? "text-green-600" : "text-destructive"}`}>
                            {isProfit ? "+" : "-"}{fmt(Math.abs(pnl))}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sector allocation */}
            <div className="space-y-4">
              <h2 className="text-base font-medium">Sector Allocation</h2>
              <Card>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={sectorData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                        {sectorData.map((_, i) => (
                          <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={sectorData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                      <Tooltip formatter={(v: number) => `${v}%`} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {sectorData.map((_, i) => (
                          <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Fundamentals Lab */}
        <TabsContent value="fundamentals" className="mt-6">
          <div className="grid grid-cols-2 gap-8">

            {/* Left — Calculator */}
            <div className="space-y-4">
              <h2 className="text-base font-medium">Financial Calculator</h2>
              <p className="text-sm text-muted-foreground">
                Enter raw data from a company's quarterly report to instantly compute key ratios.
              </p>
              <div className="rounded-lg border border-border p-4 space-y-3">
                {[
                  { key: "stockPrice", label: "Current Stock Price (LKR)" },
                  { key: "netIncome", label: "Net Income (LKR)" },
                  { key: "sharesOutstanding", label: "Total Outstanding Shares" },
                  { key: "totalDividends", label: "Total Dividends Paid (LKR)" },
                ].map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="text-xs">{field.label}</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={calcForm[field.key as keyof typeof calcForm]}
                      onChange={e => setCalcForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                ))}
              </div>

              {/* Results */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "EPS", value: eps ? `LKR ${eps.toFixed(2)}` : "—", sub: "Earnings Per Share", color: "text-blue-600" },
                  { label: "P/E", value: pe ? pe.toFixed(2) : "—", sub: "Price to Earnings", color: "text-purple-600" },
                  { label: "Div Yield", value: divYield ? `${divYield.toFixed(2)}%` : "—", sub: "Annual Yield", color: "text-green-600" },
                ].map(r => (
                  <div key={r.label} className="rounded-lg border border-border p-3 text-center">
                    <p className={`text-2xl font-semibold ${r.color}`}>{r.value}</p>
                    <p className="text-xs font-medium mt-1">{r.label}</p>
                    <p className="text-[10px] text-muted-foreground">{r.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Field Guide */}
            <div className="space-y-4">
              <h2 className="text-base font-medium">Metric Field Guide</h2>
              <p className="text-sm text-muted-foreground">
                Learn what each ratio means and how to use it when evaluating a stock.
              </p>
              <MetricGuide />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}