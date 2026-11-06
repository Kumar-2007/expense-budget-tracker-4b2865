import {
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

/**
 * Each browser gets an anonymous "ledger" id (stored in localStorage) so a
 * person's expenses stay private to them without needing an account.
 */
export const expenses = pgTable(
  'expenses',
  {
    id: uuid().primaryKey().defaultRandom(),
    ledgerId: text('ledger_id').notNull(),
    title: text().notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    category: text().notNull(),
    spentOn: date('spent_on').notNull(),
    description: text().notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('expenses_ledger_idx').on(t.ledgerId, t.spentOn)],
)

export const budgets = pgTable('budgets', {
  ledgerId: text('ledger_id').primaryKey(),
  monthlyBudget: numeric('monthly_budget', { precision: 12, scale: 2 })
    .notNull()
    .default('1000'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
