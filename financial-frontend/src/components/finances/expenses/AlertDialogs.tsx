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
import { expensesApi } from "@/lib/api/expenses"

/*====================================================================== */
/*                               EXPENSES                                */
/*====================================================================== */

export function AlertDialogDestructiveExpense(
  { 
    open, 
    expenseId,
    onConfirm,
    onCancel 
  }: { 
    open: boolean,
    expenseId: number | null,
    onConfirm: (id: number) => void,
    onCancel: () => void
  }) {

    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
      try {
        setLoading(true)
        if (expenseId !== null) {
          await expensesApi.delete(expenseId)
        }
        onConfirm(expenseId!)
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
          <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this expense entry. Are you sure you want to proceed?
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



