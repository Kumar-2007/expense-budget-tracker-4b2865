import { AlertTriangle, CircleAlert, OctagonAlert } from 'lucide-react'
import { formatINR } from '@/lib/currency'
import type { BudgetStatus } from '@/lib/expenses'
import { cn } from '@/lib/utils'

const COPY = {
  warn70: {
    icon: AlertTriangle,
    title: 'You’ve used 70% of your budget',
    tone: 'warning' as const,
  },
  warn90: {
    icon: CircleAlert,
    title: 'Almost there — 90% of your budget is spent',
    tone: 'warning' as const,
  },
  over: {
    icon: OctagonAlert,
    title: 'You’ve reached your monthly budget',
    tone: 'danger' as const,
  },
}

export function BudgetAlert({ status }: { status: BudgetStatus }) {
  if (status.level === 'ok') return null
  const copy = COPY[status.level]
  const Icon = copy.icon
  const message =
    status.remaining < 0
      ? `You’re ${formatINR(Math.abs(status.remaining))} over your ${formatINR(status.budget)} limit this month.`
      : status.remaining === 0
        ? `Your full ${formatINR(status.budget)} budget is spent for this month.`
        : `${formatINR(status.remaining)} left of ${formatINR(status.budget)} this month (${Math.round(status.percent)}% used).`
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-2xl border px-4 py-3',
        copy.tone === 'warning' &&
          'border-warning/40 bg-warning/10 text-warning-foreground',
        copy.tone === 'danger' &&
          'border-destructive/40 bg-destructive/10 text-destructive',
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">{copy.title}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
    </div>
  )
}

export function BudgetBar({
  status,
  className,
}: {
  status: BudgetStatus
  className?: string
}) {
  const pct = Math.min(100, Math.max(0, status.percent))
  const color =
    status.level === 'over'
      ? 'bg-destructive'
      : status.level === 'ok'
        ? 'bg-primary'
        : 'bg-warning'
  return (
    <div
      role="progressbar"
      aria-label="Monthly budget used"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-valuetext={`${Math.round(status.percent)}% of budget used`}
      className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none', color)}
        style={{ width: `${pct}%` }}
      />
      {[70, 90].map((mark) => (
        <span
          key={mark}
          aria-hidden="true"
          className="absolute inset-y-0 w-px bg-background/80"
          style={{ left: `${mark}%` }}
        />
      ))}
    </div>
  )
}
