# Expense & Budget Tracker

A personal finance web app for tracking day-to-day spending in Indian Rupees (₹). Record expenses, set a monthly budget, and see where your money goes with category and month-by-month breakdowns. Warnings appear when spending reaches 70%, 90% and 100% of the budget.

This repository also contains a companion **Flutter Android app**, the *Personal Expense Tracker*, in [`flutter_app/expense_tracker`](flutter_app/expense_tracker/README.md). It is a separate college project with its own README.

## Features

- **Dashboard**: total spent this month, monthly budget (₹1,000 by default), remaining budget, transaction count, budget progress bar, spending by category, a 6-month spending summary, and recent transactions.
- **Add / edit expense**: title, amount, category (Food, Travel, Bills, Entertainment, Shopping), date and an optional description, all validated.
- **All Transactions**: search, category filter, newest/oldest date sort, totals grouped by month, and empty states.
- **Expense details**: a full view of one expense with Edit, and Delete with confirmation.
- **Settings & Budget**: set or update the monthly limit, see budget progress and over-budget warnings, switch between light and dark themes, and view the FamPay integration status.
- **Responsive navigation**: a sidebar on desktop and tablet, and a bottom navigation bar with a floating Add button on mobile.

## Technology

- TanStack Start (React 19, TanStack Router) with Vite, deployed on Netlify
- Netlify Database (managed Postgres) through Drizzle ORM, used for expenses and budgets
- Tailwind CSS 4 with shadcn/ui components (Radix UI) and lucide icons
- Zod with React Hook Form for validation
- Vitest for tests

## Data and privacy

Each browser gets its own private, anonymous ledger ID, saved in `localStorage`. Expenses and the budget are stored in Netlify Database under that ID, so they stay put between visits with no sign-up. The theme preference is saved in `localStorage`. The app never asks for bank passwords, OTPs, PINs or card details.

## Run locally

```bash
pnpm install
netlify dev          # runs the app with Netlify Database emulation at http://localhost:8888
pnpm test            # unit tests for currency, validation, budget and category maths
```

Database migrations live in `netlify/database/migrations/` and are applied automatically on deploy. After changing `db/schema.ts`, run `npx drizzle-kit generate --name <change_name>`.

## Possible next steps

- User accounts (Netlify Identity), so the same ledger is available on several devices
- Export transactions to CSV
- Custom categories and per-category budgets
- Automatic syncing with payment apps such as FamPay, once an authorised integration exists
