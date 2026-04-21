'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, ClientFormValues } from '@/lib/validations'
import { useClients } from '@/hooks/use-clients'
import { Client } from '@/types/database'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client
}

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const { createClient, updateClient, isCreating, isUpdating } = useClients()
  const isEditing = !!client

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      status: 'active',
      country: 'France',
    },
  })

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email ?? '',
        phone: client.phone ?? '',
        company: client.company ?? '',
        address: client.address ?? '',
        city: client.city ?? '',
        zip_code: client.zip_code ?? '',
        country: client.country ?? 'France',
        siret: client.siret ?? '',
        vat_number: client.vat_number ?? '',
        notes: client.notes ?? '',
        status: client.status,
      })
    } else {
      reset({ status: 'active', country: 'France' })
    }
  }, [client, reset, open])

  const onSubmit = (values: ClientFormValues) => {
    if (isEditing) {
      updateClient({ id: client.id, values }, { onSuccess: () => onOpenChange(false) })
    } else {
      createClient(values, { onSuccess: () => onOpenChange(false) })
    }
  }

  const loading = isCreating || isUpdating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Nom complet *</Label>
              <Input placeholder="Jean Dupont" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Entreprise</Label>
              <Input placeholder="ACME Corp" {...register('company')} />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Email</Label>
              <Input type="email" placeholder="jean@exemple.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Téléphone</Label>
              <Input placeholder="+33 6 00 00 00 00" {...register('phone')} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Adresse</Label>
              <Input placeholder="10 rue de la Paix" {...register('address')} />
            </div>
            <div className="space-y-1.5">
              <Label>Ville</Label>
              <Input placeholder="Paris" {...register('city')} />
            </div>
            <div className="space-y-1.5">
              <Label>Code postal</Label>
              <Input placeholder="75001" {...register('zip_code')} />
            </div>
            <div className="space-y-1.5">
              <Label>SIRET</Label>
              <Input placeholder="000 000 000 00000" {...register('siret')} />
            </div>
            <div className="space-y-1.5">
              <Label>N° TVA</Label>
              <Input placeholder="FR00000000000" {...register('vat_number')} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Statut</Label>
              <Select
                defaultValue={client?.status ?? 'active'}
                onValueChange={(v) => setValue('status', v as Client['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Notes internes sur ce client…"
                rows={3}
                {...register('notes')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#6366F1] hover:bg-[#4F46E5]">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEditing ? 'Enregistrer' : 'Créer le client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
