'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useProjects } from '@/hooks/use-projects'
import { ProjectCard } from './project-card'
import { ProjectFormDialog } from './project-form-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Project } from '@/types/database'

const STATUSES: Array<{ value: 'all' | Project['status']; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminés' },
  { value: 'on_hold', label: 'En pause' },
  { value: 'cancelled', label: 'Annulés' },
]

export function ProjectsContent() {
  const { projects, isLoading } = useProjects()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | Project['status']>('all')
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('new') === '1') setOpen(true)
  }, [searchParams])

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s.value
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#6366F1] hover:text-[#6366F1]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Button size="sm" className="bg-[#6366F1] hover:bg-[#4F46E5] gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Nouveau projet
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun projet"
          description="Créez votre premier projet pour commencer à suivre vos missions."
          action={{ label: '+ Nouveau projet', onClick: () => setOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      <ProjectFormDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
