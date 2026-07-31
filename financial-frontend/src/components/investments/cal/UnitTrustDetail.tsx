// src/components/investments/UnitTrustDetail.tsx
"use client"

import { useState } from "react"
import { ArrowLeft, TrendingUp, TrendingDown, Plus, ArrowDownToLine, ArrowUpFromLine, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell,
} from "recharts"

// ─── Types ───────────────────────────────────────────────────
type CalAssetCategory = "UNIT_TRUST" | "T_BILL" | "BOND"
type CalTransactionType = "INVEST" | "REDEEM"

type CalFund = {
  id: number
  name: string
  category: CalAssetCategory
  currentValue: number
  isActive: boolean
  totalInvested: number
  totalProfit: number
}

type CalTransaction = {
  id: number
  calFundId: number
  fundName: string
  type: CalTransactionType
  amount: number
  transactionDate: string
}

// ─── Dummy Data ───────────────────────────────────────────────
const funds: CalFund[] = [
  { id: 1, name: "FIOF", category: "UNIT_TRUST", currentValue: 125000, isActive: true, totalInvested: 100000, totalProfit: 25000 },
  { id: 2, name: "NAMAL Growth", category: "UNIT_TRUST", currentValue: 88000, isActive: true, totalInvested: 80000, totalProfit: 8000 },
  { id: 3, name: "Ceybank Unit Trust", category: "UNIT_TRUST", currentValue: 52000, isActive: true, totalInvested: 50000, totalProfit: 2000 },
  { id: 4, name: "91-Day T-Bill", category: "T_BILL", currentValue: 210000, isActive: true, totalInvested: 200000, totalProfit: 10000 },
  { id: 5, name: "182-Day T-Bill", category: "T_BILL", currentValue: 155000, isActive: true, totalInvested: 150000, totalProfit: 5000 },
  { id: 6, name: "2-Year Treasury Bond", category: "BOND", currentValue: 320000, isActive: true, totalInvested: 300000, totalProfit: 20000 },
  { id: 7, name: "5-Year Treasury Bond", category: "BOND", currentValue: 265000, isActive: true, totalInvested: 250000, totalProfit: 15000 },
]

const transactions: CalTransaction[] = [
  { id: 1, calFundId: 1, fundName: "FIOF", type: "INVEST", amount: 50000, transactionDate: "2024-01-15T10:30:00" },
  { id: 2, calFundId: 1, fundName: "FIOF", type: "INVEST", amount: 50000, transactionDate: "2024-03-20T14:00:00" },
  { id: 3, calFundId: 1, fundName: "FIOF", type: "REDEEM", amount: 10000, transactionDate: "2024-06-10T09:15:00" },
  { id: 4, calFundId: 2, fundName: "NAMAL Growth", type: "INVEST", amount: 80000, transactionDate: "2024-02-01T11:00:00" },
  { id: 5, calFundId: 3, fundName: "Ceybank Unit Trust", type: "INVEST", amount: 50000, transactionDate: "2024-04-05T13:00:00" },
  { id: 6, calFundId: 4, fundName: "91-Day T-Bill", type: "INVEST", amount: 200000, transactionDate: "2024-01-10T09:00:00" },
  { id: 7, calFundId: 5, fundName: "182-Day T-Bill", type: "INVEST", amount: 150000, transactionDate: "2024-03-01T10:00:00" },
  { id: 8, calFundId: 6, fundName: "2-Year Treasury Bond", type: "INVEST", amount: 300000, transactionDate: "2023-12-01T09:00:00" },
  { id: 9, calFundId: 7, fundName: "5-Year Treasury Bond", type: "INVEST", amount: 250000, transactionDate: "2023-10-01T09:00:00" },
]

const growthHistory = [
  { date: "Jan", value: 800000 },
  { date: "Feb", value: 850000 },
  { date: "Mar", value: 920000 },
  { date: "Apr", value: 890000 },
  { date: "May", value: 960000 },
  { date: "Jun", value: 1010000 },
  { date: "Jul", value: 1050000 },
  { date: "Aug", value: 1080000 },
  { date: "Sep", value: 1100000 },
  { date: "Oct", value: 1150000 },
  { date: "Nov", value: 1180000 },
  { date: "Dec", value: 1215000 },
]

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981"]

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })

