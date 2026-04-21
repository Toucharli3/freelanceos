import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Project, ProjectWithClient } from '@/types/database'
import { ProjectFormValues } from '@/lib/validations'
import toast from 'react-hot-toast'

export function useProject(id: string) {
  const supabase = createClient()
  return useQuery<ProjectWithClient>({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(id, name, company)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as unknown as ProjectWithClient
    },
    enabled: !!id,
  })
}

export function useProjects(clientId?: string) {
  const supabase = createClient()
  const qc = useQueryClient()

  const { data: projects = [], isLoading } = useQuery<ProjectWithClient[]>({
    queryKey: ['projects', clientId],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*, clients(id, name, company)')
        .order('created_at', { ascending: false })
      if (clientId) query = query.eq('client_id', clientId)
      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as ProjectWithClient[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: values.title,
          user_id: user.id,
          client_id: values.client_id ?? null,
          description: values.description ?? null,
          start_date: values.start_date ?? null,
          end_date: values.end_date ?? null,
          rate_type: (values.rate_type ?? 'fixed') as Project['rate_type'],
          rate_amount: values.rate_amount ?? 0,
          estimated_days: values.estimated_days ?? null,
          status: (values.status ?? 'in_progress') as Project['status'],
        })
        .select()
        .single()
      if (error) throw error
      const project = data as Project
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'project_created',
        entity_type: 'project',
        entity_id: project.id,
        entity_name: project.title,
      })
      return project
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Projet créé !')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<ProjectFormValues> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: values.title,
          client_id: values.client_id ?? null,
          description: values.description ?? null,
          start_date: values.start_date ?? null,
          end_date: values.end_date ?? null,
          rate_type: values.rate_type as Project['rate_type'] | undefined,
          rate_amount: values.rate_amount,
          status: values.status as Project['status'] | undefined,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Project
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Projet mis à jour !')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Projet supprimé')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return {
    projects,
    isLoading,
    createProject: createMutation.mutate,
    updateProject: updateMutation.mutate,
    deleteProject: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
