import {
  Clapperboard,
  Plane,
  ReceiptText,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/expenses'

export const CATEGORY_META: Record<
  Category,
  { icon: LucideIcon; color: string }
> = {
  Food: { icon: UtensilsCrossed, color: 'var(--cat-food)' },
  Travel: { icon: Plane, color: 'var(--cat-travel)' },
  Bills: { icon: ReceiptText, color: 'var(--cat-bills)' },
  Entertainment: { icon: Clapperboard, color: 'var(--cat-entertainment)' },
  Shopping: { icon: ShoppingBag, color: 'var(--cat-shopping)' },
}

export function CategoryIcon({
  category,
  className,
  size = 'md',
}: {
  category: Category
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const meta = CATEGORY_META[category]
  const Icon = meta.icon
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl',
        size === 'sm' && 'size-8 [&_svg]:size-4',
        size === 'md' && 'size-10 [&_svg]:size-5',
        size === 'lg' && 'size-14 rounded-2xl [&_svg]:size-7',
        className,
      )}
      style={{
        color: meta.color,
        backgroundColor: `color-mix(in oklch, ${meta.color} 14%, transparent)`,
      }}
    >
      <Icon />
    </span>
  )
}

export function CategoryBadge({ category }: { category: Category }) {
  const meta = CATEGORY_META[category]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        color: meta.color,
        backgroundColor: `color-mix(in oklch, ${meta.color} 12%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {category}
    </span>
  )
}
