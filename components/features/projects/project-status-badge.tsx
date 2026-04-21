import { Project } from '@/types/database'
import { cn } from '@/lib/utils'

const CONFIG = {
  in_progress: { label: 'En cours', class: 'bg-blue-50 text-blue-600 border-blue-100' },
  completed: { label: 'Terminé', class: 'bg-green-50 text-green-600 border-green-100' },
  on_hold: { label: 'En pause', class: 'bg-amber-50 text-amber-600 border-amber-100' },
  cancelled: { label: 'Annulé', class: 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]' },
}

export function ProjectStatusBadge({ status }: { status: Project['status'] }) {
  const c = CONFIG[status]
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', c.class)}>
      {c.label}
    </span>
  )
}
