import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function useDashboardStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const now = new Date()
      const monthStart = startOfMonth(now).toISOString()
      const monthEnd = endOfMonth(now).toISOString()

      const [invoicesRes, clientsRes, activitiesRes] = await Promise.all([
        supabase.from('invoices').select('*').eq('user_id', user.id),
        supabase.from('clients').select('id, status').eq('user_id', user.id),
        supabase.from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const allInvoices = invoicesRes.data ?? []

      // CA du mois
      const monthRevenue = allInvoices
        .filter(i => i.status === 'paid' && i.paid_at != null && i.paid_at >= monthStart && i.paid_at <= monthEnd)
        .reduce((s, i) => s + i.total, 0)

      // CA en attente
      const pendingRevenue = allInvoices
        .filter(i => i.status === 'sent' || i.status === 'overdue')
        .reduce((s, i) => s + i.total, 0)

      // Factures en retard
      const overdueCount = allInvoices.filter(i => i.status === 'overdue').length

      // Clients actifs
      const activeClients = (clientsRes.data ?? []).filter(c => c.status === 'active').length

      // Graphique 6 mois
      const revenueChart = Array.from({ length: 6 }, (_, idx) => {
        const month = subMonths(now, 5 - idx)
        const start = startOfMonth(month).toISOString()
        const end = endOfMonth(month).toISOString()
        const revenue = allInvoices
          .filter(i => i.status === 'paid' && i.paid_at != null && i.paid_at >= start && i.paid_at <= end)
          .reduce((s, i) => s + i.total, 0)
        return {
          month: format(month, 'MMM', { locale: fr }),
          revenue,
        }
      })

      return {
        monthRevenue,
        pendingRevenue,
        overdueCount,
        activeClients,
        revenueChart,
        recentActivities: activitiesRes.data ?? [],
      }
    },
  })
}
