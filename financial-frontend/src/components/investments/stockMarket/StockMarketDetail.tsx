// src/components/investments/StockMarketDetail.tsx
"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Loader2, Plus, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Area, AreaChart, CartesianGrid } from "recharts"

import { fmt, fmtNum, SECTOR_COLORS } from "./utils"
import CompanyDetail from "./CompanyDetail"
import MetricGuide from "./MetricGuide"
import { AddCompanyDialog, SectorDialog } from "./AddDialogs"

import { investmentCompaniesApi, InvestmentCompany } from "@/lib/api/stockMarket"
import { bucketsApi, snapshotsApi } from "@/lib/api/accounts"


export default function StockMarketDetail({
id, name,
}: {
  id: number
  name: string
}) {
  const router = useRouter()
  const [selectedHolding, setSelectedHolding] = useState<InvestmentCompany | null>(null)
  const [calcForm, setCalcForm] = useState({
    stockPrice: "", netIncome: "", sharesOutstanding: "", totalDividends: "",
  })
  const [sectorFilter, setSectorFilter] = useState<string>("ALL")
  const [symbolSearch, setSymbolSearch] = useState<string>("")
  const [showSectorDialog, setShowSectorDialog] = useState(false)

  const [companies, setCompanies] = useState<InvestmentCompany[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [showAddCompany, setShowAddCompany] = useState(false)

  const [buyingPower, setBuyingPower] = useState(0) 
  const [snapshot, setSnapshot] = useState<any[]>([])

  useEffect(() => {
    setCompaniesLoading(true)

    Promise.all([
      investmentCompaniesApi.getAll(),
      bucketsApi.getBucketsByAccount(Number(id)),
      snapshotsApi.getSnapshotsByAccount(Number(id)) 
    ])
      .then(([companiesRes, bucketsRes, snapshotRes]) => {
        setCompanies(companiesRes.data)
        
        const currentBuyingPower = bucketsRes.data.length > 0 ? bucketsRes.data[0].currentAmount : 0
        setBuyingPower(currentBuyingPower)
        
        // Save the snapshots to state
        setSnapshot(snapshotRes.data)
      })
      .catch((error) => console.error("Failed to fetch data", error))
      .finally(() => setCompaniesLoading(false))
  }, [id])

  const refreshData = () => {
    Promise.all([
      investmentCompaniesApi.getAll(),
      bucketsApi.getBucketsByAccount(Number(id)) 
    ])
      .then(([companiesRes, bucketsRes]) => {
        // 1. Update the master lists
        setCompanies(companiesRes.data)
        const currentBuyingPower = bucketsRes.data.length > 0 ? bucketsRes.data[0].currentAmount : 0
        setBuyingPower(currentBuyingPower)
        
        // 2. Update the currently viewed company so the UI instantly changes!
        if (selectedHolding) {
          const updatedCompany = companiesRes.data.find(c => c.id === selectedHolding.id)
          if (updatedCompany) {
            setSelectedHolding(updatedCompany)
          }
        }
      })
      .catch((error) => console.error("Failed to refresh data", error))
  }

  if (selectedHolding) {
    return (
      <CompanyDetail 
        investmentCompany={selectedHolding} 
        onBack={() => setSelectedHolding(null)} 
        onRefresh={refreshData} 
      />
    )
  }

  // if (selectedHolding) {
  //   return <CompanyDetail investmentCompany={selectedHolding} onBack={() => setSelectedHolding(null)} />
  // }

  const totalValue = companies.reduce((s, c) => s + c.currentTotalValue, 0)
  const totalInvested = companies.reduce((s, c) => s + c.totalInvestedAmount, 0)
  const totalPnL = companies.reduce((s, c) => s + c.totalProfit, 0)

  const sectors = ["ALL", ...Array.from(new Set(companies.map(c => c.sectorName)))]

  const chartData = [...snapshot]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(s => ({
      rawDate: s.date, 
      amount: Number(s.balance || 0) 
    }))

  const CustomPortfolioTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-md">
          <p className="text-xs text-muted-foreground mb-1">
            {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-sm font-semibold text-primary">
            Portfolio Value: {fmt(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };


  const filteredCompanies = companies.filter(c => {
    const matchesSector = sectorFilter === "ALL" || c.sectorName === sectorFilter
    const matchesSymbol = c.symbol.toLowerCase().includes(symbolSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(symbolSearch.toLowerCase())
      
    const isCompanyActive = c.isActive !== false // Failsafe in case it is strictly false
    
    return matchesSector && matchesSymbol && isCompanyActive
  })

  const sectorPnL = Array.from(new Set(companies.map(c => c.sectorName))).map(sector => {
    const pnl = companies
      .filter(c => c.sectorName === sector)
      .reduce((s, c) => s + c.totalProfit, 0)
    return { name: sector, pnl: Math.round(pnl) }
  })

  // Calculate dynamic sector allocation based on current total value
  const dynamicSectorData = Array.from(new Set(companies.map(c => c.sectorName))).map(sector => {
    const sectorTotalValue = companies
      .filter(c => c.sectorName === sector)
      .reduce((sum, c) => sum + c.currentTotalValue, 0)
    
    // Calculate percentage (avoid division by zero)
    const percentage = totalValue > 0 ? (sectorTotalValue / totalValue) * 100 : 0

    return { 
      name: sector, 
      value: Number(percentage.toFixed(1)) // Rounds to 1 decimal place (e.g., 24.5)
    }
  }).filter(data => data.value > 0) // Hide sectors that have 0% allocation


  const eps = calcForm.netIncome && calcForm.sharesOutstanding
    ? Number(calcForm.netIncome) / Number(calcForm.sharesOutstanding) : null
  const pe = eps && calcForm.stockPrice ? Number(calcForm.stockPrice) / eps : null
  const divYield = calcForm.totalDividends && calcForm.sharesOutstanding && calcForm.stockPrice
    ? ((Number(calcForm.totalDividends) / Number(calcForm.sharesOutstanding)) / Number(calcForm.stockPrice)) * 100 : null

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1400px" }}>
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
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowSectorDialog(true)}>
            <Plus className="h-4 w-4" /> New Sector
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowAddCompany(true)}>
            <Zap className="h-4 w-4" /> Add Company
          </Button>
        </div>
      </div>

      <Tabs defaultValue="portfolio">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio Summary</TabsTrigger>
          <TabsTrigger value="fundamentals">Fundamentals Lab</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-6 space-y-6">
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  No history available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
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
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} 
                      dy={10}
                      tickFormatter={(value) => {
                        return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomPortfolioTooltip />} cursor={{ stroke: 'var(--muted)', strokeWidth: 1, strokeDasharray: '4 4' }} />
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
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Sector Allocation</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    {/* Replaced sectorData with dynamicSectorData */}
                    <Pie 
                      data={dynamicSectorData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={45} 
                      outerRadius={70} 
                      dataKey="value"
                      nameKey="name"
                    >
                      {dynamicSectorData.map((_, i) => (
                        <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                      ))}
                    </Pie>
                    {/* Added the name to the tooltip payload so it shows "Technology: 45%" */}
                    <Tooltip formatter={(value, name) => [`${Number(value) || 0}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Sector P&L</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={sectorPnL} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                    <Tooltip formatter={(v) => fmt(Math.abs(Number(v) || 0))} />
                    <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                      {sectorPnL.map((entry, i) => (
                        <Cell key={i} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium">Active Holdings</h2>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search symbol or name..."
                    value={symbolSearch}
                    onChange={e => setSymbolSearch(e.target.value)}
                    className="h-8 text-xs w-48"
                  />
                  <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger className="h-8 text-xs w-40">
                      <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map(s => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s === "ALL" ? "All Sectors" : s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">Symbol</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-24">Sector</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-20">S&P 20</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-20">Shares</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-28">Avg Cost</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-28">Current</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-32">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companiesLoading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                        </td>
                      </tr>
                    ) : filteredCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">
                          No holdings match your filter.
                        </td>
                      </tr>
                    ) : filteredCompanies.map(c => {
                      const avgCost = c.totalActiveShares > 0
                        ? c.totalInvestedAmount / c.totalActiveShares
                        : 0
                      const isProfit = c.totalProfit >= 0

                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => setSelectedHolding(c)}   // ← update selectedHolding type too
                        >
                          <td className="px-4 py-3 border border-border font-semibold text-primary">{c.symbol}</td>
                          <td className="px-4 py-3 border border-border">{c.name}</td>
                          <td className="px-4 py-3 border border-border">
                            <Badge variant="outline" className="text-xs">{c.sectorName}</Badge>
                          </td>
                          <td className="px-4 py-3 border border-border text-center">
                            {c.isSp20 ? (
                              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">Yes</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 border border-border text-right tabular-nums">
                            {c.totalActiveShares.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 border border-border text-right tabular-nums text-muted-foreground">
                            {fmtNum(avgCost)}
                          </td>
                          <td className="px-4 py-3 border border-border text-right tabular-nums font-medium">
                            {fmtNum(c.currentPrice)}
                          </td>
                          <td className={`px-4 py-3 border border-border text-right tabular-nums font-medium
                            ${isProfit ? "text-green-600" : "text-destructive"}`}>
                            {isProfit ? "+" : "-"}{fmt(Math.abs(c.totalProfit))}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fundamentals" className="mt-6">
          <div className="grid grid-cols-2 gap-8">
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

      <SectorDialog
        open={showSectorDialog}
        onClose={() => setShowSectorDialog(false)}
      />

      <AddCompanyDialog
        open={showAddCompany}
        onClose={() => setShowAddCompany(false)}
        onAdded={company => setCompanies(prev => [...prev, company])}
      />
    </div>
  )
}