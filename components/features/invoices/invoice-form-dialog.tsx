'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { invoiceSchema, InvoiceFormValues } from '@/lib/validations'
import { useInvoices } from '@/hooks/use-invoices'
import { useClients } from '@/hooks/use-clients'
import { useProjects } from '@/hooks/use-projects'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { format, addDays } from 'date-fns'

interface InvoiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultClientId?: string
}

export function InvoiceFormDialog({ open, onOpenChange, defaultClientId }: InvoiceFormDialogProps) {
  const { createInvoice, isCreating } = useInvoices()
  const { clients } = useClients()
  const { projects } = useProjects()
  const [selectedClient, setSelectedClient] = useState(defaultClientId ?? '')

  const today = format(new Date(), 'yyyy-MM-dd')
  const defaultDue = format(addDays(new Date(), 30), 'yyyy-MM-dd')

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issue_date: today,
      due_date: defaultDue,
      tax_rate: 20,
      items: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 20 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')
  const taxRate = watch('tax_rate')

  useEffect(() => {
    if (!open) {
      reset({
        issue_date: today,
        due_date: defaultDue,
        tax_rate: 20,
        items: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 20 }],
      })
      setSelectedClient(defaultClientId ?? '')
    }
  }, [open])

  const subtotal = items.reduce((s, i) => s + (i.quantity || 0) * (i.unit_price || 0), 0)
  const taxAmount = subtotal * ((taxRate ?? 20) / 100)
  const total = subtotal + taxAmount

  const clientProjects = projects.filter(p => p.client_id === selectedClient)

  const onSubmit = (values: InvoiceFormValues) => {
    createInvoice(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle facture</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* En-tête */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Client</Label>
              <Select
                value={selectedClient}
                onValueChange={(v) => {
                  setSelectedClient(v)
                  setValue('client_id', v || null)
                  setValue('project_id', null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClient && clientProjects.length > 0 && (
              <div className="space-y-1.5">
                <Label>Projet lié</Label>
                <Select onValueChange={(v) => setValue('project_id', v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optionnel" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientProjects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Date d&apos;émission *</Label>
              <Input type="date" {...register('issue_date')} />
              {errors.issue_date && <p className="text-xs text-red-500">{errors.issue_date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Date d&apos;échéance *</Label>
              <Input type="date" {...register('due_date')} />
              {errors.due_date && <p className="text-xs text-red-500">{errors.due_date.message}</p>}
            </div>
          </div>

          <Separator />

          {/* Lignes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Lignes de facturation</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[#6366F1] h-7"
                onClick={() => append({ description: '', quantity: 1, unit_price: 0, tax_rate: taxRate })}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Ajouter une ligne
              </Button>
            </div>

            {/* Header colonnes */}
            <div className="grid grid-cols-12 gap-2 mb-1 text-xs text-[#64748B] px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qté</div>
              <div className="col-span-3 text-center">Prix unit.</div>
              <div className="col-span-1 text-right">Total</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-2">
              {fields.map((field, idx) => {
                const q = items[idx]?.quantity || 0
                const p = items[idx]?.unit_price || 0
                return (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Input
                        placeholder="Description de la prestation"
                        className="text-sm h-8"
                        {...register(`items.${idx}.description`)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className="text-sm h-8 text-center"
                        {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="text-sm h-8 text-center"
                        {...register(`items.${idx}.unit_price`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="col-span-1 text-right text-xs font-medium text-[#0F172A]">
                      {(q * p).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#64748B] hover:text-red-500"
                        onClick={() => fields.length > 1 && remove(idx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {errors.items && (
              <p className="text-xs text-red-500 mt-1">{errors.items.message}</p>
            )}
          </div>

          <Separator />

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Sous-total HT</span>
                <span className="font-medium">{subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">TVA</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-16 h-7 text-xs text-center"
                    {...register('tax_rate', { valueAsNumber: true })}
                  />
                  <span className="text-[#64748B]">%</span>
                  <span className="font-medium w-20 text-right">{taxAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span className="text-[#0F172A]">Total TTC</span>
                <span className="text-[#6366F1]">{total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes / Conditions</Label>
            <Textarea rows={2} placeholder="Conditions de paiement, mentions légales…" {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={isCreating} className="bg-[#6366F1] hover:bg-[#4F46E5]">
              {isCreating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Créer la facture
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
