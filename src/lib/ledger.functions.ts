import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index.js'
import { budgets, expenses } from '../../db/schema.js'
import {
  DEFAULT_MONTHLY_BUDGET,
  expenseInputSchema,
  type Category,
  type Expense,
} from './expenses'

const ledgerId = z.string().uuid()

type ExpenseRow = typeof expenses.$inferSelect

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    category: row.category as Category,
    date: row.spentOn,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  }
}

export const getLedger = createServerFn({ method: 'GET' })
  .validator(z.object({ ledgerId }))
  .handler(async ({ data }) => {
    const [rows, budgetRows] = await Promise.all([
      db
        .select()
        .from(expenses)
        .where(eq(expenses.ledgerId, data.ledgerId))
        .orderBy(desc(expenses.spentOn), desc(expenses.createdAt)),
      db.select().from(budgets).where(eq(budgets.ledgerId, data.ledgerId)),
    ])
    return {
      expenses: rows.map(toExpense),
      monthlyBudget: budgetRows[0]
        ? Number(budgetRows[0].monthlyBudget)
        : DEFAULT_MONTHLY_BUDGET,
    }
  })

export const createExpense = createServerFn({ method: 'POST' })
  .validator(z.object({ ledgerId, expense: expenseInputSchema }))
  .handler(async ({ data }) => {
    const { expense } = data
    const [row] = await db
      .insert(expenses)
      .values({
        ledgerId: data.ledgerId,
        title: expense.title,
        amount: expense.amount.toFixed(2),
        category: expense.category,
        spentOn: expense.date,
        description: expense.description,
      })
      .returning()
    return toExpense(row)
  })

export const updateExpense = createServerFn({ method: 'POST' })
  .validator(
    z.object({ ledgerId, id: z.string().uuid(), expense: expenseInputSchema }),
  )
  .handler(async ({ data }) => {
    const { expense } = data
    const [row] = await db
      .update(expenses)
      .set({
        title: expense.title,
        amount: expense.amount.toFixed(2),
        category: expense.category,
        spentOn: expense.date,
        description: expense.description,
        updatedAt: new Date(),
      })
      .where(and(eq(expenses.id, data.id), eq(expenses.ledgerId, data.ledgerId)))
      .returning()
    if (!row) throw new Error('Expense not found')
    return toExpense(row)
  })

export const deleteExpense = createServerFn({ method: 'POST' })
  .validator(z.object({ ledgerId, id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const deleted = await db
      .delete(expenses)
      .where(and(eq(expenses.id, data.id), eq(expenses.ledgerId, data.ledgerId)))
      .returning({ id: expenses.id })
    if (deleted.length === 0) throw new Error('Expense not found')
    return { id: data.id }
  })

export const saveBudget = createServerFn({ method: 'POST' })
  .validator(
    z.object({ ledgerId, monthlyBudget: z.number().positive().max(100000000) }),
  )
  .handler(async ({ data }) => {
    const value = data.monthlyBudget.toFixed(2)
    await db
      .insert(budgets)
      .values({ ledgerId: data.ledgerId, monthlyBudget: value })
      .onConflictDoUpdate({
        target: budgets.ledgerId,
        set: { monthlyBudget: value, updatedAt: new Date() },
      })
    return { monthlyBudget: Number(value) }
  })
