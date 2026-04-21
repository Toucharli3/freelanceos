import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Invoice, InvoiceWithClient, InvoiceWithItems } from '@/types/database'
import { InvoiceFormValues } from '@/lib/validations'
import toast from 'react-hot-toast'

export function useInvoices(clientId?: string) {
  const supabase = createClient()
  const qc = useQueryClient()

  const { data: invoices = [], isLoading } = useQuery<InvoiceWithClient[]>({
    queryKey: ['invoices', clientId],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, clients(id, name, email, company)')
        .order('created_at', { ascending: false })
      if (clientId) query = query.eq('client_id', clientId)
      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as InvoiceWithClient[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data: invoiceNumber } = await supabase
        .rpc('generate_invoice_number', { p_user_id: user.id })

      const { items, ...invoiceData } = values
      const taxRate = invoiceData.tax_rate ?? 20
      const subtotal = (items ?? []).reduce((s, i) => s + i.quantity * i.unit_price, 0)
      const tax_amount = subtotal * (taxRate / 100)
      const total = subtotal + tax_amount

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: invoiceData.client_id ?? null,
          project_id: invoiceData.project_id ?? null,
          invoice_number: (invoiceNumber as string) ?? `${new Date().getFullYear()}-001`,
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date,
          subtotal,
          tax_rate: taxRate,
          tax_amount,
          total,
          notes: invoiceData.notes ?? null,
          payment_terms: invoiceData.payment_terms ?? null,
        })
        .select()
        .single()
      if (error) throw error
      const inv = invoice as Invoice

      if (items && items.length > 0) {
        const { error: itemsError } = await supabase.from('invoice_items').insert(
          items.map((item, idx) => ({
            invoice_id: inv.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate ?? taxRate,
            sort_order: idx,
          }))
        )
        if (itemsError) throw itemsError
      }

      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'invoice_created',
        entity_type: 'invoice',
        entity_id: inv.id,
        entity_name: inv.invoice_number,
      })

      return inv
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Facture créée !')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Invoice['status'] }) => {
      const updates: Record<string, unknown> = { status }
      if (status === 'sent') updates.sent_at = new Date().toISOString()
      if (status === 'paid') updates.paid_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('invoices')
        .update(updates as { status: Invoice['status']; sent_at?: string; paid_at?: string })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      const inv = data as Invoice

      if (status === 'paid') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('activities').insert({
            user_id: user.id,
            type: 'payment_received',
            entity_type: 'invoice',
            entity_id: inv.id,
            entity_name: inv.invoice_number,
            metadata: { amount: inv.total },
          })
        }
      }
      return inv
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['activities'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Statut mis à jour !')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Facture supprimée')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return {
    invoices,
    isLoading,
    createInvoice: createMutation.mutate,
    updateInvoiceStatus: updateStatusMutation.mutate,
    deleteInvoice: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  }
}

export function useInvoice(id: string) {
  const supabase = createClient()
  return useQuery<InvoiceWithItems>({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*), clients(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as unknown as InvoiceWithItems
    },
    enabled: !!id,
  })
}
