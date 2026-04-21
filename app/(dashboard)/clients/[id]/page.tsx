'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClient, useClients } from '@/hooks/use-clients'
import { useInvoices } from '@/hooks/use-invoices'
import { useProjects } from '@/hooks/use-projects'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClientFormDialog } from '@/components/features/clients/client-form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { InvoiceStatusBadge } from '@/components/features/invoices/invoice-status-badge'
import { ProjectStatusBadge } from '@/components/features/projects/project-status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Edit, Trash2, Mail, Phone, Building2, MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: client, isLoading } = useClient(id)
  const { deleteClient, isDeleting } = useClients()
  const { invoices } = useInvoices(id)
  const { projects } = useProjects(id)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <>
        <Header title="Client" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </>
    )
  }

  if (!client) return null

  const totalBilled = invoices.filter(i => i.status !== 'draft' && i.status !== 'cancelled')
    .reduce((s, i) => s + i.total, 0)

  return (
    <>
      <Header
        title={client.name}
        description={client.company ?? undefined}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Modifier
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}
              className="text-red-500 hover:text-red-600 hover:border-red-200">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6 animate-fade-in">
        <Link href="/clients" className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] w-fit">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour aux clients
        </Link>

        {/* Infos client */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#EEF2FF] rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-[#6366F1]">
                  {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">{client.name}</h2>
                {client.company && <p className="text-sm text-[#64748B]">{client.company}</p>}
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium mt-1 inline-block ${
                  client.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                  client.status === 'prospect' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                }`}>
                  {client.status === 'active' ? 'Actif' : client.status === 'prospect' ? 'Prospect' : 'Inactif'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[#64748B]" />
                  <a href={`mailto:${client.email}`} className="text-[#6366F1] hover:underline">{client.email}</a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[#64748B]" />
                  <span className="text-[#0F172A]">{client.phone}</span>
                </div>
              )}
              {(client.address || client.city) && (
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <MapPin className="w-4 h-4 text-[#64748B]" />
                  <span className="text-[#0F172A]">
                    {[client.address, client.zip_code, client.city].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {client.siret && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-[#64748B]" />
                  <span className="text-[#64748B]">SIRET : {client.siret}</span>
                </div>
              )}
            </div>

            {client.notes && (
              <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg">
                <p className="text-xs text-[#64748B] font-medium mb-1">Notes</p>
                <p className="text-sm text-[#0F172A]">{client.notes}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">Total facturé</p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {totalBilled.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">Projets</p>
              <p className="text-2xl font-bold text-[#0F172A]">{projects.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">Client depuis</p>
              <p className="text-sm font-semibold text-[#0F172A]">
                {format(new Date(client.created_at), 'MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs projets / factures */}
        <Tabs defaultValue="invoices">
          <TabsList className="bg-[#F1F5F9]">
            <TabsTrigger value="invoices">Factures ({invoices.length})</TabsTrigger>
            <TabsTrigger value="projects">Projets ({projects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            {invoices.length === 0 ? (
              <EmptyState
                title="Aucune facture"
                description="Créez la première facture pour ce client."
                action={{ label: '+ Nouvelle facture', onClick: () => router.push(`/invoices?new=1&client=${id}`) }}
              />
            ) : (
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#E2E8F0] bg-[#F9FAFB]">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Numéro</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Échéance</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[#64748B]">Montant</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} className="border-b border-[#F1F5F9] hover:bg-[#F9FAFB] cursor-pointer"
                        onClick={() => router.push(`/invoices/${inv.id}`)}>
                        <td className="px-4 py-3 font-mono text-xs text-[#6366F1]">{inv.invoice_number}</td>
                        <td className="px-4 py-3 text-[#64748B]">{format(new Date(inv.issue_date), 'dd/MM/yyyy')}</td>
                        <td className="px-4 py-3 text-[#64748B]">{format(new Date(inv.due_date), 'dd/MM/yyyy')}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                          {inv.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </td>
                        <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="mt-4">
            {projects.length === 0 ? (
              <EmptyState
                title="Aucun projet"
                description="Créez un projet pour ce client."
                action={{ label: '+ Nouveau projet', onClick: () => router.push(`/projects?new=1&client=${id}`) }}
              />
            ) : (
              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between cursor-pointer hover:border-[#6366F1] transition-colors"
                    onClick={() => router.push(`/projects/${p.id}`)}>
                    <div>
                      <p className="font-medium text-sm text-[#0F172A]">{p.title}</p>
                      {p.start_date && (
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {format(new Date(p.start_date), 'dd MMM yyyy', { locale: fr })}
                          {p.end_date ? ` → ${format(new Date(p.end_date), 'dd MMM yyyy', { locale: fr })}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {p.rate_amount > 0 && (
                        <span className="text-sm font-semibold text-[#0F172A]">
                          {p.rate_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          {p.rate_type !== 'fixed' ? `/${p.rate_type === 'daily' ? 'j' : 'h'}` : ''}
                        </span>
                      )}
                      <ProjectStatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ClientFormDialog open={editOpen} onOpenChange={setEditOpen} client={client} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer ce client ?"
        description="Cette action est irréversible. Les projets et factures associés seront conservés mais sans client lié."
        loading={isDeleting}
        onConfirm={() => deleteClient(client.id, { onSuccess: () => router.push('/clients') })}
      />
    </>
  )
}
