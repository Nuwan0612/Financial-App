import { Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Expense, expensesApi } from "@/lib/api/expenses"
import { AddExpenseDialog, UpdateExpenseDialog } from "./AddDialogs"
import { AlertDialogDestructiveExpense } from "./AlertDialogs"



// --- Constants & Formatters ---
const PAGE_SIZE = 10

const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n);

// --- Main Component ---
const ExpensesTable = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null)
  const [expenseToUpdate, setExpenseToUpdate] = useState<Expense | null>(null)

  const [showAddExpense, setShowAddExpense] = useState(false)  
  const [showUpdateExpense, setShowUpdateExpense] = useState(false) 
  const [showDelete, setShowDelete] = useState(false)  
  
  // Pagination State
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await expensesApi.getAll()
        setExpenses(res.data)
      } catch {
        console.error("Failed to fetch expenses")
      } 
    }
    fetchExpenses()
  }, [])

  const handleExpenseAdded = (expense: Expense) => {
    setExpenses((prev) => [...prev, expense])
  }

  const handleExpenseUpdated = (updated: Expense) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    )
  }

  const handleExpenseDeleted = (id: number) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id))
  }

  // --- Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = expenses.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return(
    <div>
      <TabsContent value="expenses" className="mt-6 space-y-4">
        {/* Header & Totals */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Total monthly expenses:{" "}
              <span className="font-semibold text-foreground">
                {fmt(expenses.reduce((s, i) => s + i.amount, 0))}
              </span>
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddExpense(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Expense
          </Button>
        </div>

        {/* Empty State vs Table */}
        {expenses.length === 0 ? (
          <div className="rounded-lg border border-border py-16 text-center">
            <p className="text-muted-foreground text-sm">No expense sources found.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">Source</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Amount (LKR)</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-32">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {paginated.map((item) => {
                  

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 border border-border font-medium">{item.name}</td>

                      <td className="px-4 py-3 border border-border text-right font-medium tabular-nums">
                        {fmt(item.amount)}
                      </td>
                                            
                      <td className="px-4 py-3 border border-border text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowUpdateExpense(true); setExpenseToUpdate(item); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setShowDelete(true); setExpenseToDelete(item.id) }}>
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
                        Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, expenses.length)}–{Math.min(safePage * PAGE_SIZE, expenses.length)} of {expenses.length}
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

      <AddExpenseDialog 
        open={showAddExpense} 
        onClose={() => setShowAddExpense(false)} 
        onAdded={handleExpenseAdded} 
      />

      <UpdateExpenseDialog
        open={showUpdateExpense}
        updateItem={expenseToUpdate}
        onClose={() => setShowUpdateExpense(false)}
        onUpdated={handleExpenseUpdated}
      />

      <AlertDialogDestructiveExpense
        open={showDelete} 
        expenseId={expenseToDelete}      
        onConfirm={(id) => {
          handleExpenseDeleted(id)      
          setExpenseToDelete(null)     
          setShowDelete(false)
        }}
        onCancel={() => {
          setShowDelete(false)
          setExpenseToDelete(null)
        }}
      />
    </div>
  )
}

export default ExpensesTable;