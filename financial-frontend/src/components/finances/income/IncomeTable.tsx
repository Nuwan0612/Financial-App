import { Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Income, incomesApi } from "@/lib/api/income"
import { getUsdToLkrRate } from "@/lib/utils"

import { useRouter } from "next/navigation"
import { AddIncomeDialog, UpdateIncomeDialog } from "./AddDialogs"
import { AlertDialogDestructive } from "./AlertDialogs"

// --- Constants & Formatters ---
const PAGE_SIZE = 10

const fmtLKR = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n);

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

// --- Main Component ---
const IncomeTable = () => {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [incomeToDelete, setIncomeToDelete] = useState<number | null>(null)
  const [incomeToUpdate, setIncomeToUpdate] = useState<Income | null>(null)

  const [showAddIncome, setShowAddIncome] = useState(false)  
  const [showUpdateIncome, setShowUpdateIncome] = useState(false) 
  const [showDelete, setShowDelete] = useState(false)  
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [exchangeRate, setExchangeRate] = useState(0)

  const router = useRouter()

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const res = await incomesApi.getAll()
        setIncomes(res.data)
        const usdToLkr = await getUsdToLkrRate();
        setExchangeRate(usdToLkr)
      } catch {
        console.error("Failed to fetch incomes")
      } 
    }
    fetchIncomes()
  }, [])

  const handleIncomeAdded = (income: Income) => {
    setIncomes((prev) => [...prev, income])
  }

  const handleIncomeUpdated = (updated: Income) => {
    setIncomes((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    )
  }

  const handleIncomeDeleted = (id: number) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id))
  }

  // --- Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(incomes.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = incomes.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return(
    <div>
      <TabsContent value="income" className="mt-6 space-y-4">
        {/* Header & Totals */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Total monthly income:{" "}
              <span className="font-semibold text-foreground">
                {fmtLKR(
                  incomes.reduce((sum, item) => {
                    const amountInLkr = item.currency === "USD" 
                      ? item.expectedAmount * exchangeRate 
                      : item.expectedAmount;
                    return sum + amountInLkr;
                  }, 0)
                )}
              </span>
              {" "} / {" "}
              <span className="font-semibold text-foreground">
                {fmtUSD(
                  incomes.reduce((sum, item) => {
                    const amountInUsd = item.currency === "LKR" 
                      ? item.expectedAmount / exchangeRate 
                      : item.expectedAmount;
                    return sum + amountInUsd;
                  }, 0)
                )}
              </span>
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddIncome(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Income
          </Button>
        </div>

        {incomes.length > 0 && (() => {
          // Collect all entries across all incomes
          const allEntries = incomes.flatMap(i => i.incomeEntries ?? [])

          // Starting date — earliest entry date
          const startingDate = allEntries.length > 0
            ? allEntries.reduce((earliest, e) =>
                e.date < earliest ? e.date : earliest,
                allEntries[0].date
              )
            : null

          // Total earnings in LKR and USD
          const totalEarnedLKR = incomes.reduce((sum, income) => {
            const entries = income.incomeEntries ?? []
            const incomeTotal = entries.reduce((s, e) => s + e.amount, 0)
            return sum + (income.currency === "USD"
              ? incomeTotal * exchangeRate
              : incomeTotal)
          }, 0)

          const totalEarnedUSD = incomes.reduce((sum, income) => {
            const entries = income.incomeEntries ?? []
            const incomeTotal = entries.reduce((s, e) => s + e.amount, 0)
            return sum + (income.currency === "LKR"
              ? (exchangeRate > 0 ? incomeTotal / exchangeRate : 0)
              : incomeTotal)
          }, 0)

          return (
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <div className="flex items-center divide-x divide-border">
                <div className="px-6 py-4 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Total Earned (LKR)</p>
                  <p className="text-xl font-semibold text-green-600">
                    {exchangeRate > 0 ? fmtLKR(totalEarnedLKR) : "..."}
                  </p>
                </div>
                <div className="px-6 py-4 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Total Earned (USD)</p>
                  <p className="text-xl font-semibold text-green-600">
                    {exchangeRate > 0 ? fmtUSD(totalEarnedUSD) : "..."}
                  </p>
                </div>
                <div className="px-6 py-4 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Total Entries</p>
                  <p className="text-xl font-semibold">{allEntries.length}</p>
                </div>
                <div className="px-6 py-4 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Tracking Since</p>
                  <p className="text-xl font-semibold">
                    {startingDate ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Empty State vs Table */}
        {incomes.length === 0 ? (
          <div className="rounded-lg border border-border py-16 text-center">
            <p className="text-muted-foreground text-sm">No income sources found.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-28">Currency</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Amount (USD)</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Amount (LKR)</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-32">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {/* Notice we map over 'paginated' here, not 'incomes' */}
                {paginated.map((item) => {
                  const usdValue = item.currency === "USD" 
                    ? item.expectedAmount 
                    : (exchangeRate > 0 ? item.expectedAmount / exchangeRate : 0)
                    
                  const lkrValue = item.currency === "LKR" 
                    ? item.expectedAmount 
                    : item.expectedAmount * exchangeRate

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 border border-border font-medium">{item.name}</td>
                      
                      <td className="px-4 py-3 border border-border">
                        <Badge variant={item.currency === "USD" ? "default" : "secondary"}>
                          {item.currency}
                        </Badge>
                      </td>
                      
                      <td className="px-4 py-3 border border-border text-right text-muted-foreground tabular-nums">
                        {exchangeRate > 0 ? fmtUSD(usdValue) : "..."}
                      </td>
                      
                      <td className="px-4 py-3 border border-border text-right font-medium tabular-nums">
                        {exchangeRate > 0 ? fmtLKR(lkrValue) : "..."}
                      </td>
                      
                      <td className="px-4 py-3 border border-border text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/finances/income/${item.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowUpdateIncome(true); setIncomeToUpdate(item); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setShowDelete(true); setIncomeToDelete(item.id) }}>
                            <Trash2 className="h-4 w-4" />
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
                        Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, incomes.length)}–{Math.min(safePage * PAGE_SIZE, incomes.length)} of {incomes.length}
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
      </TabsContent>

      <AddIncomeDialog
        open={showAddIncome}
        onClose={() => setShowAddIncome(false)}
        onAdded={handleIncomeAdded}
      />

      <UpdateIncomeDialog
        open={showUpdateIncome}
        updateItem={incomeToUpdate}
        onClose={() => setShowUpdateIncome(false)}
        onUpdated={handleIncomeUpdated}
      />

      <AlertDialogDestructive
        open={showDelete}
        incomeId={incomeToDelete}      
        onConfirm={(id) => {
          handleIncomeDeleted(id)      
          setIncomeToDelete(null)      
          setShowDelete(false)
        }}
        onCancel={() => {
          setShowDelete(false)
          setIncomeToDelete(null)
        }}
      />
    </div>
  )
}

export default IncomeTable;