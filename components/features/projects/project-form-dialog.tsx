'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, ProjectFormValues } from '@/lib/validations'
import { useProjects } from '@/hooks/use-projects'
import { useClients } from '@/hooks/use-clients'
import { Project } from '@/types/database'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
  defaultClientId?: string
}

export function ProjectFormDialog({ open, onOpenChange, project, defaultClientId }: ProjectFormDialogProps) {
  const { createProject, updateProject, isCreating, isUpdating } = useProjects()
  const { clients } = useClients()
  const isEditing = !!project

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: 'in_progress', rate_type: 'fixed', rate_amount: 0 },
  })

  const rateType = watch('rate_type')

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        client_id: project.client_id,
        description: project.description ?? '',
        start_date: project.start_date,
        end_date: project.end_date,
        rate_type: project.rate_type,
        rate_amount: project.rate_amount,
        estimated_days: project.estimated_days,
        status: project.status,
      })
    } else {
      reset({ status: 'in_progress', rate_type: 'fixed', rate_amount: 0, client_id: defaultClientId })
    }
  }, [project, open, reset, defaultClientId])

  const onSubmit = (values: ProjectFormValues) => {
    if (isEditing) {
      updateProject({ id: project.id, values }, { onSuccess: () => onOpenChange(false) })
    } else {
      createProject(values, { onSuccess: () => onOpenChange(false) })
    }
  }

  const loading = isCreating || isUpdating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titre *</Label>
            <Input placeholder="Refonte site web, app mobile…" {...register('title')} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Client</Label>
            <Select
              defaultValue={project?.client_id ?? defaultClientId ?? ''}
              onValueChange={(v) => setValue('client_id', v || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Associer un client (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} placeholder="Description de la mission…" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date début</Label>
              <Input type="date" {...register('start_date')} />
            </div>
            <div className="space-y-1.5">
              <Label>Date fin</Label>
              <Input type="date" {...register('end_date')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type de tarif</Label>
              <Select defaultValue="fixed" onValueChange={(v) => setValue('rate_type', v as Project['rate_type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Forfait</SelectItem>
                  <SelectItem value="daily">TJM (par jour)</SelectItem>
                  <SelectItem value="hourly">Taux horaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{rateType === 'fixed' ? 'Montant (€)' : rateType === 'daily' ? 'TJM (€/j)' : 'Taux (€/h)'}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                {...register('rate_amount', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Statut</Label>
            <Select defaultValue={project?.status ?? 'in_progress'} onValueChange={(v) => setValue('status', v as Project['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="on_hold">En pause</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading} className="bg-[#6366F1] hover:bg-[#4F46E5]">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEditing ? 'Enregistrer' : 'Créer le projet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
