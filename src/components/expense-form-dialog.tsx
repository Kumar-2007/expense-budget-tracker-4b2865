import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategoryIcon } from '@/components/category'
import {
  CATEGORIES,
  expenseFormSchema,
  formValuesToInput,
  todayIso,
  type Expense,
  type ExpenseFormValues,
} from '@/lib/expenses'
import { useLedger } from '@/lib/store'

function initialValues(expense?: Expense | null): ExpenseFormValues {
  if (expense) {
    return {
      title: expense.title,
      amount: expense.amount.toFixed(2).replace(/\.00$/, ''),
      category: expense.category,
      date: expense.date,
      description: expense.description,
    }
  }
  return { title: '', amount: '', category: '', date: todayIso(), description: '' }
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an expense to edit it; omit to add a new one. */
  expense?: Expense | null
}) {
  const { addExpense, editExpense, status } = useLedger()
  const isEdit = Boolean(expense)
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialValues(expense),
  })

  useEffect(() => {
    if (open) form.reset(initialValues(expense))
  }, [open, expense, form])

  const submit = form.handleSubmit(async (values) => {
    form.clearErrors('root')
    try {
      const input = formValuesToInput(values)
      if (expense) {
        await editExpense(expense.id, input)
        toast.success('Expense updated')
      } else {
        await addExpense(input)
        toast.success('Expense saved successfully')
      }
      onOpenChange(false)
    } catch {
      form.setError('root', {
        message: 'The expense couldn’t be saved. Check your connection and try again.',
      })
    }
  })

  const submitting = form.formState.isSubmitting

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit expense' : 'Add expense'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details of this expense.'
              : 'Record what you spent. Fields marked * are required.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={submit} noValidate className="space-y-5">
            <fieldset disabled={submitting} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Lunch at canteen" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹) *</FormLabel>
                      <div className="relative">
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
                        >
                          ₹
                        </span>
                        <FormControl>
                          <Input
                            inputMode="decimal"
                            placeholder="0.00"
                            className="pl-7 tabular-nums"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" max="2100-12-31" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full" onBlur={field.onBlur}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            <CategoryIcon category={c} size="sm" className="size-6 rounded-md [&_svg]:size-3.5" />
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="font-normal text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Any notes about this expense" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root && (
                <p role="alert" className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}
            </fieldset>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || status !== 'ready'}>
                {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Save expense'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
