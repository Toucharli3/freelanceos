'use client'

import { useDashboardStats } from '@/hooks/use-dashboard'
import { MetricCard } from './metric-card'
import { RevenueChart } from './revenue-chart'
import { ActivityFeed } from './activity-feed'
import { QuickActions } from './quick-actions'
import { Skeleton } from '@/components/ui/skeleton'
import { Euro, Clock, Users, AlertCircle } from 'lucide-react'

function formatEuro(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export function DashboardContent() {
  const { data, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CA ce mois"
          value={formatEuro(data?.monthRevenue ?? 0)}
          icon={<Euro className="w-4 h-4" />}
          color="indigo"
        />
        <MetricCard
          title="En attente"
          value={formatEuro(data?.pendingRevenue ?? 0)}
          icon={<Clock className="w-4 h-4" />}
          color="amber"
        />
        <MetricCard
          title="Clients actifs"
          value={String(data?.activeClients ?? 0)}
          icon={<Users className="w-4 h-4" />}
          color="green"
        />
        <MetricCard
          title="Factures en retard"
          value={String(data?.overdueCount ?? 0)}
          icon={<AlertCircle className="w-4 h-4" />}
          color={data?.overdueCount ? 'red' : 'gray'}
        />
      </div>

      {/* Charts + Activité */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-6">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Revenus — 6 derniers mois</h3>
          <RevenueChart data={data?.revenueChart ?? []} />
        </div>
        <ActivityFeed activities={data?.recentActivities ?? []} />
      </div>

      <QuickActions />
    </div>
  )
}
