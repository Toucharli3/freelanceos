'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProject, useProjects } from '@/hooks/use-projects'
import { useInvoices } from '@/hooks/use-invoices'
import { Header } from '@/components/layout/header'
import { ProjectStatusBadge } from '@/components/features/projects/project-status-badge'
import { ProjectFormDialog } from '@/components/features/projects/project-form-dialog'
import { InvoiceStatusBadge } from '@/components/features/invoices/invoice-status-badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Trash2, Calendar, User, Briefcase, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: project, isLoading } = useProject(id)
  const { deleteProject } = useProjects()
  const { invoices } = useInvoices()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <>
        <Header title="Projet" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </>
    )
  }

  if (!project) return null

  const projectInvoices = invoices.filter(i => i.project_id === id)
  const totalBilled = projectInvoices
    .filter(i => i.status !== 'draft' && i.status !== 'cancelled')
    .reduce((s, i) => s + i.total, 0)

  const rateLabel =
    project.rate_type === 'daily' ? '/j' :
    project.rate_type === 'hourly' ? '/h' : ''

  return (
    <>
      <Header
        title={project.title}
        description={project.clients?.name ?? undefined}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="text-red-500 hover:text-red-600 hover:border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6 animate-fade-in">
        <Link href="/projects" className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] w-fit">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour aux projets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Infos principales */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">{project.title}</h2>
                {project.clients && (
                  <Link
                    href={`/clients/${project.clients.id}`}
                    className="text-sm text-[#6366F1] hover:underline mt-0.5 block"
                  >
                    {project.clients.name}
                    {project.clients.company ? ` — ${project.clients.company}` : ''}
                  </Link>
                )}
              </div>
              <ProjectStatusBadge status={project.status} />
            </div>

            {project.description && (
              <>
                <Separator />
                <p className="text-sm text-[#0F172A] whitespace-pre-line">{project.description}</p>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {(project.start_date || project.end_date) && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#64748B] mb-0.5">Période</p>
                    <p className="font-medium text-[#0F172A]">
                      {project.start_date
                        ? format(new Date(project.start_date), 'dd MMM yyyy', { locale: fr })
                        : '—'}
                      {project.end_date
                        ? ` → ${format(new Date(project.end_date), 'dd MMM yyyy', { locale: fr })}`
                        : ''}
                    </p>
                  </div>
                </div>
              )}

              {project.rate_amount > 0 && (
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#64748B] mb-0.5">
                      {project.rate_type === 'fixed' ? 'Forfait' :
                       project.rate_type === 'daily' ? 'TJM' : 'Taux horaire'}
                    </p>
                    <p className="font-medium text-[#0F172A]">
                      {project.rate_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}{rateLabel}
                    </p>
                  </div>
                </div>
              )}

              {project.estimated_days && (
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#64748B] mb-0.5">Jours estimés</p>
                    <p className="font-medium text-[#0F172A]">{project.estimated_days} j</p>
                  </div>
                </div>
              )}
            </div>
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
              <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">Factures</p>
              <p className="text-2xl font-bold text-[#0F172A]">{projectInvoices.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">Créé le</p>
              <p className="text-sm font-semibold text-[#0F172A]">
                {format(new Date(project.created_at), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        {/* Factures liées */}
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Factures liées</h3>
          {projectInvoices.length === 0 ? (
            <EmptyState
              title="Aucune facture"
              description="Créez une facture liée à ce projet."
              action={{
                label: '+ Nouvelle facture',
                onClick: () => router.push(`/invoices?new=1`),
              }}
            />
          ) : (
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-[#E2E8F0] bg-[#F9FAFB]">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Numéro</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#64748B]">Montant</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {projectInvoices.map(inv => (
                    <tr
                      key={inv.id}
                      className="border-b border-[#F1F5F9] hover:bg-[#F9FAFB] cursor-pointer"
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#6366F1]">{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-[#64748B]">
                        {format(new Date(inv.issue_date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                        {inv.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer ce projet ?"
        description="Cette action est irréversible."
        onConfirm={() => deleteProject(id, { onSuccess: () => router.push('/projects') })}
      />
    </>
  )
}
