'use client'

import { ProjectWithClient } from '@/types/database'
import { ProjectStatusBadge } from './project-status-badge'
import { Calendar, User, Euro } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function ProjectCard({ project }: { project: ProjectWithClient }) {
  const rate = project.rate_amount > 0
    ? `${project.rate_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}${
        project.rate_type === 'daily' ? '/j' : project.rate_type === 'hourly' ? '/h' : ''
      }`
    : null

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#6366F1] hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#0F172A] truncate">{project.title}</h3>
          {project.clients && (
            <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
              <User className="w-3 h-3" />
              {project.clients.name}
            </p>
          )}
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      {project.description && (
        <p className="text-xs text-[#64748B] line-clamp-2 mb-3">{project.description}</p>
      )}

      <div className="space-y-1.5">
        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Calendar className="w-3.5 h-3.5" />
            {project.start_date && format(new Date(project.start_date), 'dd MMM', { locale: fr })}
            {project.end_date && ` → ${format(new Date(project.end_date), 'dd MMM yyyy', { locale: fr })}`}
          </div>
        )}
        {rate && (
          <div className="flex items-center gap-2 text-xs text-[#0F172A] font-medium">
            <Euro className="w-3.5 h-3.5 text-[#64748B]" />
            {rate}
          </div>
        )}
      </div>
    </div>
  )
}
