import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatINR } from '@/lib/currency'
import type { Expense } from '@/lib/expenses'
import { useLedger } from '@/lib/store'

export function DeleteExpenseDialog({
  expense,
  open,
  onOpenChange,
  onDeleted,
}: {
  expense: Expense | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const { removeExpense } = useLedger()
  const [deleting, setDeleting] = useState(false)

  async function confirm() {
    if (!expense) return
    setDeleting(true)
    try {
      await removeExpense(expense.id)
      toast.success('Expense deleted')
      onOpenChange(false)
      onDeleted?.()
    } catch {
      toast.error('The expense couldn’t be deleted. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !deleting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this expense?</DialogTitle>
          <DialogDescription>
            {expense
              ? `“${expense.title}” (${formatINR(expense.amount)}) will be removed permanently. Your totals update straight away.`
              : 'This expense will be removed permanently.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
