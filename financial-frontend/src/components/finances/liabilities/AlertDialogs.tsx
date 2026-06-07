import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { liabilitiesApi, Liability, liabilityPaymentsApi } from "@/lib/api/liabilities"






/*====================================================================== */
/*                               LIABILITIES                                */
/*====================================================================== */

export function AlertDialogDestructiveLiability(
  { 
    open, 
    liabilityId,
    onConfirm,
    onCancel 
  }: { 
    open: boolean,
    liabilityId: number | null,
    onConfirm: (id: number) => void,
    onCancel: () => void
  }) {

    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
      try {
        setLoading(true)
        if (liabilityId !== null) {
          await liabilitiesApi.delete(liabilityId)
        }
        onConfirm(liabilityId!)
        onCancel()
      } finally {
        setLoading(false)
      }
    }
    
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Liability?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this liability entry. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" onClick={onCancel} disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}



/*====================================================================== */
/*                               PAYMENTS                                */
/*====================================================================== */

export function AlertDialogDestructivePayment(
  { 
    open, 
    liabilityId,
    paymentId,
    onConfirm,
    onCancel 
  }: { 
    open: boolean,
    liabilityId: number,
    paymentId: number | null,
    onConfirm: (updatedLiability: Liability) => void,
    onCancel: () => void
  }) {

    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
      try {
        setLoading(true)
        if (paymentId !== null) {
          const res = await liabilityPaymentsApi.delete(liabilityId, paymentId)
          onConfirm(res.data)
          onCancel()
        }
      } finally {
        setLoading(false)
      }
    }
    
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this payment. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" onClick={onCancel} disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}