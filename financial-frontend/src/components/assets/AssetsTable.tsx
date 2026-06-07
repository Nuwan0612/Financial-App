import { Assets, assetsApi } from "@/lib/api/assets"
import { getUsdToLkrRate } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Skeleton } from "../ui/skeleton"
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react"
import { Button } from "../ui/button"
import { AddAssetDialog, UpdateAssetDialog } from "./AddDialogs"
import { AlertDialogDestructiveAsset } from "./AlertDialogs"

const PAGE_SIZE = 10

const fmtLKR = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)

const AssetsTable = () => {

    const [assets, setAssets] = useState<Assets[]>([])
    const [loading, setLoading] = useState(true)
    const [exchangeRate, setExchangeRate] = useState(0)
    const [page, setPage] = useState(1)

    const [assetToDelete, setAssetToDelete] = useState<number | null>(null)
    const [assetToUpdate, setAssetToUpdate] = useState<Assets | null>(null)

    const [showAddAsset, setShowAddAsset] = useState(false)
    const [showUpdateAsset, setShowUpdateAsset] = useState(false) 
    const [showDelete, setShowDelete] = useState(false)  
  
    useEffect(() => {
      const fetch = async () => {
        try {
          const assetsRes = await assetsApi.getAll()
          setAssets(assetsRes.data)
          const rate = await getUsdToLkrRate()
          setExchangeRate(rate)
        } catch {
          console.error("Failed to fetch assets")
        } finally {
          setLoading(false)
        }
      }
      fetch()
    }, [])
  
    const handleAssetAdded = (asset: Assets) => setAssets(prev => [...prev, asset])
    const handleAssetUpdated = (updated: Assets) => setAssets(prev => prev.map(a => a.id === updated.id ? updated : a))
    const handleAssetDeleted = (id: number) => setAssets(prev => prev.filter(a => a.id !== id))
  
    // ── Summary calculations ──
    const totalPurchaseLKR = assets.reduce((s, a) => s + a.purchasePrice, 0)
    const totalMarketLKR = assets.reduce((s, a) => s + a.currentMarketValue, 0)
    const totalProfitLKR = totalMarketLKR - totalPurchaseLKR
    const totalProfitUSD = exchangeRate > 0 ? totalProfitLKR / exchangeRate : 0
    const earliestDate = assets.length > 0
      ? assets.reduce((earliest, a) =>
          a.accrueDate < earliest ? a.accrueDate : earliest,
          assets[0].accrueDate
        )
      : null
  
    // ── Pagination ──
    const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE))
    const safePage = Math.min(page, totalPages)
    const paginated = assets.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)



  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold">Assets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your assets and their market value over time.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddAsset(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Asset
        </Button>
      </div>
      
      {/* Summary card */}
      {loading ? (
        <Skeleton className="h-24 w-full rounded-lg" />
      ) : assets.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden bg-card mb-2">
          <div className="flex items-center divide-x divide-border">
            <div className="px-6 py-4 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Total Assets</p>
              <p className="text-xl font-semibold">{assets.length}</p>
            </div>
            <div className="px-6 py-4 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Total Value (LKR)</p>
              <p className="text-xl font-semibold">{fmtLKR(totalMarketLKR)}</p>
            </div>
            <div className="px-6 py-4 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Total Profit / Loss (LKR)</p>
              <p className={`text-xl font-semibold flex items-center gap-1 ${totalProfitLKR >= 0 ? "text-green-600" : "text-destructive"}`}>
                {totalProfitLKR >= 0
                  ? <TrendingUp className="h-4 w-4" />
                  : <TrendingDown className="h-4 w-4" />}
                {fmtLKR(Math.abs(totalProfitLKR))}
              </p>
            </div>
            <div className="px-6 py-4 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Total Profit / Loss (USD)</p>
              <p className={`text-xl font-semibold flex items-center gap-1 ${totalProfitUSD >= 0 ? "text-green-600" : "text-destructive"}`}>
                {totalProfitUSD >= 0
                  ? <TrendingUp className="h-4 w-4" />
                  : <TrendingDown className="h-4 w-4" />}
                {exchangeRate > 0 ? fmtUSD(Math.abs(totalProfitUSD)) : "..."}
              </p>
            </div>
            <div className="px-6 py-4 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Tracking Since</p>
              <p className="text-xl font-semibold">{earliestDate ?? "—"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-lg border border-border py-16 text-center">
          <p className="text-muted-foreground text-sm">No assets found.</p>
          <p className="text-muted-foreground text-xs mt-1">Click "Add Asset" to get started.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border">
                  Name
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                  Purchase Price
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                  Market Value
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                  Profit / Loss (LKR)
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground border border-border w-36">
                  Profit / Loss (USD)
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground border border-border w-32">
                  Accrue Date
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground border border-border w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(asset => {
                const profitLKR = asset.currentMarketValue - asset.purchasePrice
                const profitUSD = exchangeRate > 0 ? profitLKR / exchangeRate : 0
                const isProfit = profitLKR >= 0

                return (
                  <tr key={asset.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 border border-border font-medium">
                      {asset.name}
                    </td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums text-muted-foreground">
                      {fmtLKR(asset.purchasePrice)}
                    </td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums font-medium">
                      {fmtLKR(asset.currentMarketValue)}
                    </td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums">
                      <span className={`flex items-center justify-end gap-1 font-medium ${isProfit ? "text-green-600" : "text-destructive"}`}>
                        {isProfit
                          ? <TrendingUp className="h-3 w-3" />
                          : <TrendingDown className="h-3 w-3" />}
                        {fmtLKR(Math.abs(profitLKR))}
                      </span>
                    </td>
                    <td className="px-4 py-3 border border-border text-right tabular-nums">
                      <span className={`flex items-center justify-end gap-1 font-medium ${isProfit ? "text-green-600" : "text-destructive"}`}>
                        {isProfit
                          ? <TrendingUp className="h-3 w-3" />
                          : <TrendingDown className="h-3 w-3" />}
                        {exchangeRate > 0 ? fmtUSD(Math.abs(profitUSD)) : "..."}
                      </span>
                    </td>
                    <td className="px-4 py-3 border border-border text-muted-foreground text-xs">
                      {asset.accrueDate}
                    </td>
                    <td className="px-4 py-3 border border-border text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowUpdateAsset(true); setAssetToUpdate(asset); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => { setShowDelete(true); setAssetToDelete(asset.id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 border-t border-border">
                <td colSpan={7} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, assets.length)}–{Math.min(safePage * PAGE_SIZE, assets.length)} of {assets.length}
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

      <AddAssetDialog
        open={showAddAsset}
        onClose={() => setShowAddAsset(false)}
        onAdded={handleAssetAdded}
      />

      <UpdateAssetDialog
        open={showUpdateAsset}
        updateItem={assetToUpdate}
        onClose={() => setShowUpdateAsset(false)}
        onUpdated={handleAssetUpdated}
      />

      <AlertDialogDestructiveAsset
        open={showDelete}
        assetId={assetToDelete}
        onConfirm={handleAssetDeleted}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}

export default AssetsTable



// export function UpdateAssetDialog({
//   open,
//   updateItem,
//   onClose,
//   onUpdated,
// }: {
//   open: boolean
//   updateItem: Liability | null
//   onClose: () => void
//   onUpdated: (liability: Liability) => void
// }) {
//   const [form, setForm] = useState<CreateLiabilityDto>({
//     name: "",
//     isPaid: false,
//     completed: "",
//     borrowed: new Date().toISOString().split('T')[0],
//     amount: 0,
//   })
  
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     if (updateItem) {
//       setForm({
//         name: updateItem.name,
//         isPaid: updateItem.isPaid ? true : false,
//         completed: updateItem.completed,
//         borrowed: updateItem.borrowed,
//         amount: updateItem.amount,
//       })
//       setError(null) 
//     }
//   }, [updateItem, open])

//   const handleSubmit = async () => {
//     // Safety check: Make sure we actually have an ID to update!
//     if (!updateItem?.id) return;

//     if (!form.name || !form.amount) {
//       setError("Please fill in all fields.")
//       return
//     }

//     try {
//       setLoading(true)
//       setError(null)
//       const res = await liabilitiesApi.update(updateItem.id, form)
//       onUpdated(res.data)
//       onClose()
//     } catch (err) {
//       setError("Failed to update expense. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           {/* Changed title from "Add" to "Update" */}
//           <DialogTitle>Update Liability</DialogTitle> 
//         </DialogHeader>

//         <div className="space-y-4 py-2">
//           {/* Name */}
//           <div className="space-y-1.5">
//             <Label htmlFor="name">Name</Label>
//             <Input
//               id="name"
//               placeholder="e.g. Transport, Food"
//               value={form.name} 
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//             />
//           </div>

//           {/* Amount + Currency side by side */}
//           <div className="flex gap-3">
//             <div className="space-y-1.5 flex-1">
//               <Label htmlFor="amount">Amount</Label>
//               <Input
//                 id="amount"
//                 type="number"
//                 placeholder="0"
//                 value={form.amount || ""} // 2. CHANGED TO form.amount
//                 onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
//               />
//             </div>
//           </div>

//           {/* Error */}
//           {error && (
//             <p className="text-sm text-destructive">{error}</p>
//           )}
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={onClose} disabled={loading}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit} disabled={loading}>
//             {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
//             Update Liability
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }