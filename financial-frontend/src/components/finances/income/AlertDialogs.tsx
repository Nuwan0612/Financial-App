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
import { incomesApi } from "@/lib/api/income"



/*====================================================================== */
/*                                 INCOME                                */
/*====================================================================== */


export function AlertDialogDestructive(
  { 
    open, 
    incomeId,
    onConfirm,
    onCancel 
  }: { 
    open: boolean,
    incomeId: number | null,
    onConfirm: (id: number) => void,
    onCancel: () => void
  }) {

    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
      try {
        setLoading(true)
        if (incomeId !== null) {
          await incomesApi.delete(incomeId)
        }
        onConfirm(incomeId!)
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
          <AlertDialogTitle>Delete Income?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this income entry. Are you sure you want to proceed?
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