// ─── Fund Transaction Panel ───────────────────────────────────
function FundTransactionPanel({
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
      {/* Panel header */}
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

      {/* Transactions table */}
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

// ─── Fund Card ────────────────────────────────────────────────
function FundCard({
  fund,
  selected,
  onClick,
}: {
  fund: CalFund
  selected: boolean
  onClick: () => void
}) {
  const isProfit = fund.totalProfit >= 0

  return (
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
              variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={e => { e.stopPropagation(); /* TODO: invest */ }}
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-red-50"
              onClick={e => { e.stopPropagation(); /* TODO: redeem */ }}
            >
              <ArrowUpFromLine className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Current Value</p>
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
  )
}

// ─── Category Tab Content ─────────────────────────────────────
function CategoryTab({ category }: { category: CalAssetCategory }) {
  const categoryFunds = funds.filter(f => f.category === category)
  const [selectedFund, setSelectedFund] = useState<CalFund | null>(null)

  const handleFundClick = (fund: CalFund) => {
    setSelectedFund(prev => prev?.id === fund.id ? null : fund)
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Fund cards grid */}
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

      {/* Transaction panel — shown when fund is selected */}
      {selectedFund && (
        <FundTransactionPanel
          fund={selectedFund}
          onClose={() => setSelectedFund(null)}
        />
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function UnitTrustDetail({ id, name }: { id: number; name: string }) {
  const router = useRouter()

  // ── Summary calculations ──
  const totalInvested = funds.reduce((s, f) => s + f.totalInvested, 0)

  const unitTrustProfit = funds
    .filter(f => f.category === "UNIT_TRUST")
    .reduce((s, f) => s + f.totalProfit, 0)

  const tBillProfit = funds
    .filter(f => f.category === "T_BILL")
    .reduce((s, f) => s + f.totalProfit, 0)

  const bondProfit = funds
    .filter(f => f.category === "BOND")
    .reduce((s, f) => s + f.totalProfit, 0)

  const unitTrustTotal = funds.filter(f => f.category === "UNIT_TRUST").reduce((s, f) => s + f.totalInvested, 0)
  const tBillTotal = funds.filter(f => f.category === "T_BILL").reduce((s, f) => s + f.totalInvested, 0)
  const bondTotal = funds.filter(f => f.category === "BOND").reduce((s, f) => s + f.totalInvested, 0)

  const pieData = [
    { name: "Unit Trust", value: Math.round((unitTrustTotal / totalInvested) * 100) },
    { name: "T-Bill", value: Math.round((tBillTotal / totalInvested) * 100) },
    { name: "Bond", value: Math.round((bondTotal / totalInvested) * 100) },
  ]

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
            <p className="text-sm text-muted-foreground">Investment Portfolio</p>
          </div>
        </div>
      </div>

      {/* Top KPI cards + pie chart */}
      <div className="grid grid-cols-5 gap-4">

        {/* KPI cards */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Invested</p>
            <p className="text-lg font-semibold mt-1">{fmt(totalInvested)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Unit Trust Profit</p>
            <p className={`text-lg font-semibold mt-1 ${unitTrustProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
              {unitTrustProfit >= 0 ? "+" : ""}{fmt(unitTrustProfit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">T-Bill Profit</p>
            <p className={`text-lg font-semibold mt-1 ${tBillProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
              {tBillProfit >= 0 ? "+" : ""}{fmt(tBillProfit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Bond Profit</p>
            <p className={`text-lg font-semibold mt-1 ${bondProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
              {bondProfit >= 0 ? "+" : ""}{fmt(bondProfit)}
            </p>
          </CardContent>
        </Card>

        {/* Pie chart card */}
        <Card>
          <CardContent className="pt-2 pb-2">
            <p className="text-xs text-muted-foreground mb-1">Distribution</p>
            <div className="flex items-center gap-2">
              <ResponsiveContainer width={80} height={80}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={36} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
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

      {/* Growth chart */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium">Account Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthHistory}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="UNIT_TRUST">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="UNIT_TRUST">Unit Trust</TabsTrigger>
            <TabsTrigger value="T_BILL">T-Bill</TabsTrigger>
            <TabsTrigger value="BOND">Bond</TabsTrigger>
          </TabsList>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Create Fund
          </Button>
        </div>

        <TabsContent value="UNIT_TRUST">
          <CategoryTab category="UNIT_TRUST" />
        </TabsContent>
        <TabsContent value="T_BILL">
          <CategoryTab category="T_BILL" />
        </TabsContent>
        <TabsContent value="BOND">
          <CategoryTab category="BOND" />
        </TabsContent>
      </Tabs>
    </div>
  )
}