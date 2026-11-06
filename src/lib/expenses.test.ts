import { describe, expect, it } from 'vitest'
import { formatINR } from './currency'
import {
  budgetStatus,
  categoryTotals,
  expenseFormSchema,
  formValuesToInput,
  monthlyTotals,
  sortByDate,
  sumAmounts,
  type Expense,
} from './expenses'

const base = { title: 'Lunch', amount: '250', category: 'Food', date: '2026-11-06', description: '' }

function exp(partial: Partial<Expense>): Expense {
  return {
    id: crypto.randomUUID(),
    title: 'x',
    amount: 100,
    category: 'Food',
    date: '2026-11-01',
    description: '',
    createdAt: '2026-11-01T00:00:00.000Z',
    ...partial,
  }
}

describe('formatINR', () => {
  it('formats rupees with two decimals and Indian grouping', () => {
    expect(formatINR(250)).toBe('₹250.00')
    expect(formatINR(1000)).toBe('₹1,000.00')
    expect(formatINR(12500.5)).toBe('₹12,500.50')
    expect(formatINR(125000)).toBe('₹1,25,000.00')
  })
})

describe('expense form validation', () => {
  const errorFor = (values: Record<string, string>, field: string) => {
    const r = expenseFormSchema.safeParse({ ...base, ...values })
    if (r.success) return undefined
    return r.error.issues.find((i) => i.path[0] === field)?.message
  }

  it('accepts a valid expense', () => {
    expect(expenseFormSchema.safeParse(base).success).toBe(true)
  })
  it('rejects an empty title', () => {
    expect(errorFor({ title: '   ' }, 'title')).toMatch(/cannot be empty/)
  })
  it('rejects non-numeric, zero and negative amounts', () => {
    expect(errorFor({ amount: 'abc' }, 'amount')).toMatch(/must be a number/)
    expect(errorFor({ amount: '0' }, 'amount')).toMatch(/greater than zero/)
    expect(errorFor({ amount: '-50' }, 'amount')).toMatch(/greater than zero/)
    expect(errorFor({ amount: '' }, 'amount')).toBeDefined()
  })
  it('requires a category from the list', () => {
    expect(errorFor({ category: '' }, 'category')).toMatch(/Select a category/)
    expect(errorFor({ category: 'Rent' }, 'category')).toBeDefined()
  })
  it('rejects invalid dates', () => {
    expect(errorFor({ date: '2026-02-30' }, 'date')).toBeDefined()
    expect(errorFor({ date: '' }, 'date')).toBeDefined()
  })
  it('converts form values to a numeric payload', () => {
    expect(formValuesToInput({ ...base, amount: '99.5' }).amount).toBe(99.5)
  })
})

describe('budget calculations', () => {
  it('computes remaining = budget − spent', () => {
    expect(budgetStatus(1000, 250).remaining).toBe(750)
    expect(budgetStatus(1000, 1200).remaining).toBe(-200)
  })
  it('raises warnings at 70%, 90% and 100%', () => {
    expect(budgetStatus(1000, 699).level).toBe('ok')
    expect(budgetStatus(1000, 700).level).toBe('warn70')
    expect(budgetStatus(1000, 900).level).toBe('warn90')
    expect(budgetStatus(1000, 1000).level).toBe('over')
    expect(budgetStatus(1000, 1500).level).toBe('over')
  })
})

describe('category and monthly statistics', () => {
  const list = [
    exp({ category: 'Food', amount: 250 }),
    exp({ category: 'Food', amount: 250 }),
    exp({ category: 'Travel', amount: 250, date: '2026-10-15' }),
    exp({ category: 'Shopping', amount: 300.1 }),
    exp({ category: 'Bills', amount: 150 }),
  ]
  it('totals each category', () => {
    const t = categoryTotals(list)
    expect(t).toEqual({ Food: 500, Travel: 250, Bills: 150, Entertainment: 0, Shopping: 300.1 })
    expect(sumAmounts(list)).toBe(1200.1)
  })
  it('groups spending by month', () => {
    const months = monthlyTotals(list, '2026-11', 3)
    expect(months.map((m) => m.key)).toEqual(['2026-09', '2026-10', '2026-11'])
    expect(months[1].total).toBe(250)
    expect(months[2].total).toBe(950.1)
  })
  it('sorts by date, newest first', () => {
    const sorted = sortByDate([exp({ date: '2026-01-01' }), exp({ date: '2026-03-01' }), exp({ date: '2026-02-01' })])
    expect(sorted.map((e) => e.date)).toEqual(['2026-03-01', '2026-02-01', '2026-01-01'])
    expect(sortByDate(sorted, 'asc')[0].date).toBe('2026-01-01')
  })
})
