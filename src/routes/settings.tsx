import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Banknote, Building2, Info, Moon, PencilLine, ShieldCheck, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader, useOpenAddExpense } from '@/components/app-shell'
import { BudgetAlert, BudgetBar } from '@/components/budget-alert'
import { LedgerError } from '@/components/state-views'
import { formatINR } from '@/lib/currency'
import { budgetStatus, formatMonthLabel, monthKey, sumAmounts, todayIso } from '@/lib/expenses'
import { useLedger } from '@/lib/store'
import { useTheme } from '@/lib/theme'

export const Route = createFileRoute('/settings')({
  head: () => ({ meta: [{ title: 'Settings & Budget · Expense & Budget Tracker' }] }),
  component: SettingsPage,
})

const PRESETS = [1000, 2500, 5000, 10000]

function validateBudget(raw: string): string | null {
  const v = raw.trim()
  if (!v) return 'Enter a budget amount.'
  if (/^-/.test(v)) return 'Budget must be greater than zero.'
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return 'Budget must be a number, e.g. 5000 or 2500.50.'
  if (Number(v) <= 0) return 'Budget must be greater than zero.'
  if (Number(v) > 100000000) return 'Budget is too large.'
  return null
}

function BudgetCard() {
  const { status, expenses, monthlyBudget, setMonthlyBudget } = useLedger()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'ready') setValue(String(monthlyBudget))
  }, [status, monthlyBudget])

  const currentKey = monthKey(todayIso())
  const spent = useMemo(
    () => sumAmounts(expenses.filter((e) => monthKey(e.date) === currentKey)),
    [expenses, currentKey],
  )
  const stat = budgetStatus(monthlyBudget, spent)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const problem = validateBudget(value)
    setError(problem)
    if (problem) return
    setSaving(true)
    try {
      await setMonthlyBudget(Math.round(Number(value) * 100) / 100)
      toast.success('Monthly budget saved')
    } catch {
      setError('The budget couldn’t be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const loading = status === 'loading'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Monthly budget</CardTitle>
        <CardDescription>Set how much you plan to spend each month. We warn you at 70%, 90% and 100%.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={save} noValidate className="space-y-3">
          <Label htmlFor="budget">Budget limit (₹)</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">₹</span>
              <Input
                id="budget"
                inputMode="decimal"
                value={value}
                disabled={loading || saving}
                onChange={(e) => {
                  setValue(e.target.value)
                  setError(null)
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'budget-error' : undefined}
                className="h-11 pl-7 text-base tabular-nums"
              />
            </div>
            <Button type="submit" className="h-11 rounded-full px-6" disabled={loading || saving}>
              {saving ? 'Saving…' : 'Save budget'}
            </Button>
          </div>
          {error && (
            <p id="budget-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2" aria-label="Quick budget amounts">
            {PRESETS.map((p) => (
              <Button
                key={p}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={loading || saving}
                onClick={() => {
                  setValue(String(p))
                  setError(null)
                }}
              >
                {formatINR(p).replace(/\.00$/, '')}
              </Button>
            ))}
          </div>
        </form>

        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="mb-3 text-sm font-medium">{formatMonthLabel(currentKey)} progress</p>
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <>
              <BudgetBar status={stat} />
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Budget</dt>
                  <dd className="font-semibold tabular-nums">{formatINR(stat.budget)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Spent</dt>
                  <dd className="font-semibold tabular-nums">{formatINR(stat.spent)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Remaining</dt>
                  <dd className={`font-semibold tabular-nums ${stat.remaining < 0 ? 'text-destructive' : ''}`}>
                    {formatINR(stat.remaining)}
                  </dd>
                </div>
              </dl>
            </>
          )}
        </div>
        {!loading && <BudgetAlert status={stat} />}
      </CardContent>
    </Card>
  )
}

function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Appearance</CardTitle>
        <CardDescription>Your choice is remembered on this device.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              {dark ? <Moon className="size-[18px]" aria-hidden="true" /> : <Sun className="size-[18px]" aria-hidden="true" />}
            </span>
            <div>
              <Label htmlFor="dark-mode" className="font-medium">Dark mode</Label>
              <p className="text-sm text-muted-foreground">{dark ? 'Comfortable dark theme is on' : 'Light theme is on'}</p>
            </div>
          </div>
          <Switch id="dark-mode" checked={dark} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} />
        </div>
      </CardContent>
    </Card>
  )
}

function FamPayLogo() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-11 items-center justify-center rounded-xl bg-[oklch(0.78_0.17_75)] font-display text-sm font-extrabold text-[oklch(0.2_0.02_60)]"
    >
      Fam
    </span>
  )
}

function IntegrationsCard() {
  const [open, setOpen] = useState(false)
  const openAdd = useOpenAddExpense()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Bank &amp; payment integration</CardTitle>
        <CardDescription>Bring in transactions from your payment apps.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3">
            <FamPayLogo />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">FamPay</p>
                <Badge variant="outline">Not connected</Badge>
              </div>
              <p className="text-sm text-muted-foreground">UPI payments and card spends</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(true)}>
            <Building2 aria-hidden="true" /> Connect FamPay
          </Button>
        </div>
        <p className="flex gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          We never ask for your passwords, OTPs, UPI PINs or card details.
        </p>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Automatic syncing isn’t available</DialogTitle>
            <DialogDescription>
              An authorised FamPay integration isn’t available in this app, so no FamPay account has been linked and no transactions
              will be imported automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="flex gap-2 rounded-xl bg-muted p-3">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              You can keep tracking everything by adding expenses manually — your budget, charts and totals work exactly the same.
            </p>
            <p className="flex gap-2 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Never share your password, OTP, PIN or card number with any app that claims to sync FamPay.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setOpen(false)
                openAdd()
              }}
            >
              <PencilLine aria-hidden="true" /> Add expense manually
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function DataCard() {
  const { expenses, status } = useLedger()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Your data</CardTitle>
        <CardDescription>Expenses and your budget are saved securely and restored every time you return in this browser.</CardDescription>
        <CardAction>
          <Banknote className="size-5 text-muted-foreground" aria-hidden="true" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-xs text-muted-foreground">Saved expenses</dt>
            <dd className="font-semibold">{status === 'ready' ? expenses.length : '—'}</dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-xs text-muted-foreground">Currency</dt>
            <dd className="font-semibold">Indian Rupee (₹)</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

function SettingsPage() {
  const { status } = useLedger()
  return (
    <>
      <PageHeader title="Settings & Budget" description="Manage your monthly limit, appearance and connected apps." />
      {status === 'error' ? (
        <LedgerError />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <BudgetCard />
          </div>
          <div className="space-y-6 lg:col-span-2">
            <AppearanceCard />
            <IntegrationsCard />
            <DataCard />
          </div>
        </div>
      )}
    </>
  )
}
