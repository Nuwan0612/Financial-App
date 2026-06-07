import { useEffect, useState } from "react"
import { Loader2, Trash2Icon } from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  mainCategoryApi,
  MainCategoryConflictResponse,
  MainCategoryConflictBucket,
  transactionApi,
  TransactionDto,
  DestinationAccount,
} from "@/lib/api/allocations"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

type BucketAssignment = {
  toAccountId: number
  toBucketId: number
}

export function DeleteMainCategoryDialog({
  open,
  mainCategoryId,
  mainCategoryName,
  onConfirm,
  onCancel,
}: {
  open: boolean
  mainCategoryId: number | null
  mainCategoryName: string
  onConfirm: (id: number) => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [conflict, setConflict] = useState<MainCategoryConflictResponse | null>(null)
  const [showConflict, setShowConflict] = useState(false)
  const [assignments, setAssignments] = useState<Record<number, BucketAssignment>>({})
  const [localId, setLocalId] = useState<number | null>(null)

  useEffect(() => {
    if (mainCategoryId !== null) setLocalId(mainCategoryId)
  }, [mainCategoryId])

  const handleTryDelete = async () => {
    if (localId === null) return
    try {
      setLoading(true)
      await mainCategoryApi.delete(localId)
      onConfirm(localId)
      onCancel()
    } catch (err: any) {
      if (err?.response?.status === 409 && err?.response?.data?.resolutionData) {
        const conflictData: MainCategoryConflictResponse = err.response.data
        const defaults: Record<number, BucketAssignment> = {}

        conflictData.resolutionData.conflictingBuckets.forEach(bucket => {
          const firstDest = conflictData.resolutionData.availableDestinations[0]
          defaults[bucket.bucketId] = {
            toAccountId: firstDest?.accountId ?? 0,
            toBucketId: firstDest?.buckets[0]?.bucketId ?? 0,
          }
        })

        setConflict(conflictData)
        setAssignments(defaults)
        setShowConflict(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAccountChange = (bucketId: number, accountId: number) => {
    const selectedAccount = conflict?.resolutionData.availableDestinations
      .find(a => a.accountId === accountId)
    setAssignments(prev => ({
      ...prev,
      [bucketId]: {
        toAccountId: accountId,
        toBucketId: selectedAccount?.buckets[0]?.bucketId ?? 0,
      }
    }))
  }

  const handleBucketChange = (bucketId: number, toBucketId: number) => {
    setAssignments(prev => ({
      ...prev,
      [bucketId]: { ...prev[bucketId], toBucketId }
    }))
  }

  const handleTransferAndDelete = async () => {
    if (!conflict || localId === null) return

    const hasInvalid = conflict.resolutionData.conflictingBuckets.some(
      b => !assignments[b.bucketId] || assignments[b.bucketId].toAccountId === 0
    )
    if (hasInvalid) return

    try {
      setLoading(true)

      const dtos: TransactionDto[] = conflict.resolutionData.conflictingBuckets.map(bucket => ({
        description: `Transfer from ${bucket.bucketName} before deletion`,
        amount: bucket.balance,
        openingDate: new Date().toISOString().split("T")[0],
        fromAccountId: bucket.accountId,
        fromBucketId: bucket.bucketId,
        toAccountId: assignments[bucket.bucketId].toAccountId,
        toBucketId: assignments[bucket.bucketId].toBucketId,
      }))

      await transactionApi.bulkTransfer(dtos)
      await mainCategoryApi.delete(localId)
      onConfirm(localId)
      setShowConflict(false)
      onCancel()
    } catch {
      console.error("Transfer or deletion failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Step 1 — Confirm dialog */}
      <AlertDialog open={open && !showConflict} onOpenChange={onCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Main Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">"{mainCategoryName}"</span>{" "}
              and all its sub categories. If any buckets have funds, you will be asked to transfer them first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel} disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTryDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Step 2 — Conflict resolution dialog */}
      <Dialog open={showConflict} onOpenChange={() => { setShowConflict(false); onCancel() }}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2Icon className="h-4 w-4 text-destructive" />
              Transfer Funds Before Deleting "{conflict?.resolutionData.mainCategoryName}"
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              The following buckets have funds. Select a destination for each before deleting.
            </p>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border">
                      Bucket
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border">
                      Sub Category
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border">
                      From Account
                    </th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground border border-border w-28">
                      Balance
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border w-40">
                      To Account
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground border border-border w-40">
                      To Bucket
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {conflict?.resolutionData.conflictingBuckets.map(bucket => {
                    const assignment = assignments[bucket.bucketId]
                    const selectedAccount = conflict.resolutionData.availableDestinations
                      .find(a => a.accountId === assignment?.toAccountId)

                    return (
                      <tr key={bucket.bucketId} className="hover:bg-muted/20">
                        <td className="px-3 py-2 border border-border font-medium">
                          {bucket.bucketName}
                        </td>
                        <td className="px-3 py-2 border border-border text-muted-foreground text-xs">
                          {bucket.subCategoryName}
                        </td>
                        <td className="px-3 py-2 border border-border text-muted-foreground text-xs">
                          {bucket.accountName}
                        </td>
                        <td className="px-3 py-2 border border-border text-right">
                          <Badge className="text-destructive border-destructive/30 bg-destructive/10">
                            {fmt(bucket.balance)}
                          </Badge>
                        </td>

                        {/* To Account */}
                        <td className="px-3 py-2 border border-border">
                          <Select
                            value={String(assignment?.toAccountId ?? "")}
                            onValueChange={val => handleAccountChange(bucket.bucketId, Number(val))}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {conflict.resolutionData.availableDestinations.map(acc => (
                                <SelectItem key={acc.accountId} value={String(acc.accountId)}>
                                  {acc.accountName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* To Bucket */}
                        <td className="px-3 py-2 border border-border">
                          {selectedAccount && selectedAccount.buckets.length > 0 ? (
                            <Select
                              value={assignment?.toBucketId ? String(assignment.toBucketId) : ""}
                              onValueChange={val => handleBucketChange(bucket.bucketId, Number(val))}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select bucket" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedAccount.buckets.map(b => (
                                  <SelectItem key={b.bucketId} value={String(b.bucketId)}>
                                    {b.bucketName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-xs text-muted-foreground px-1">
                              No buckets available
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowConflict(false); onCancel() }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTransferAndDelete}
              disabled={loading}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Transfer & Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}