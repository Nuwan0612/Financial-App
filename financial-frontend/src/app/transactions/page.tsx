"use client"

import { useState, useEffect, useCallback } from "react"
import { CheckCircle2, Clock, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { transactionApi, Transaction } from "@/lib/api/allocations"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(n)

const PAGE_SIZE = 10

function Toast({
  message, type = "success", onDone,
}: {
  message: string; type?: "success" | "error"; onDone: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 shadow-lg animate-in slide-in-from-bottom-4">
      {type === "success"
        ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
        : <Clock className="h-5 w-5 text-destructive shrink-0" />}
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [tab, setTab] = useState<"pending" | "completed">("pending")
  const [page, setPage] = useState(1)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await transactionApi.getAll()
      setTransactions(res.data)
    } catch {
      setToast({ message: "Failed to load transactions.", type: "error" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])
  useEffect(() => { setPage(1) }, [tab])

  const pending = transactions.filter(t => !t.status)
  const completed = transactions.filter(t => t.status).reverse() 
  const activeList = tab === "pending" ? pending : completed

  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = activeList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // const colCount = tab === "pending" ? 10 : 9 
  const colCount = 10

  const [processingId, setProcessingId] = useState<number | null>(null)

  const handleMarkSuccess = async (id: number, description: string) => {
    try {
      setProcessingId(id)
      await transactionApi.markSuccess(id)
      setTransactions(prev =>
        prev.map(t => t.id === id
          ? { ...t, status: true, closingDate: new Date().toISOString().split("T")[0] }
          : t
        )
      )
      setToast({ message: `"${description}" marked as completed.`, type: "success" })
    } catch {
      setToast({ message: "Failed to mark as complete.", type: "error" })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1600px" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pending.length} pending · {completed.length} completed
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={v => setTab(v as "pending" | "completed")}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pending.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-500/20 text-amber-600 text-xs px-1.5 py-0.5 font-medium">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completed.length > 0 && (
              <span className="ml-2 rounded-full bg-green-500/20 text-green-600 text-xs px-1.5 py-0.5 font-medium">
                {completed.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : activeList.length === 0 ? (
        <div className="rounded-lg border border-border py-20 text-center">
          <p className="text-muted-foreground text-sm">No {tab} transactions found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">
                  Description
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                  From Account
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                  From Bucket
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                  To Account
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                  To Bucket
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                  Amount (LKR)
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-28">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-28">
                  Opening
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-28">
                  Closing
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-28">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 border border-border font-medium">
                    {t.description}
                  </td>
                  <td className="px-4 py-3 border border-border text-muted-foreground text-xs">
                    {t.fromAccountName ?? "—"}
                  </td>
                  <td className="px-4 py-3 border border-border text-muted-foreground text-xs">
                    {t.fromBucketName ?? "—"}
                  </td>
                  <td className="px-4 py-3 border border-border text-muted-foreground text-xs">
                    {t.toAccountName}
                  </td>
                  <td className="px-4 py-3 border border-border text-muted-foreground text-xs">
                    {t.toBucketName}
                  </td>
                  <td className="px-4 py-3 border border-border text-right tabular-nums font-medium">
                    {fmt(t.amount)}
                  </td>
                  <td className="px-4 py-3 border border-border text-center">
                    {t.status ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/10">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/40">
                        Pending
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 border border-border text-muted-foreground text-xs">
                    {t.openingDate ?? "—"}
                  </td>
                  <td className="px-4 py-3 border border-border text-muted-foreground text-xs">
                    {t.closingDate ?? "—"}
                  </td>
                  <td className="px-4 py-3 border border-border text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1.5"
                      disabled={t.status || processingId === t.id}
                      onClick={() => !t.status && handleMarkSuccess(t.id, t.description)}
                    >
                      {processingId === t.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <CheckCircle2 className="h-3 w-3" />}
                      Complete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-muted/30 border-t border-border">
                <td colSpan={colCount} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, activeList.length)}–{Math.min(safePage * PAGE_SIZE, activeList.length)} of {activeList.length}
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

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  )
}

export default TransactionsPage