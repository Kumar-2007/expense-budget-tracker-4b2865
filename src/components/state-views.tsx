import { CloudOff, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLedger } from '@/lib/store'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function LedgerError() {
  const { retry } = useLedger()
  return (
    <div role="alert" className="rounded-2xl border bg-card shadow-card">
      <EmptyState
        icon={CloudOff}
        title="Couldn’t load your expenses"
        description="We couldn’t reach the server. Your data is safe — check your connection and try again."
        action={<Button onClick={retry}>Try again</Button>}
      />
    </div>
  )
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="space-y-1" aria-busy="true" aria-label="Loading expenses">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-16" />
        </li>
      ))}
    </ul>
  )
}
