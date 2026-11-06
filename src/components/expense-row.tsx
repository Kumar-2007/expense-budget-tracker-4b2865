import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { CategoryIcon } from '@/components/category'
import { formatINR } from '@/lib/currency'
import { formatDate, type Expense } from '@/lib/expenses'

export function ExpenseRow({ expense }: { expense: Expense }) {
  return (
    <li>
      <Link
        to="/transactions/$expenseId"
        params={{ expenseId: expense.id }}
        className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <CategoryIcon category={expense.category} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{expense.title}</p>
          <p className="truncate text-sm text-muted-foreground">
            {expense.category} · {formatDate(expense.date)}
          </p>
        </div>
        <span className="font-semibold tabular-nums">{formatINR(expense.amount)}</span>
        <ChevronRight
          className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 max-sm:hidden"
          aria-hidden="true"
        />
      </Link>
    </li>
  )
}
