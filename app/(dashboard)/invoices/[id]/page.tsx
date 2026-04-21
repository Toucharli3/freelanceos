'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInvoice, useInvoices } from '@/hooks/use-invoices'
import { useProfile } from '@/hooks/use-profile'
import { Header } from '@/components/layout/header'
import { InvoiceStatusBadge } from '@/components/features/invoices/invoice-status-badge'
import { InvoicePDFButton } from '@/components/features/invoices/invoice-pdf-button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowLeft, ChevronDown, CheckCircle, Send, Trash2, Mail, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Invoice } from '@/types/database'
import toast from 'react-hot-toast'

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: invoice, isLoading } = useInvoice(id)
  const { updateInvoiceStatus, deleteInvoice } = useInvoices()
  const { profile } = useProfile()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sending, setSending] = useState(false)

  if (isLoading) {
    return (
      <>
        <Header title="Facture" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </>
    )
  }
  if (!invoice) return null

  const STATUS_TRANSITIONS: Partial<Record<Invoice['status'], { status: Invoice['status']; label: string }[]>> = {
    draft: [{ status: 'sent', label: 'Marquer envoyée' }, { status: 'paid', label: 'Marquer payée' }],
    sent: [{ status: 'paid', label: 'Marquer payée' }, { status: 'overdue', label: 'Marquer en retard' }],
    overdue: [{ status: 'paid', label: 'Marquer payée' }],
  }

  const transitions = STATUS_TRANSITIONS[invoice.status] ?? []

  const handleSendEmail = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: id }),
      })
      if (response.ok) {
        updateInvoiceStatus({ id, status: 'sent' })
        toast.success('Facture envoyée par email !')
      } else {
        toast.error('Erreur lors de l\'envoi')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Header
        title={invoice.invoice_number}
        actions={
          <div className="flex items-center gap-2">
            {invoice.clients?.email && (
              <Button variant="outline" size="sm" onClick={handleSendEmail} disabled={sending} className="gap-2">
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                Envoyer
              </Button>
            )}
            <InvoicePDFButton invoice={invoice} profile={profile} />
            {transitions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-[#6366F1] hover:bg-[#4F46E5] gap-1">
                    Actions
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {transitions.map(t => (
                    <DropdownMenuItem key={t.status} onClick={() => updateInvoiceStatus({ id, status: t.status })}>
                      <CheckCircle className="w-3.5 h-3.5 mr-2" />
                      {t.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem className="text-red-500" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      <div className="p-6 animate-fade-in max-w-4xl">
        <Link href="/invoices" className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] w-fit mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour aux factures
        </Link>

        {/* Facture preview */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A]">FACTURE</h2>
              <p className="text-lg font-mono text-[#6366F1] mt-1">{invoice.invoice_number}</p>
              <div className="mt-2">
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-[#0F172A]">{profile?.business_name ?? profile?.full_name}</p>
              {profile?.address && <p className="text-[#64748B]">{profile.address}</p>}
              {profile?.city && <p className="text-[#64748B]">{profile.zip_code} {profile.city}</p>}
              {profile?.siret && <p className="text-xs text-[#64748B] mt-1">SIRET : {profile.siret}</p>}
            </div>
          </div>

          <Separator />

          {/* Dates & Client */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wide mb-2">Facturé à</p>
              {invoice.clients ? (
                <div className="text-sm">
                  <p className="font-semibold text-[#0F172A]">{invoice.clients.name}</p>
                  {invoice.clients.company && <p className="text-[#64748B]">{invoice.clients.company}</p>}
                  {invoice.clients.email && <p className="text-[#64748B]">{invoice.clients.email}</p>}
                </div>
              ) : (
                <p className="text-sm text-[#64748B]">Client non spécifié</p>
              )}
            </div>
            <div className="text-right">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Émise le</span>
                  <span className="font-medium">{format(new Date(invoice.issue_date), 'dd MMMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Échéance</span>
                  <span className="font-medium">{format(new Date(invoice.due_date), 'dd MMMM yyyy', { locale: fr })}</span>
                </div>
                {invoice.paid_at && (
                  <div className="flex justify-between text-green-600">
                    <span>Payée le</span>
                    <span className="font-medium">{format(new Date(invoice.paid_at), 'dd MMMM yyyy', { locale: fr })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Lignes */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="text-left py-2 text-xs font-medium text-[#64748B]">Description</th>
                  <th className="text-center py-2 text-xs font-medium text-[#64748B] w-16">Qté</th>
                  <th className="text-right py-2 text-xs font-medium text-[#64748B] w-28">Prix unit.</th>
                  <th className="text-right py-2 text-xs font-medium text-[#64748B] w-28">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.invoice_items ?? []).map((item) => (
                  <tr key={item.id} className="border-b border-[#F1F5F9]">
                    <td className="py-3 text-[#0F172A]">{item.description}</td>
                    <td className="py-3 text-center text-[#64748B]">{item.quantity}</td>
                    <td className="py-3 text-right text-[#64748B]">
                      {item.unit_price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="py-3 text-right font-medium text-[#0F172A]">
                      {(item.quantity * item.unit_price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-4">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Sous-total HT</span>
                  <span>{invoice.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">TVA ({invoice.tax_rate}%)</span>
                  <span>{invoice.tax_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total TTC</span>
                  <span className="text-[#6366F1]">
                    {invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-[#64748B] font-medium mb-1">Notes</p>
                <p className="text-sm text-[#0F172A] whitespace-pre-line">{invoice.notes}</p>
              </div>
            </>
          )}

          {profile?.iban && (
            <div className="bg-[#F9FAFB] rounded-lg p-4 text-sm">
              <p className="text-xs text-[#64748B] font-medium mb-1">Coordonnées bancaires</p>
              <p className="font-mono text-[#0F172A]">{profile.iban}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cette facture ?"
        description="Cette action est irréversible."
        onConfirm={() => deleteInvoice(id, { onSuccess: () => router.push('/invoices') })}
      />
    </>
  )
}
