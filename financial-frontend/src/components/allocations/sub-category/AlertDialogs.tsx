// In your AlertDialogs.tsx or a new DeleteSubCategoryDialog.tsx

import { useEffect, useState } from "react"
import { Loader2, Trash2Icon, ArrowRight } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  subCategoryApi, ConflictResponse,
  transactionApi,
  TransactionDto,
} from "@/lib/api/allocations"
import { Button } from "@/components/ui/button"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

// ─── Transfer assignment per conflicting bucket ───────────────
type BucketAssignment = {
  toAccountId: number
  toBucketId: number | null  // null = transfer to account directly
}

export function DeleteSubCategoryDialog({
  open,
  subCategoryId,
  subCategoryName,
  onConfirm,
  onCancel,
}: {
  open: boolean
  subCategoryId: number | null
  subCategoryName: string
  onConfirm: (id: number) => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)

  // ── Conflict state ──
  const [conflict, setConflict] = useState<ConflictResponse | null>(null)
  const [showConflict, setShowConflict] = useState(false)

  // One assignment per conflicting bucket — keyed by bucket id
  const [assignments, setAssignments] = useState<Record<number, BucketAssignment>>({})

  const [localSubCategoryId, setLocalSubCategoryId] = useState<number | null>(null)

  useEffect(() => {
    if (subCategoryId !== null) {
      setLocalSubCategoryId(subCategoryId)
    }
  }, [subCategoryId])

  const handleTryDelete = async () => {
  if (localSubCategoryId === null) return
    try {
      setLoading(true)
      await subCategoryApi.delete(localSubCategoryId)
      onConfirm(localSubCategoryId)
      onCancel()
    } catch (err: any) {
      if (err?.response?.status === 409) {
        const conflictData: ConflictResponse = err.response.data
        const defaults: Record<number, BucketAssignment> = {}
        conflictData.resolutionData.conflictingBuckets.forEach(bucket => {
          const firstDest = conflictData.resolutionData.availableDestinations[0]
          defaults[bucket.id] = {
            toAccountId: firstDest?.accountId ?? 0,
            toBucketId: firstDest?.buckets[0]?.bucketId ?? null,
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

  const handleTransferAndDelete = async () => {
    console.log("localSubCategoryId:", localSubCategoryId)  // ← should now have value
    if (!conflict || localSubCategoryId === null) return

    const hasInvalid = conflict.resolutionData.conflictingBuckets.some(
      b => !assignments[b.id] || assignments[b.id].toAccountId === 0
    )
    if (hasInvalid) return

    try {
      setLoading(true)
      await Promise.all(
        conflict.resolutionData.conflictingBuckets.map(bucket => {
          const assignment = assignments[bucket.id]
          const dto: TransactionDto = {
            description: `Transfer from ${bucket.name} before deletion`,
            amount: bucket.balance,
            openingDate: new Date().toISOString().split("T")[0],
            fromAccountId: conflict.resolutionData.accountId,
            fromBucketId: bucket.id,
            toAccountId: assignment.toAccountId,
            toBucketId: assignment.toBucketId!
          }
          console.log("Transferring DTO:", dto)
          return transactionApi.transfer(dto)
        })
      )
      await subCategoryApi.delete(localSubCategoryId)
      onConfirm(localSubCategoryId)
      setShowConflict(false)
      onCancel()
    } catch {
      console.error("Transfer or deletion failed")
    } finally {
      setLoading(false)
    }
  }

  const updateAssignment = (
    bucketId: number,
    field: keyof BucketAssignment,
    value: number   // ← remove null
  ) => {
    setAssignments(prev => ({
      ...prev,
      [bucketId]: { ...prev[bucketId], [field]: value }
    }))
  }

  // When account changes, reset bucket selection
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

  return (
    <>
      {/* ── Step 1: Normal confirm dialog ── */}
      <AlertDialog open={open && !showConflict} onOpenChange={onCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sub Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">"{subCategoryName}"</span>.
              If this sub category has funds in its bucket, you will be asked to transfer them first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel} disabled={loading}>
              Cancel
            </AlertDialogCancel>
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

      {/* ── Step 2: Conflict resolution dialog ── */}
      <Dialog open={showConflict} onOpenChange={() => { setShowConflict(false); onCancel() }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2Icon className="h-4 w-4 text-destructive" />
              Transfer Funds Before Deleting
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                "{conflict?.resolutionData.subCategoryName}"
              </span>{" "}
              has funds in the following buckets. Transfer them before deleting.
            </p>

            {/* One transfer row per conflicting bucket */}
            {conflict?.resolutionData.conflictingBuckets.map(bucket => {
              const assignment = assignments[bucket.id]
              const selectedAccount = conflict.resolutionData.availableDestinations
                .find(a => a.accountId === assignment?.toAccountId)

              return (
                <div key={bucket.id} className="rounded-lg border border-border p-4 space-y-3">

                  {/* Bucket info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{bucket.name}</p>
                      <p className="text-xs text-muted-foreground">Current balance</p>
                    </div>
                    <Badge className="text-destructive border-destructive/30 bg-destructive/10">
                      {fmt(bucket.balance)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{bucket.name}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>Transfer to</span>
                  </div>

                  {/* Destination account */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Destination Account</Label>
                    <Select
                      value={String(assignment?.toAccountId ?? "")}
                      onValueChange={val => handleAccountChange(bucket.id, Number(val))}
                    >
                      <SelectTrigger>
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
                  </div>

                  {/* Destination bucket — only show if selected account has buckets */}
                  {selectedAccount && selectedAccount.buckets.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Destination Bucket{" "}
                        {/* <span className="text-muted-foreground">(optional — leave empty to transfer to account)</span> */}
                      </Label>
                      <Select
                        value={assignment?.toBucketId ? String(assignment.toBucketId) : ""}
                        onValueChange={val =>
                          updateAssignment(bucket.id, "toBucketId", Number(val))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedAccount.buckets.map(b => (
                            <SelectItem key={b.bucketId} value={String(b.bucketId)}>
                              {b.bucketName}
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({b.subCategoryName})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )
            })}
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