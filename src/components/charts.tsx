import { CategoryIcon, CATEGORY_META } from '@/components/category'
import { formatINR } from '@/lib/currency'
import { CATEGORIES, formatMonthLabel, type Category } from '@/lib/expenses'
import { cn } from '@/lib/utils'

/** Horizontal bars, one per category, sorted by amount. */
export function CategoryBars({ totals }: { totals: Record<Category, number> }) {
  const grand = CATEGORIES.reduce((t, c) => t + totals[c], 0)
  const max = Math.max(...CATEGORIES.map((c) => totals[c]), 0)
  const rows = [...CATEGORIES].sort((a, b) => totals[b] - totals[a])
  return (
    <ul className="space-y-4" aria-label="Spending by category">
      {rows.map((c) => {
        const value = totals[c]
        const share = grand > 0 ? Math.round((value / grand) * 100) : 0
        const width = max > 0 ? (value / max) * 100 : 0
        return (
          <li key={c} className="flex items-center gap-3">
            <CategoryIcon category={c} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{c}</span>
                <span className="tabular-nums">
                  <span className="font-semibold">{formatINR(value)}</span>
                  <span className="ml-2 inline-block w-9 text-right text-muted-foreground">{share}%</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div
                  className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${width}%`, backgroundColor: CATEGORY_META[c].color, minWidth: value > 0 ? 4 : 0 }}
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Vertical bars for recent months with a dashed budget reference line. */
export function MonthlyColumns({
  months,
  budget,
  currentKey,
}: {
  months: { key: string; total: number; count: number }[]
  budget: number
  currentKey: string
}) {
  const top = Math.max(budget, ...months.map((m) => m.total), 1) * 1.1
  const budgetPos = (budget / top) * 100
  return (
    <div>
      <div className="relative h-48" role="img" aria-label={`Monthly spending for the last ${months.length} months`}>
        <div
          className="absolute inset-x-0 border-t border-dashed border-muted-foreground/50"
          style={{ bottom: `${budgetPos}%` }}
          aria-hidden="true"
        >
          <span className="absolute -top-5 right-0 rounded bg-background px-1 text-[11px] text-muted-foreground">
            Budget {formatINR(budget)}
          </span>
        </div>
        <div className="absolute inset-0 flex items-end justify-between gap-2 sm:gap-4">
          {months.map((m) => {
            const h = (m.total / top) * 100
            const current = m.key === currentKey
            const over = m.total > budget
            return (
              <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end">
                <span className={cn('mb-1 text-[11px] tabular-nums', current ? 'font-semibold' : 'text-muted-foreground')}>
                  {m.total > 0 ? formatINR(m.total).replace(/\.00$/, '') : ''}
                </span>
                <div
                  className={cn(
                    'w-full max-w-12 rounded-t-lg transition-[height] duration-500 motion-reduce:transition-none',
                    over ? 'bg-destructive' : current ? 'bg-primary' : 'bg-primary/30',
                  )}
                  style={{ height: `${h}%`, minHeight: m.total > 0 ? 3 : 0 }}
                  title={`${formatMonthLabel(m.key)}: ${formatINR(m.total)} across ${m.count} expense${m.count === 1 ? '' : 's'}`}
                />
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-between gap-2 border-t pt-2 sm:gap-4">
        {months.map((m) => (
          <span
            key={m.key}
            className={cn(
              'flex-1 text-center text-xs',
              m.key === currentKey ? 'font-semibold text-foreground' : 'text-muted-foreground',
            )}
          >
            {formatMonthLabel(m.key, true)}
          </span>
        ))}
      </div>
    </div>
  )
}
