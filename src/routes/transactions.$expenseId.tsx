import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, CalendarDays, FileQuestion, NotebookText, Pencil, Tag, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryBadge, CategoryIcon } from '@/components/category'
import { DeleteExpenseDialog } from '@/components/delete-expense-dialog'
import { ExpenseFormDialog } from '@/components/expense-form-dialog'
import { EmptyState, LedgerError } from '@/components/state-views'
import { formatINR } from '@/lib/currency'
import { formatDate } from '@/lib/expenses'
import { useLedger } from '@/lib/store'

export const Route = createFileRoute('/transactions/$expenseId')({
  head: () => ({ meta: [{ title: 'Expense details · Expense & Budget Tracker' }] }),
  component: ExpenseDetail,
})

function BackLink() {
  return (
    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 rounded-full">
      <Link to="/transactions">
        <ArrowLeft aria-hidden="true" /> All transactions
      </Link>
    </Button>
  )
}

function ExpenseDetail() {
  const { expenseId } = Route.useParams()
  const { status, expenses } = useLedger()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const expense = expenses.find((e) => e.id === expenseId) ?? null

  if (status === 'error') return <LedgerError />

  if (status === 'loading') {
    return (
      <>
        <BackLink />
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="size-14 rounded-2xl" />
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </>
    )
  }

  if (!expense) {
    return (
      <>
        <BackLink />
        <Card>
          <EmptyState
            icon={FileQuestion}
            title="Expense not found"
            description="It may have been deleted. Head back to your transactions to see what’s recorded."
            action={
              <Button asChild className="rounded-full">
                <Link to="/transactions">View transactions</Link>
              </Button>
            }
          />
        </Card>
      </>
    )
  }

  return (
    <>
      <BackLink />
      <Card className="mx-auto max-w-2xl gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-4 bg-secondary/60 px-6 py-6 sm:flex-row sm:items-center">
          <CategoryIcon category={expense.category} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight break-words">{expense.title}</h1>
            <div className="mt-1.5">
              <CategoryBadge category={expense.category} />
            </div>
          </div>
          <p className="font-display text-3xl font-bold tracking-tight tabular-nums">{formatINR(expense.amount)}</p>
        </div>
        <CardContent className="px-6 py-6">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div className="flex gap-3">
              <CalendarDays className="mt-0.5 size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-sm text-muted-foreground">Date</dt>
                <dd className="font-medium">{formatDate(expense.date)}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Tag className="mt-0.5 size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-sm text-muted-foreground">Category</dt>
                <dd className="font-medium">{expense.category}</dd>
              </div>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <NotebookText className="mt-0.5 size-5 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-sm text-muted-foreground">Description</dt>
                <dd className={expense.description ? 'break-words whitespace-pre-wrap' : 'text-muted-foreground italic'}>
                  {expense.description || 'No description added'}
                </dd>
              </div>
            </div>
          </dl>
          <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Button variant="outline" className="rounded-full text-destructive hover:text-destructive" onClick={() => setDeleting(true)}>
              <Trash2 aria-hidden="true" /> Delete expense
            </Button>
            <Button className="rounded-full" onClick={() => setEditing(true)}>
              <Pencil aria-hidden="true" /> Edit expense
            </Button>
          </div>
        </CardContent>
      </Card>

      <ExpenseFormDialog open={editing} onOpenChange={setEditing} expense={expense} />
      <DeleteExpenseDialog
        expense={expense}
        open={deleting}
        onOpenChange={setDeleting}
        onDeleted={() => navigate({ to: '/transactions' })}
      />
    </>
  )
}
