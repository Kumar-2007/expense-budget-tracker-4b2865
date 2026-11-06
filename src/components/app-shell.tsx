import { createContext, useContext, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Moon,
  Plus,
  ReceiptIndianRupee,
  Settings,
  Sun,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpenseFormDialog } from '@/components/expense-form-dialog'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Dashboard', short: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/transactions', label: 'All Transactions', short: 'Transactions', icon: ReceiptIndianRupee, exact: false },
  { to: '/settings', label: 'Settings & Budget', short: 'Settings', icon: Settings, exact: false },
] as const

const AddExpenseContext = createContext<() => void>(() => {})

/** Opens the global Add Expense dialog from anywhere in the app. */
export function useOpenAddExpense() {
  return useContext(AddExpenseContext)
}

export function AddExpenseButton({ className }: { className?: string }) {
  const open = useOpenAddExpense()
  return (
    <Button onClick={open} className={cn('rounded-full', className)}>
      <Plus aria-hidden="true" /> Add expense
    </Button>
  )
}

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      className={cn('rounded-full', className)}
    >
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  )
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card">
        <Wallet className="size-5" aria-hidden="true" />
      </span>
      <span className="font-display text-[15px] leading-tight font-bold">
        Expense &amp;
        <br />
        Budget Tracker
      </span>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <AddExpenseContext.Provider value={() => setAddOpen(true)}>
      <div className="min-h-dvh">
        {/* Desktop / tablet sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
          <div className="px-2">
            <Brand />
          </div>
          <Button onClick={() => setAddOpen(true)} className="mt-8 h-11 rounded-full shadow-card">
            <Plus aria-hidden="true" /> Add expense
          </Button>
          <nav aria-label="Main" className="mt-6 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground motion-reduce:transition-none"
              >
                <item.icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:hidden">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-4" aria-hidden="true" />
            </span>
            Expense Tracker
          </Link>
          <ThemeToggle />
        </header>

        <main className="pb-28 md:pb-12 md:pl-64">
          <div className="mx-auto w-full max-w-content px-4 pt-6 sm:px-6 md:pt-10 lg:px-10">
            {children}
          </div>
        </main>

        {/* Mobile floating add button */}
        <Button
          onClick={() => setAddOpen(true)}
          aria-label="Add expense"
          className="fixed right-4 bottom-20 z-40 size-14 rounded-2xl shadow-lg md:hidden [&_svg]:size-6"
        >
          <Plus aria-hidden="true" />
        </Button>

        {/* Mobile bottom navigation */}
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-3 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="group flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[status=active]:text-primary"
            >
              <span className="inline-flex h-7 w-14 items-center justify-center rounded-full transition-colors group-data-[status=active]:bg-secondary motion-reduce:transition-none">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              {item.short}
            </Link>
          ))}
        </nav>

        <ExpenseFormDialog open={addOpen} onOpenChange={setAddOpen} />
      </div>
    </AddExpenseContext.Provider>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
