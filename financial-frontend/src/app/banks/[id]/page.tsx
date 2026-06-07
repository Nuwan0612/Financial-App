"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { bucketsApi, Bukets, Snapshots, snapshotsApi } from "@/lib/api/accounts"
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from "recharts"

const COLORS = [
  'var(--chart-1)', 
  'var(--chart-2)', 
  'var(--chart-3)', 
  'var(--chart-4)', 
  'var(--chart-5)'
];

const PAGE_SIZE = 10

const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length && label) {
    const formattedDate = typeof label === 'string' 
      ? label.split('T')[0] 
      : new Date(label).toISOString().split('T')[0];

    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-md">
        <p className="text-xs text-muted-foreground mb-1">{formattedDate}</p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <p className="text-sm font-medium text-foreground">
            Balance: <span className="font-semibold">{fmt(payload[0].value)}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}


const BankDetailsPage = () => {
  const { id } = useParams()

  const [buckets, setBuckets] = useState<any[]>([]) // Using any[] here to avoid type errors, replace with your Bukets type
  const [snapshot, setSnapshot] = useState<any[]>([]) // Replace with your Snapshots type
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchBucketsDetails = async () => {
      try {
        const res = await bucketsApi.getBucketsByAccount(Number(id))
        setBuckets(res.data)
        const snapshotRes = await snapshotsApi.getSnapshotsByAccount(Number(id))
        setSnapshot(snapshotRes.data)
        console.log("Fetched Buckets:", res.data)
        console.log("Fetched Snapshots:", snapshotRes.data)
      } catch (error) {
        console.error("Failed to fetch bank details", error)
      }
    }
    fetchBucketsDetails()
  }, [id])

  // --- Calculations ---
  const totalCurrentLKR = buckets.reduce((s, b) => s + b.currentAmount, 0)
  const totalCumulativeLKR = buckets.reduce((s, b) => s + b.cumulativeAmount, 0)
  
  const earliestDate = snapshot.length > 0
      ? snapshot.reduce((earliest, s) => s.date < earliest ? s.date : earliest, snapshot[0].date.split("T")[0])
      : null

  // --- Chart Data Preparation ---
  // 1. Pie Chart Data (Filter out empty buckets so they don't clutter the chart)
  const pieData = buckets
    .filter(b => b.currentAmount > 0)
    .map((b, index) => ({
      name: b.name,
      value: b.currentAmount,
      fill: COLORS[index % COLORS.length]
    }))

// 2. Area Chart Data (Sort by date ascending)
  const chartData = [...snapshot]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(s => ({
      rawDate: s.date, // Pass the exact database string so they don't overlap
      amount: Number(s.balance || 0) 
    }))

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(buckets.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = buckets.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1200px" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold">Bank Account: {buckets[0]?.accountName || "Loading..."}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your bank account details.
          </p>
        </div>
      </div>

      {/* Existing Summary Cards (Hydration Error Fixed!) */}
      <div className="rounded-lg border border-border overflow-hidden bg-card mb-2">
        <div className="flex items-center divide-x divide-border">
          <div className="px-6 py-4 flex-1">
            <p className="text-xs text-muted-foreground mb-1">Total Current Balance (LKR)</p>
            <p className="text-xl font-semibold">{fmt(totalCurrentLKR)}</p>
          </div>
          <div className="px-6 py-4 flex-1">
            <p className="text-xs text-muted-foreground mb-1">Total Cumulative Amount (LKR)</p>
            <p className="text-xl font-semibold flex items-center gap-1">
              {fmt(totalCumulativeLKR)} 
            </p>
          </div>
          <div className="px-6 py-4 flex-1">
            <p className="text-xs text-muted-foreground mb-1">Tracking Since</p>
            <p className="text-xl font-semibold">{earliestDate ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* --- NEW: Charts Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left: Pie Chart (Bucket Percentages) */}
        <Card className="lg:col-span-1 shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Allocation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="h-62.5 flex items-center justify-center text-sm text-muted-foreground">
                No funded buckets yet.
              </div>
            ) : (
              <div className="h-62.5 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any) => {
                        const amount = Number(value) || 0;
                        // Calculate percentage and format to 1 decimal place (e.g., 45.2%)
                        const percentage = totalCurrentLKR > 0 
                          ? ((amount / totalCurrentLKR) * 100).toFixed(1) 
                          : "0.0";
                          
                        // Returns: "45.2% (Rs. 5,000)" so the user sees both!
                        return `${percentage}% (${fmt(amount)})`;
                      }}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid var(--border)', 
                        backgroundColor: 'var(--background)', 
                        color: 'var(--foreground)' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Area Chart (Bank Amount Over Time) */}
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Total Balance History</CardTitle>
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
                    <RechartsTooltip content={<CustomAreaTooltip />} />
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
      </div>

      {/* Table (Completely Unchanged) */}
      {buckets.length === 0 ? (
        <div className="rounded-lg border border-border py-16 text-center">
          <p className="text-muted-foreground text-sm">No Buckets found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">Name</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Current Balance (LKR)</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Cumulative Balance (LKR)</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-32">Actions</th>
              </tr>
            </thead>
            
            <tbody>
              {paginated.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 border border-border font-medium">{item.name}</td>
                    <td className="px-4 py-3 border border-border text-right font-medium tabular-nums">
                      {fmt(item.currentAmount)}
                    </td>
                    <td className="px-4 py-3 border border-border text-right font-medium tabular-nums">
                      {fmt(item.cumulativeAmount)}
                    </td>
                    <td className="px-4 py-3 border border-border text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Pagination Footer */}
            <tfoot>
              <tr className="bg-muted/30 border-t border-border">
                <td colSpan={5} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, buckets.length)}–{Math.min(safePage * PAGE_SIZE, buckets.length)} of {buckets.length}
                    </p>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="h-7 w-7"
                        disabled={safePage === 1} onClick={() => setPage(p => p - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs font-medium tabular-nums">
                        Page {safePage} / {totalPages}
                      </span>
                      <Button variant="outline" size="icon" className="h-7 w-7"
                        disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export default BankDetailsPage