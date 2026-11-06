import { z } from 'zod'

export const CATEGORIES = [
  'Food',
  'Travel',
  'Bills',
  'Entertainment',
  'Shopping',
] as const

export type Category = (typeof CATEGORIES)[number]

export const DEFAULT_MONTHLY_BUDGET = 1000

export interface Expense {
  id: string
  title: string
  amount: number
  category: Category
  /** Calendar date in YYYY-MM-DD form (no time zone). */
  date: string
  description: string
  createdAt: string
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d &&
    y >= 1900 &&
    y <= 2100
  )
}

/** Form-level schema: amount arrives as text from the input. */
export const expenseFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Expense title cannot be empty.')
    .max(120, 'Keep the title under 120 characters.'),
  amount: z
    .string()
    .trim()
    .min(1, 'Enter an amount.')
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) || /^-/.test(v), {
      message: 'Amount must be a number, e.g. 250 or 99.50.',
    })
    .refine((v) => !/^-/.test(v), {
      message: 'Amount must be greater than zero.',
    })
    .refine((v) => Number(v) > 0, {
      message: 'Amount must be greater than zero.',
    })
    .refine((v) => Number(v) <= 100000000, {
      message: 'Amount is too large.',
    }),
  category: z
    .string()
    .refine((v): v is Category => (CATEGORIES as readonly string[]).includes(v), {
      message: 'Select a category.',
    }),
  date: z.string().refine(isValidIsoDate, { message: 'Enter a valid date.' }),
  description: z
    .string()
    .trim()
    .max(500, 'Keep the description under 500 characters.'),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>

/** Server-side schema for a saved expense payload. */
export const expenseInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  amount: z.number().positive().max(100000000),
  category: z.enum(CATEGORIES),
  date: z.string().refine(isValidIsoDate, { message: 'Invalid date' }),
  description: z.string().trim().max(500).default(''),
})

export type ExpenseInput = z.infer<typeof expenseInputSchema>

export function formValuesToInput(values: ExpenseFormValues): ExpenseInput {
  return {
    title: values.title.trim(),
    amount: Math.round(Number(values.amount) * 100) / 100,
    category: values.category as Category,
    date: values.date,
    description: values.description.trim(),
  }
}

/** Today's date as YYYY-MM-DD in the user's local time zone. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "2026-11" style key for the month an ISO date belongs to. */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatMonthLabel(key: string, short = false): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', {
    month: short ? 'short' : 'long',
    year: short ? undefined : 'numeric',
  })
}

/** Newest first; ties broken by creation time. */
export function sortByDate(list: Expense[], direction: 'desc' | 'asc' = 'desc') {
  const sorted = [...list].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return a.createdAt < b.createdAt ? 1 : -1
  })
  return direction === 'desc' ? sorted : sorted.reverse()
}

export function sumAmounts(list: Expense[]): number {
  return Math.round(list.reduce((t, e) => t + e.amount, 0) * 100) / 100
}

export function categoryTotals(list: Expense[]): Record<Category, number> {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<
    Category,
    number
  >
  for (const e of list) totals[e.category] = (totals[e.category] ?? 0) + e.amount
  for (const c of CATEGORIES) totals[c] = Math.round(totals[c] * 100) / 100
  return totals
}

/** Totals for the last `count` months, oldest first, ending at `currentKey`. */
export function monthlyTotals(
  list: Expense[],
  currentKey: string,
  count = 6,
): { key: string; total: number; count: number }[] {
  const [y, m] = currentKey.split('-').map(Number)
  const keys: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const dt = new Date(y, m - 1 - i, 1)
    keys.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys.map((key) => {
    const inMonth = list.filter((e) => monthKey(e.date) === key)
    return { key, total: sumAmounts(inMonth), count: inMonth.length }
  })
}

export type BudgetLevel = 'ok' | 'warn70' | 'warn90' | 'over'

export interface BudgetStatus {
  budget: number
  spent: number
  remaining: number
  /** Percentage of budget used (can exceed 100). */
  percent: number
  level: BudgetLevel
}

/** Remaining = Monthly Budget − Total Spent, plus the warning level. */
export function budgetStatus(budget: number, spent: number): BudgetStatus {
  const remaining = Math.round((budget - spent) * 100) / 100
  const percent = budget > 0 ? (spent / budget) * 100 : spent > 0 ? 100 : 0
  let level: BudgetLevel = 'ok'
  if (percent >= 100) level = 'over'
  else if (percent >= 90) level = 'warn90'
  else if (percent >= 70) level = 'warn70'
  return { budget, spent, remaining, percent, level }
}
