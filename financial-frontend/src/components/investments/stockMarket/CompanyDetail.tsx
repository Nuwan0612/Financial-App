"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Pencil, Loader2, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { investmentCompaniesApi, InvestmentCompany } from "@/lib/api/stockMarket"
import { tradesApi, metricsApi, TradeTransaction, CompanyMetric } from "@/lib/api/stockMarket" // Import your new API calls here
import { fmt, fmtNum } from "./utils"
import { AddTradeDialog } from "./AddDialogs"
import { useParams } from "next/navigation"
import { accountsApi, bucketsApi, Bukets } from "@/lib/api/accounts"
import { Account } from "@/lib/api/accounts"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function CompanyDetail({
  investmentCompany,
  onBack,
  onRefresh
}: {
  investmentCompany: InvestmentCompany
  onBack: () => void
  onRefresh: () => void;
}) {

  const params = useParams()
  const accountId = Number(params.id)

  const [account, setAccount] = useState<Account | null>(null) 
  const [buckets, setBuckets] = useState<Bukets[]>([])

  // --- Data Fetching State ---
  const [metric, setMetric] = useState<CompanyMetric | null>(null)
  const [companyTrades, setCompanyTrades] = useState<TradeTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTrade, setShowAddTrade] = useState(false)

  const [showPriceDialog, setShowPriceDialog] = useState(false)
  const [newPrice, setNewPrice] = useState<string>(String(investmentCompany.currentPrice))
  const [updatingPrice, setUpdatingPrice] = useState(false)

  useEffect(() => {
    setLoading(true)
    // Fetch both metrics and trades in parallel
    Promise.all([
      metricsApi.getByCompany(investmentCompany.id).catch(() => null), 
      tradesApi.getByCompany(investmentCompany.id).catch(() => ({ data: [] })),
      accountsApi.getAccountById(accountId).catch(() => null), 
      bucketsApi.getBucketsByAccount(accountId).catch(() => ({ data: [] })) 
    ]).then(([metricRes, tradesRes, accountRes, bucketsRes]) => {
      if (metricRes && metricRes.data) setMetric(metricRes.data)
      if (tradesRes && tradesRes.data) setCompanyTrades(tradesRes.data)
      if (accountRes && accountRes.data) setAccount(accountRes.data)
      if (bucketsRes && bucketsRes.data) setBuckets(bucketsRes.data)
    }).finally(() => {
      setLoading(false)
    })
  }, [investmentCompany.id, accountId])

  const handleDeleteTrade = async (tradeId: number, bucketid: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await tradesApi.delete(tradeId, bucketid);
      setCompanyTrades(prev => prev.filter(t => t.id !== tradeId));
    } catch (error) {
      console.error("Failed to delete trade");
    }
  }

  const handleUpdatePrice = async () => {
    if (!newPrice || Number(newPrice) <= 0) return;

    try {
      setUpdatingPrice(true)
      // Call your backend PATCH endpoint
      await investmentCompaniesApi.updatePrice(investmentCompany.id, Number(newPrice), accountId)
      
      // Refresh the page to pull the newly calculated P&L and metrics from the backend
      window.location.reload()
    } catch (error) {
      console.error("Failed to update price", error)
    } finally {
      setUpdatingPrice(false)
    }
  }

  // --- Dynamic Financial Calculations from the backend fields ---
  const totalInvested = investmentCompany.totalInvestedAmount
  const pnl = investmentCompany.totalProfit
  const pnlPct = totalInvested > 0 ? ((pnl / totalInvested) * 100).toFixed(2) : "0.00"
  const isProfit = pnl >= 0
  
  const avgCost = investmentCompany.totalActiveShares > 0 
      ? totalInvested / investmentCompany.totalActiveShares 
      : 0

  // Live calculator state
  const [calcForm, setCalcForm] = useState({
    stockPrice: String(investmentCompany.currentPrice),
    netIncome: "",
    sharesOutstanding: "",
    totalDividends: "",
  })

  // Live calculator logic
  const eps = calcForm.netIncome && calcForm.sharesOutstanding
    ? Number(calcForm.netIncome) / Number(calcForm.sharesOutstanding)
    : null
  const pe = eps && calcForm.stockPrice ? Number(calcForm.stockPrice) / eps : null
  const divYield = calcForm.totalDividends && calcForm.sharesOutstanding && calcForm.stockPrice
    ? ((Number(calcForm.totalDividends) / Number(calcForm.sharesOutstanding)) / Number(calcForm.stockPrice)) * 100
    : null

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
              <h1 className="text-2xl font-semibold">{investmentCompany.symbol}</h1>
              <Badge variant="secondary">{investmentCompany.sectorName}</Badge>
              {investmentCompany.isSp20 && <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">S&P 20</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{investmentCompany.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-xs text-muted-foreground">Current Price</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-semibold">LKR {fmtNum(investmentCompany.currentPrice)}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => {
                  setNewPrice(String(investmentCompany.currentPrice)) // Reset to current price on open
                  setShowPriceDialog(true)
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Shares Owned</p>
            <p className="text-lg font-semibold">{investmentCompany.totalActiveShares.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Cost</p>
            <p className="text-lg font-semibold">LKR {fmtNum(avgCost)}</p>
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

      <Tabs defaultValue="trades">
        <TabsList>
          <TabsTrigger value="trades">Transaction Ledger</TabsTrigger>
          <TabsTrigger value="metrics">Metrics & Ratios</TabsTrigger>
        </TabsList>

        <TabsContent value="trades" className="mt-6 space-y-4">

          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Transaction History</h2>
            <Button size="sm" onClick={() => setShowAddTrade(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-28">Date</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-20">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-28">Quantity</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Price</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Total</th>
                  {/* <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-24">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {companyTrades.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      No trades recorded for this company.
                    </td>
                  </tr>
                ) : companyTrades.map(trade => {
                  const tradeDate = new Date(trade.transactionDate).toLocaleDateString()
                  
                  return (
                  <tr key={trade.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 border border-border text-muted-foreground text-xs">{tradeDate}</td>
                    <td className="px-4 py-3 border border-border text-center">
                      <Badge className={trade.type === "BUY"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"}>
                        {trade.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums">{trade.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums">LKR {fmtNum(trade.executionPrice)}</td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums font-medium">
                      {fmt(trade.investmentAmount)}
                    </td>
                    {/* <td className="px-4 py-3 border border-border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteTrade(trade.id, buckets[0].id)} 
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td> */}
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Saved metrics from Backend */}
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
                    { label: "EPS", value: metric.eps ? `LKR ${fmtNum(metric.eps)}` : "—" },
                    { label: "P/E Ratio", value: metric.peRatio ? fmtNum(metric.peRatio) : "—" },
                    { label: "Pays Dividends", value: metric.isDividendPaying ? "Yes" : "No" },
                    { label: "S&P 20 Member", value: investmentCompany.isSp20 ? "Yes" : "No" },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg border border-border p-3 bg-card">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-base font-semibold mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-8 text-center flex flex-col justify-center items-center h-[200px]">
                <p className="text-sm text-muted-foreground">No metrics saved yet for this company.</p>
                <Button size="sm" className="mt-3 gap-1.5">
                  <Plus className="h-3 w-3" /> Add Metrics
                </Button>
              </div>
            )}

            {/* Live calculator (UI Only) */}
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
      </Tabs>

      <AddTradeDialog
        open={showAddTrade}
        onClose={() => setShowAddTrade(false)}
        companyId={investmentCompany.id}
        
        // Pass the extracted and fetched data here
        accountId={accountId}
        accountName={account?.name || "Loading..."}
        bucketId={buckets.length > 0 ? buckets[0].id : 0} 
        bucketName={buckets.length > 0 ? buckets[0].name : "Loading..."}
        currentPrice={investmentCompany.currentPrice}
        buyingPower={buckets.length > 0 ? buckets[0].currentAmount : 0}
        totalActiveShares={investmentCompany.totalActiveShares}
        
        onSuccess={(newTrade) => {
          // 1. Add the trade to the local list so it shows in the table
          setCompanyTrades(prev => [newTrade, ...prev])
          
          // 2. Silently fetch fresh backend data to update shares, P&L, and buckets
          onRefresh() 
        }}

        // onSuccess={() => window.location.reload()}
        // onSuccess={(newTrade) => setCompanyTrades(prev => [newTrade, ...prev])}
      />

      {/* Update Price Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Current Price</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-price">New Market Price (LKR)</Label>
              <Input
                id="new-price"
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceDialog(false)} disabled={updatingPrice}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrice} disabled={updatingPrice}>
              {updatingPrice && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save & Refresh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}