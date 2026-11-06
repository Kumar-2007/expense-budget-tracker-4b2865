import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createExpense,
  deleteExpense,
  getLedger,
  saveBudget,
  updateExpense,
} from './ledger.functions'
import {
  DEFAULT_MONTHLY_BUDGET,
  sortByDate,
  type Expense,
  type ExpenseInput,
} from './expenses'

const LEDGER_KEY = 'ebt-ledger-id'

type Status = 'loading' | 'ready' | 'error'

interface LedgerContextValue {
  status: Status
  expenses: Expense[]
  monthlyBudget: number
  retry: () => void
  addExpense: (input: ExpenseInput) => Promise<Expense>
  editExpense: (id: string, input: ExpenseInput) => Promise<Expense>
  removeExpense: (id: string) => Promise<void>
  setMonthlyBudget: (value: number) => Promise<void>
}

const LedgerContext = createContext<LedgerContextValue | null>(null)

/** Returns this browser's private ledger id, creating one on first visit. */
function getOrCreateLedgerId(): string {
  let id = window.localStorage.getItem(LEDGER_KEY)
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    id = crypto.randomUUID()
    window.localStorage.setItem(LEDGER_KEY, id)
  }
  return id
}

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [ledgerId, setLedgerId] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [monthlyBudget, setBudget] = useState(DEFAULT_MONTHLY_BUDGET)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setLedgerId(getOrCreateLedgerId())
  }, [])

  useEffect(() => {
    if (!ledgerId) return
    let cancelled = false
    setStatus('loading')
    getLedger({ data: { ledgerId } })
      .then((res) => {
        if (cancelled) return
        setExpenses(sortByDate(res.expenses))
        setBudget(res.monthlyBudget)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [ledgerId, attempt])

  const requireId = useCallback(() => {
    if (!ledgerId) throw new Error('Ledger not ready')
    return ledgerId
  }, [ledgerId])

  const addExpense = useCallback(
    async (input: ExpenseInput) => {
      const saved = await createExpense({
        data: { ledgerId: requireId(), expense: input },
      })
      setExpenses((list) => sortByDate([saved, ...list]))
      return saved
    },
    [requireId],
  )

  const editExpense = useCallback(
    async (id: string, input: ExpenseInput) => {
      const saved = await updateExpense({
        data: { ledgerId: requireId(), id, expense: input },
      })
      setExpenses((list) =>
        sortByDate(list.map((e) => (e.id === id ? saved : e))),
      )
      return saved
    },
    [requireId],
  )

  const removeExpense = useCallback(
    async (id: string) => {
      await deleteExpense({ data: { ledgerId: requireId(), id } })
      setExpenses((list) => list.filter((e) => e.id !== id))
    },
    [requireId],
  )

  const setMonthlyBudget = useCallback(
    async (value: number) => {
      const res = await saveBudget({
        data: { ledgerId: requireId(), monthlyBudget: value },
      })
      setBudget(res.monthlyBudget)
    },
    [requireId],
  )

  const value = useMemo<LedgerContextValue>(
    () => ({
      status,
      expenses,
      monthlyBudget,
      retry: () => setAttempt((n) => n + 1),
      addExpense,
      editExpense,
      removeExpense,
      setMonthlyBudget,
    }),
    [status, expenses, monthlyBudget, addExpense, editExpense, removeExpense, setMonthlyBudget],
  )

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
}

export function useLedger() {
  const ctx = useContext(LedgerContext)
  if (!ctx) throw new Error('useLedger must be used inside LedgerProvider')
  return ctx
}
