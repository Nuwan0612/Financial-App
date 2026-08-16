"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell,
} from "recharts"

import { funds, growthHistory, PIE_COLORS } from "./constants"
import { fmt } from "./helpers"
import { CategoryTab } from "./CategoryTab"
import { AddCalFundDialog } from "./Dialogs" // Adjust import path if needed
import { bucketsApi } from "@/lib/api/accounts"
import { calFundsApi } from "@/lib/api/cal"
 // Adjust import path to where bucketsApi is defined

export default function UnitTrustDetail({ id, name }: { id: number; name: string }) {
  const router = useRouter()

  // ── Dialog & API State ──
  const [showAddFund, setShowAddFund] = useState(false)
  const [bucket, setBucket] = useState<any | null>(null)
  const [isLoadingBucket, setIsLoadingBucket] = useState(true)

  const [funds, setFunds] = useState<any[]>([]) // Replace 'any' with your fund type if available

  useEffect(() => {
    setIsLoadingBucket(true) // (You might want to rename this state to just 'isLoading' since it now loads both)

    Promise.all([
      bucketsApi.getBucketsByAccount(id),
      calFundsApi.getAll()
    ])
      .then(([bucketsRes, fundsRes]) => {
        // 1. Handle Bucket Data
        if (bucketsRes.data && bucketsRes.data.length > 0) {
          setBucket(bucketsRes.data[0]) 
        }

        // 2. Handle Funds Data (Filter by account ID immediately)
        const accountFunds = fundsRes.data.filter(fund => fund.accountId === Number(id))
        setFunds(accountFunds)
      })
      .catch((error) => console.error("Failed to fetch account data", error))
      .finally(() => setIsLoadingBucket(false))
  }, [id])

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
    { name: "Unit Trust", value: totalInvested > 0 ? Math.round((unitTrustTotal / totalInvested) * 100) : 0 },
    { name: "T-Bill", value: totalInvested > 0 ? Math.round((tBillTotal / totalInvested) * 100) : 0 },
    { name: "Bond", value: totalInvested > 0 ? Math.round((bondTotal / totalInvested) * 100) : 0 },
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
          
          {/* Create Fund Button */}
          <Button 
            size="sm" 
            className="gap-1.5" 
            onClick={() => setShowAddFund(true)}
            disabled={isLoadingBucket}
          >
            <Plus className="h-4 w-4" /> Create Fund
          </Button>
        </div>

        <TabsContent value="UNIT_TRUST">
          <CategoryTab funds={funds.filter(f => f.category === "UNIT_TRUST")} />
        </TabsContent>
        <TabsContent value="T_BILL">
          <CategoryTab funds={funds.filter(f => f.category === "T_BILL")} />
        </TabsContent>
        <TabsContent value="BOND">
          <CategoryTab funds={funds.filter(f => f.category === "BOND")} />
        </TabsContent>
      </Tabs>

      <AddCalFundDialog
        open={showAddFund}
        onClose={() => setShowAddFund(false)}
        accountId={id}
        accountName={name} 
        bucketId={bucket?.id}
        bucketName={bucket?.name || ""}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}