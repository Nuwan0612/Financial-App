// src/app/finances/liabilities/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { liabilitiesApi, Liability } from "@/lib/api/liabilities"
import { AddPaymentDialog } from "@/components/finances/liabilities/AddDialogs"
import { AlertDialogDestructivePayment } from "@/components/finances/liabilities/AlertDialogs"


const PAGE_SIZE = 10

const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

const LiabilityDetailPage = () => {
  const { id } = useParams()
  const router = useRouter()

  const [liability, setLiability] = useState<Liability | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null)
  const [showAddPayment, setShowAddPayment] = useState(false)  
  const [showDelete, setShowDelete] = useState(false)  


  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await liabilitiesApi.getById(Number(id))
        setLiability(res.data)
      } catch {
        console.error("Failed to fetch liability detail")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handlePaymentAdded = (updatedLiability: Liability) => {
    setLiability(updatedLiability)
    setShowAddPayment(false)
  }

  const handlePaymentDeleted = (updatedLiability: Liability) => {
    setLiability(updatedLiability)
    setShowDelete(false)
  }

  const payments = liability?.payments ?? []
  const totalPages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = payments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="p-6 mx-auto space-y-6" style={{ maxWidth: "1200px" }}>

      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Finances
      </Button>

      {/* Summary card */}
      {loading ? (
        <Skeleton className="h-36 w-full rounded-lg" />
      ) : liability ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-6">

              {/* Left — liability info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold">{liability.name}</h1>
                  {liability.isPaid ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/10">
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/40">
                      Pending
                    </Badge>
                  )}
                </div>

                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-semibold">{fmt(liability.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Paid</p>
                    <p className="text-lg font-semibold text-green-600">{fmt(liability.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-lg font-semibold text-destructive">{fmt(liability.remainingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Borrowed</p>
                    <p className="text-lg font-semibold">{liability.borrowed ?? "—"}</p>
                  </div>
                  {liability.completed && (
                    <div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-lg font-semibold">{liability.completed}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right — Add Payment button */}
              <Button className="shrink-0 gap-2" onClick={() => setShowAddPayment(true)}>
                <Plus className="h-4 w-4" />
                Add Payment
              </Button>

            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground text-sm">Liability not found.</p>
      )}

      {/* Payments table */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium">Payment History</h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-lg border border-border py-16 text-center">
            <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-12">
                    #
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                    Payment Date
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-40">
                    Amount Paid
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border">
                    Notes
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((payment, idx) => (
                  <tr key={payment.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 border border-border text-muted-foreground text-xs">
                      {(safePage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3 border border-border text-muted-foreground text-xs">
                      {payment.paymentDate}
                    </td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums font-medium text-green-600">
                      {fmt(payment.amountPaid)}
                    </td>
                    <td className="px-4 py-3 border border-border text-right text-muted-foreground">
                      {payment.notes || "—"}
                    </td>
                    <td className="px-4 py-3 border border-border text-right">
                      <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => {setPaymentToDelete(payment.id); setShowDelete(true)}}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30 border-t border-border">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, payments.length)}–{Math.min(safePage * PAGE_SIZE, payments.length)} of {payments.length}
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

      <AddPaymentDialog 
        open={showAddPayment} 
        id={Number(id)}
        onClose={() => setShowAddPayment(false)} 
        onAdded={handlePaymentAdded}
      />

      <AlertDialogDestructivePayment
        open={showDelete} 
        liabilityId={Number(id)}      
        paymentId={paymentToDelete}      
        onConfirm={(updatedLiability) => {
          handlePaymentDeleted(updatedLiability)      
          setPaymentToDelete(null)     
          setShowDelete(false)
        }}
        onCancel={() => {
          setShowDelete(false)
          setPaymentToDelete(null)
        }}
      />

    </div>
  )
}

export default LiabilityDetailPage