import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarRange,
  PieChart,
  PiggyBank,
  Receipt,
  TrendingDown,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AddExpenseButton, PageHeader, useOpenAddExpense } from '@/components/app-shell'
import { BudgetAlert, BudgetBar } from '@/components/budget-alert'
import { CategoryBars, MonthlyColumns } from '@/components/charts'
import { ExpenseRow } from '@/components/expense-row'
import { EmptyState, LedgerError, ListSkeleton } from '@/components/state-views'
import { formatINR } from '@/lib/currency'
import {
  budgetStatus,
  categoryTotals,
  formatMonthLabel,
  monthKey,
  monthlyTotals,
  sumAmounts,
  todayIso,
} from '@/lib/expenses'
import { useLedger } from '@/lib/store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
  loading,
}: {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  tone?: 'default' | 'danger' | 'success'
  loading: boolean
}) {
  return (
    <Card className="gap-3 py-5">
      <CardContent className="px-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-8 w-32" />
        ) : (
          <p
            className={cn(
              'mt-2 font-display text-2xl font-bold tracking-tight tabular-nums sm:text-[26px]',
              tone === 'danger' && 'text-destructive',
              tone === 'success' && 'text-success',
            )}
          >
            {value}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function Dashboard() {
  const { status, expenses, monthlyBudget } = useLedger()
  const openAdd = useOpenAddExpense()
  const [scope, setScope] = useState<'month' | 'all'>('month')

  const today = todayIso()
  const currentKey = monthKey(today)

  const data = useMemo(() => {
    const thisMonth = expenses.filter((e) => monthKey(e.date) === currentKey)
    const spent = sumAmounts(thisMonth)
    return {
      thisMonth,
      spent,
      allTime: sumAmounts(expenses),
      budget: budgetStatus(monthlyBudget, spent),
      monthCats: categoryTotals(thisMonth),
      allCats: categoryTotals(expenses),
      months: monthlyTotals(expenses, currentKey, 6),
    }
  }, [expenses, monthlyBudget, currentKey])

  const loading = status === 'loading'
  const monthName = formatMonthLabel(currentKey)
  const avg = data.months.reduce((t, m) => t + m.total, 0) / data.months.length
  const busiest = [...data.months].sort((a, b) => b.total - a.total)[0]

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Your spending overview for ${monthName}`}
        action={<AddExpenseButton className="max-md:hidden" />}
      />

      {status === 'error' ? (
        <LedgerError />
      ) : (
        <div className="space-y-6">
          {!loading && <BudgetAlert status={data.budget} />}

          <section aria-label="Monthly statistics" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Total spent"
              value={formatINR(data.spent)}
              hint={`In ${monthName}`}
              icon={TrendingDown}
              loading={loading}
            />
            <StatCard
              label="Monthly budget"
              value={formatINR(monthlyBudget)}
              hint="Change it in Settings"
              icon={Wallet}
              loading={loading}
            />
            <StatCard
              label="Remaining"
              value={formatINR(data.budget.remaining)}
              hint={data.budget.remaining < 0 ? 'Over budget' : 'Budget − spent'}
              icon={PiggyBank}
              tone={data.budget.remaining < 0 ? 'danger' : 'default'}
              loading={loading}
            />
            <StatCard
              label="Transactions"
              value={String(data.thisMonth.length)}
              hint={`${expenses.length} recorded in total`}
              icon={Receipt}
              loading={loading}
            />
          </section>

          <Card className="gap-4 py-5">
            <CardContent className="px-5">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">Budget used this month</p>
                {loading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <p className="text-sm text-muted-foreground tabular-nums">
                    <span className="font-semibold text-foreground">{Math.round(data.budget.percent)}%</span> ·{' '}
                    {formatINR(data.spent)} of {formatINR(monthlyBudget)}
                  </p>
                )}
              </div>
              <BudgetBar status={data.budget} />
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>₹0</span>
                <span className="max-sm:hidden">Warnings at 70% · 90% · 100%</span>
                <span>{formatINR(monthlyBudget)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Spending by category</CardTitle>
                  <CardDescription>
                    {scope === 'month' ? monthName : 'All recorded expenses'}
                  </CardDescription>
                  <CardAction>
                    <div role="group" aria-label="Category period" className="flex rounded-full bg-muted p-1 text-xs font-medium">
                      {(['month', 'all'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={scope === s}
                          onClick={() => setScope(s)}
                          className={cn(
                            'rounded-full px-3 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
                            scope === s ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {s === 'month' ? 'This month' : 'All time'}
                        </button>
                      ))}
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (scope === 'month' ? data.thisMonth.length : expenses.length) === 0 ? (
                    <EmptyState
                      icon={PieChart}
                      title="No spending to chart yet"
                      description={scope === 'month' ? `Expenses you add for ${monthName} appear here by category.` : 'Add an expense to see your category breakdown.'}
                    />
                  ) : (
                    <CategoryBars totals={scope === 'month' ? data.monthCats : data.allCats} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Monthly spending summary</CardTitle>
                  <CardDescription>Last 6 months against your current budget</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-56 w-full" />
                  ) : (
                    <>
                      <MonthlyColumns months={data.months} budget={monthlyBudget} currentKey={currentKey} />
                      <dl className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-muted/60 p-3 text-center text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">6-month average</dt>
                          <dd className="font-semibold tabular-nums">{formatINR(avg)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Highest month</dt>
                          <dd className="font-semibold">{busiest && busiest.total > 0 ? formatMonthLabel(busiest.key, true) : '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">All-time total</dt>
                          <dd className="font-semibold tabular-nums">{formatINR(data.allTime)}</dd>
                        </div>
                      </dl>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="h-fit lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-display text-lg">Recent transactions</CardTitle>
                <CardDescription>Your latest five expenses</CardDescription>
                {expenses.length > 0 && (
                  <CardAction>
                    <Button asChild variant="ghost" size="sm" className="rounded-full">
                      <Link to="/transactions">
                        View all <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent className="px-3">
                {loading ? (
                  <ListSkeleton rows={5} />
                ) : expenses.length === 0 ? (
                  <EmptyState
                    icon={CalendarRange}
                    title="No expenses yet"
                    description="Add your first expense to start tracking your budget."
                    action={<Button onClick={openAdd} className="rounded-full">Add your first expense</Button>}
                  />
                ) : (
                  <ul className="space-y-0.5">
                    {expenses.slice(0, 5).map((e) => (
                      <ExpenseRow key={e.id} expense={e} />
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
