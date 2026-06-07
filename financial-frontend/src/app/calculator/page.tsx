"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, PlusCircle } from "lucide-react"
import { SubCategory, subCategoryApi, transactionApi, TransactionDto } from "@/lib/api/allocations"


const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(n)

function groupByMain(items: SubCategory[]) {
  const map = new Map<string, SubCategory[]>()
  for (const item of items) {
    const key = item.mainCategoryName
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  return map
}

// ─── Success Toast ────────────────────────────────────────────
function SuccessToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 shadow-lg animate-in slide-in-from-bottom-4">
      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────
const FinanceCalculatorPage = () => {
  const [total, setTotal] = useState<number>(0)
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    subCategoryApi.getAll()
      .then(res => setSubCategories(res.data))
      .catch(() => console.error("Failed to fetch subcategories"))
      .finally(() => setLoading(false))
  }, [])

  const grouped = groupByMain(subCategories)

  const mainTotals = new Map<string, number>()
  for (const [main, items] of grouped) {
    mainTotals.set(main, items.reduce((s, i) => s + i.percentage, 0))
  }

  const grandTotalPct = subCategories.reduce((s, i) => s + i.percentage, 0)

  const handleAddAllToTransaction = async () => {
  try {
    setAddingId(-1)
    const today = new Date().toISOString().split("T")[0]

    const transactions: TransactionDto[] = subCategories.map(item => ({
      description: `${item.name} allocation`,
      amount: (total * item.percentage) / 100,
      openingDate: today,
      fromAccountId: null,   
      fromBucketId: null,
      toAccountId: item.accountId,
      toBucketId: item.id,  
    }))

    await transactionApi.createBulk(transactions)
    setToast(`${transactions.length} transactions added for LKR ${fmt(total)}`)
    } catch {
      setToast("Failed to add transactions.")
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Allocation Calculator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your total income to see how it gets distributed.
        </p>
      </div>

      {/* Total input card */}
      {/* Total input card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-6">
            
            <div className="flex items-center gap-6">
              <div className="space-y-1.5 w-72">
                <Label htmlFor="total">Total Amount (LKR)</Label>
                <Input
                  id="total"
                  type="number"
                  placeholder="e.g. 150000"
                  value={total || ""}
                  onChange={e => setTotal(Number(e.target.value))}
                  className="text-lg font-semibold"
                />
              </div>
              <div className="flex gap-8 pt-5">
                <div>
                  <p className="text-xs text-muted-foreground">Total Allocated</p>
                  <p className="text-lg font-semibold">{fmt(grandTotalPct)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Distributed Amount</p>
                  <p className="text-lg font-semibold text-primary">
                    LKR {fmt((total * grandTotalPct) / 100)}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Button moved here ── */}
            <div className="pt-5">
              <Button
                disabled={!total || addingId !== null}
                onClick={() => handleAddAllToTransaction()}
                className="gap-2"
              >
                {addingId !== null ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                Add to Transactions
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-40">
                  Main Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">
                  Sub Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-32">
                  Account
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-24">
                  %
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-24">
                  Group %
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                  Amount (LKR)
                </th>
              </tr>
            </thead>
            <tbody>
              {[...grouped.entries()].map(([mainName, items]) => {
                const mainPct = mainTotals.get(mainName) ?? 0
                const mainAmount = (total * mainPct) / 100

                return items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">

                    {/* Main category — rowSpan groups the rows visually */}
                    {idx === 0 && (
                      <td
                        rowSpan={items.length}
                        className="px-4 py-3 font-medium border border-border align-middle bg-muted/10"
                      >
                        <span className="block">{mainName}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {mainPct}%
                        </span>
                      </td>
                    )}

                    <td className="px-4 py-3 border border-border">{item.name}</td>

                    <td className="px-4 py-3 border border-border text-muted-foreground text-xs">
                      {item.accountName}
                    </td>

                    <td className="px-4 py-3 border border-border text-right tabular-nums">
                      {item.percentage}%
                    </td>

                    {/* Group % — rowSpan */}
                    {idx === 0 && (
                      <td
                        rowSpan={items.length}
                        className="px-4 py-3 border border-border text-right font-medium tabular-nums align-middle bg-muted/10"
                      >
                        {mainPct}%
                        <span className="block text-xs text-muted-foreground font-normal">
                          LKR {fmt(mainAmount)}
                        </span>
                      </td>
                    )}

                    <td className="px-4 py-3 border border-border text-right tabular-nums font-medium">
                      {fmt((total * item.percentage) / 100)}
                    </td>
                  </tr>
                ))
              })}

              {/* Grand total */}
              <tr className="bg-muted/50 font-semibold">
                <td className="px-4 py-3 border border-border" colSpan={3}>
                  Total
                </td>
                <td className="px-4 py-3 border border-border text-right tabular-nums">
                  {fmt(grandTotalPct)}%
                </td>
                <td className="px-4 py-3 border border-border text-right tabular-nums">
                  {fmt(grandTotalPct)}%
                </td>
                <td className="px-4 py-3 border border-border text-right tabular-nums">
                  LKR {fmt((total * grandTotalPct) / 100)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <SuccessToast message={toast} onDone={() => setToast(null)} />
      )}
    </div>
  )
}

export default FinanceCalculatorPage