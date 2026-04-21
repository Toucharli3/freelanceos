'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useClients } from '@/hooks/use-clients'
import { ClientCard } from './client-card'
import { ClientFormDialog } from './client-form-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search } from 'lucide-react'
import { Client } from '@/types/database'

const STATUS_LABELS: Record<string, string> = {
  all: 'Tous',
  active: 'Actifs',
  inactive: 'Inactifs',
  prospect: 'Prospects',
}

export function ClientsContent() {
  const { clients, isLoading } = useClients()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | Client['status']>('all')
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('new') === '1') setOpen(true)
  }, [searchParams])

  const filtered = clients.filter(c => {
    const matchFilter = filter === 'all' || c.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(STATUS_LABELS) as Array<'all' | Client['status']>).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#6366F1] hover:text-[#6366F1]'
              }`}
            >
              {STATUS_LABELS[s]}
              {s !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  {clients.filter(c => c.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <Input
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm w-48"
            />
          </div>
          <Button
            size="sm"
            className="bg-[#6366F1] hover:bg-[#4F46E5] gap-2"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Aucun résultat' : 'Aucun client'}
          description={search ? `Aucun client ne correspond à "${search}"` : 'Ajoutez votre premier client pour commencer.'}
          action={!search ? { label: '+ Nouveau client', onClick: () => setOpen(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      <ClientFormDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
