'use client'

import Link from 'next/link'
import { Client } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, Building2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  active: { label: 'Actif', class: 'bg-green-50 text-green-600 border-green-100' },
  inactive: { label: 'Inactif', class: 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]' },
  prospect: { label: 'Prospect', class: 'bg-amber-50 text-amber-600 border-amber-100' },
}

export function ClientCard({ client }: { client: Client }) {
  const config = STATUS_CONFIG[client.status]
  const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Link href={`/clients/${client.id}`}>
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#6366F1] hover:shadow-sm transition-all group cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-[#EEF2FF] text-[#6366F1] text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#6366F1] transition-colors">
                {client.name}
              </h3>
              {client.company && (
                <p className="text-xs text-[#64748B] flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {client.company}
                </p>
              )}
            </div>
          </div>
          <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', config.class)}>
            {config.label}
          </span>
        </div>

        <div className="space-y-1.5">
          {client.email && (
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end mt-3 text-xs text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity">
          Voir le profil
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </div>
      </div>
    </Link>
  )
}
