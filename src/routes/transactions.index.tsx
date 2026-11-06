import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowDownWideNarrow, ArrowUpNarrowWide, ReceiptText, Search, SearchX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddExpenseButton, PageHeader, useOpenAddExpense } from '@/components/app-shell'
import { ExpenseRow } from '@/components/expense-row'
import { EmptyState, LedgerError, ListSkeleton } from '@/components/state-views'
import { formatINR } from '@/lib/currency'
import {
  CATEGORIES,
  formatMonthLabel,
  monthKey,
  sortByDate,
  sumAmounts,
  type Expense,
} from '@/lib/expenses'
import { useLedger } from '@/lib/store'

export const Route = createFileRoute('/transactions/')({
  head: () => ({ meta: [{ title: 'All Transactions · Expense & Budget Tracker' }] }),
  component: TransactionsPage,
})

function TransactionsPage() {
  const { status, expenses } = useLedger()
  const openAdd = useOpenAddExpense()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [order, setOrder] = useState<'desc' | 'asc'>('desc')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = expenses.filter(
      (e) =>
        (category === 'all' || e.category === category) &&
        (!q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
    )
    return sortByDate(list, order)
  }, [expenses, query, category, order])

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const e of filtered) {
      const k = monthKey(e.date)
      map.set(k, [...(map.get(k) ?? []), e])
    }
    return [...map.entries()]
  }, [filtered])

  const filtering = query.trim() !== '' || category !== 'all'

  return (
    <>
      <PageHeader
        title="All Transactions"
        description="Every expense you’ve recorded, sorted by date."
        action={<AddExpenseButton className="max-md:hidden" />}
      />

      {status === 'error' ? (
        <LedgerError />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or description"
                aria-label="Search transactions"
                className="h-10 rounded-full bg-card pl-9"
              />
            </div>
            <div className="flex gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10! flex-1 rounded-full bg-card sm:w-44" aria-label="Filter by category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="h-10 rounded-full bg-card"
                onClick={() => setOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
                aria-label={`Sort by date, currently ${order === 'desc' ? 'newest first' : 'oldest first'}`}
              >
                {order === 'desc' ? <ArrowDownWideNarrow aria-hidden="true" /> : <ArrowUpNarrowWide aria-hidden="true" />}
                {order === 'desc' ? 'Newest' : 'Oldest'}
              </Button>
            </div>
          </div>

          {status === 'ready' && expenses.length > 0 && (
            <p className="mb-3 px-1 text-sm text-muted-foreground" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'} ·{' '}
              <span className="font-medium text-foreground tabular-nums">{formatINR(sumAmounts(filtered))}</span>
              {filtering && ' (filtered)'}
            </p>
          )}

          <Card className="py-2">
            <CardContent className="px-2 sm:px-3">
              {status === 'loading' ? (
                <ListSkeleton rows={6} />
              ) : expenses.length === 0 ? (
                <EmptyState
                  icon={ReceiptText}
                  title="No transactions yet"
                  description="When you add expenses they’ll be listed here, newest first."
                  action={<Button onClick={openAdd} className="rounded-full">Add your first expense</Button>}
                />
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="No matching transactions"
                  description="Try a different search term or category."
                  action={
                    <Button variant="outline" className="rounded-full" onClick={() => { setQuery(''); setCategory('all') }}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <div className="divide-y">
                  {groups.map(([key, list]) => (
                    <section key={key} aria-label={formatMonthLabel(key)} className="py-2">
                      <div className="flex items-baseline justify-between px-3 pt-2 pb-1">
                        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          {formatMonthLabel(key)}
                        </h2>
                        <span className="text-xs text-muted-foreground tabular-nums">{formatINR(sumAmounts(list))}</span>
                      </div>
                      <ul className="space-y-0.5">
                        {list.map((e) => (
                          <ExpenseRow key={e.id} expense={e} />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
