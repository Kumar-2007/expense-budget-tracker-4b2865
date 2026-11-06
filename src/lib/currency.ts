const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formats a number as Indian Rupees, e.g. 12500.5 → "₹12,500.50".
 * Uses the Indian digit grouping (₹1,25,000.00 for one lakh twenty-five thousand).
 */
export function formatINR(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  return inrFormatter.format(safe)
}
