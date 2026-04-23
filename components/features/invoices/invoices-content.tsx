'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInvoices } from '@/hooks/use-invoices'
import { InvoiceFormDialog } from './invoice-form-dialog'
import { InvoiceStatusBadge } from './invoice-status-badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Eye, Trash2, CheckCircle, Send, Search } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Invoice } from '@/types/database'

const STATUSES: Array<{ value: 'all' | Invoice['status']; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'sent', label: 'Envoy\u00e9es' },
  { value: 'paid', label: 'Pay\u00e9es' },
  { value: 'overdue', label: 'En retard' },
]

export function InvoicesContent() {
  const { invoices, isLoading, deleteInvoice, updateInvoiceStatus } = useInvoices()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | Invoice['status']>('all')
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get('new') === '1') setOpen(true)
  }, [searchParams])

  const filtered = invoices
    .filter(i => filter === 'all' || i.status === filter)
    .filter(i =>
      !search ||
      (i.invoice_number ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (i.clients?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (i.clients?.company ?? '').toLowerCase().includes(search.toLowerCase())
    )

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
              {s.value !== 'all' && (
                <span className="ml-1.5 opacity-70">{invoices.filter(i => i.status === s.value).length}</span>
              )}
            </button>
          ))}
        </div>
        <Button size="sm" className="bg-[#6366F1] hover:bg-[#4F46E5] gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <Input
          placeholder="Rechercher une facture..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm border-[#E2E8F0] focus-visible:ring-[#6366F1]"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucune facture"
          description="Cr\u00e9ez votre premi\u00e8re facture en quelques clics."
          action={{ label: '+ Nouvelle facture', onClick: () => setOpen(true) }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#E2E8F0] bg-[#F9FAFB]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">N\u00b0</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] hidden md:table-cell">\u00c9ch\u00e9ance</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[#64748B]">Montant</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} className="border-b border-[#F1F5F9] hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[#6366F1] font-semibold">{inv.invoice_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#0F172A]">{inv.clients?.name ?? '\u2014'}</span>
                    {inv.clients?.company && <p className="text-xs text-[#64748B]">{inv.clients.company}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B] hidden sm:table-cell">
                    {format(new Date(inv.issue_date), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B] hidden md:table-cell">
                    {format(new Date(inv.due_date), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {inv.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </td>
                  <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/invoices/${inv.id}`)}>
                          <Eye className="w-3.5 h-3.5 mr-2" /> Voir
                        </DropdownMenuItem>
                        {inv.status === 'draft' && (
                          <DropdownMenuItem onClick={() => updateInvoiceStatus({ id: inv.id, status: 'sent' })}>
                            <Send className="w-3.5 h-3.5 mr-2" /> Envoyer par email
                          </DropdownMenuItem>
                        )}
                        {inv.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => updateInvoiceStatus({ id: inv.id, status: 'paid' })}>
                            <CheckCircle className="w-3.5 h-3.5 mr-2" /> Marquer pay\u00e9e
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-500" onClick={() => setDeleteId(inv.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InvoiceFormDialog open={open} onOpenChange={setOpen} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Supprimer cette facture ?"
        description="Cette action est irr\u00e9versible."
        onConfirm={() => { if (deleteId) deleteInvoice(deleteId, { onSuccess: () => setDeleteId(null) }) }}
      />
    </div>
  )
}
