import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Client } from '@/types/database'
import { ClientFormValues } from '@/lib/validations'
import toast from 'react-hot-toast'

export function useClients() {
  const supabase = createClient()
  const qc = useQueryClient()

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Client[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: values.name,
          email: values.email ?? null,
          phone: values.phone ?? null,
          company: values.company ?? null,
          address: values.address ?? null,
          city: values.city ?? null,
          zip_code: values.zip_code ?? null,
          country: values.country ?? null,
          siret: values.siret ?? null,
          vat_number: values.vat_number ?? null,
          notes: values.notes ?? null,
          status: (values.status ?? 'active') as Client['status'],
          user_id: user.id,
        })
        .select()
        .single()
      if (error) throw error
      const client = data as Client
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'client_created',
        entity_type: 'client',
        entity_id: client.id,
        entity_name: client.name,
      })
      return client
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Client créé !')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<ClientFormValues> }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: values.name,
          email: values.email ?? null,
          phone: values.phone ?? null,
          company: values.company ?? null,
          address: values.address ?? null,
          city: values.city ?? null,
          zip_code: values.zip_code ?? null,
          siret: values.siret ?? null,
          vat_number: values.vat_number ?? null,
          notes: values.notes ?? null,
          status: values.status as Client['status'] | undefined,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Client
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client mis à jour !')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Client supprimé')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return {
    clients,
    isLoading,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useClient(id: string) {
  const supabase = createClient()

  return useQuery<Client>({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Client
    },
    enabled: !!id,
  })
}
