import { Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { liabilitiesApi, Liability } from "@/lib/api/liabilities"
import { AddLiabilityDialog, UpdateLiabilityDialog } from "./AddDialogs"

import { Badge } from "../../ui/badge"
import { useRouter } from "next/navigation"
import { AlertDialogDestructiveLiability } from "./AlertDialogs"

const PAGE_SIZE = 10

const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

const LiabilitiesTable = () => {

  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [liabilityToDelete, setLiabilityToDelete] = useState<number | null>(null)
  const [liabilityToUpdate, setLiabilityToUpdate] = useState<Liability | null>(null)
  const [showAddLiability, setShowAddLiability] = useState(false)
  const [showUpdateLiability, setShowUpdateLiability] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [page, setPage] = useState(1)

  const router = useRouter()

  useEffect(() => {
    const fetchLiabilities = async () => {
      try {
        const res = await liabilitiesApi.getAll()
        setLiabilities(res.data)
      } catch {
        console.error("Failed to fetch liabilities")
      }
    }
    fetchLiabilities()
  }, [])

  const handleLiabilityAdded = (liability: Liability) => {
    setLiabilities((prev) => [...prev, liability])
  }

  const handleLiabilityUpdated = (updated: Liability) => {
    setLiabilities((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    )
  }

  const handleLiabilityDeleted = (id: number) => {
    setLiabilities((prev) => prev.filter((item) => item.id !== id))
  }

  const totalPages = Math.max(1, Math.ceil(liabilities.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = liabilities.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div>
      <TabsContent value="liabilities" className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Total remaining debt:{" "}
            <span className="font-semibold text-foreground">
              {fmt(liabilities.reduce((s, i) => s + i.remainingBalance, 0))}
            </span>
          </p>
          <Button size="sm" onClick={() => setShowAddLiability(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Liability
          </Button>
        </div>

        {liabilities.length === 0 ? (
          <div className="rounded-lg border border-border py-16 text-center">
            <p className="text-muted-foreground text-sm">No liabilities found.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">Name</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Total</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">Remaining</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-28">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-32">Borrowed</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-32">Completed</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 border border-border font-medium">{item.name}</td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums font-medium">{fmt(item.amount)}</td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums">
                      <span className="text-destructive font-medium">{fmt(item.remainingBalance)}</span>
                    </td>
                    <td className="px-4 py-3 border border-border text-center">
                      {item.isPaid ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/10">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/40 hover:bg-amber-500/10">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 border border-border text-right text-muted-foreground text-xs">
                      {item.borrowed ? new Date(item.borrowed).toISOString().split('T')[0] : "—"}
                    </td>
                    <td className="px-4 py-3 border border-border text-right text-muted-foreground text-xs">
                      {item.completed ? new Date(item.completed).toISOString().split('T')[0] : "—"}
                    </td>
                    <td className="px-4 py-3 border border-border text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/finances/liabilities/${item.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { setShowUpdateLiability(true); setLiabilityToUpdate(item) }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => { setShowDelete(true); setLiabilityToDelete(item.id) }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30 border-t border-border">
                  <td colSpan={7} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, liabilities.length)}–{Math.min(safePage * PAGE_SIZE, liabilities.length)} of {liabilities.length}
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

      <AddLiabilityDialog
        open={showAddLiability}
        onClose={() => setShowAddLiability(false)}
        onAdded={handleLiabilityAdded}
      />

      <UpdateLiabilityDialog
        open={showUpdateLiability}
        updateItem={liabilityToUpdate}
        onClose={() => setShowUpdateLiability(false)}
        onUpdated={handleLiabilityUpdated}
      />

      <AlertDialogDestructiveLiability
        open={showDelete}
        liabilityId={liabilityToDelete}
        onConfirm={handleLiabilityDeleted}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}

export default LiabilitiesTable