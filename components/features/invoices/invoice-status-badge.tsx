import { Invoice } from '@/types/database'
import { cn } from '@/lib/utils'

const CONFIG = {
  draft: { label: 'Brouillon', class: 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]' },
  sent: { label: 'Envoyée', class: 'bg-blue-50 text-blue-600 border-blue-100' },
  paid: { label: 'Payée', class: 'bg-green-50 text-green-600 border-green-100' },
  overdue: { label: 'En retard', class: 'bg-red-50 text-red-600 border-red-100' },
  cancelled: { label: 'Annulée', class: 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]' },
}

export function InvoiceStatusBadge({ status }: { status: Invoice['status'] }) {
  const c = CONFIG[status]
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', c.class)}>
      {c.label}
    </span>
  )
}
