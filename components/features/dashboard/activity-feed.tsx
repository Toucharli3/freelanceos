import { Activity } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { UserPlus, FileText, CreditCard, FolderOpen } from 'lucide-react'

const ACTIVITY_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  client_created: { icon: <UserPlus className="w-3.5 h-3.5" />, label: 'Nouveau client', color: 'bg-blue-50 text-blue-500' },
  invoice_created: { icon: <FileText className="w-3.5 h-3.5" />, label: 'Facture créée', color: 'bg-indigo-50 text-[#6366F1]' },
  invoice_sent: { icon: <FileText className="w-3.5 h-3.5" />, label: 'Facture envoyée', color: 'bg-amber-50 text-amber-500' },
  payment_received: { icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Paiement reçu', color: 'bg-green-50 text-green-500' },
  project_created: { icon: <FolderOpen className="w-3.5 h-3.5" />, label: 'Projet créé', color: 'bg-purple-50 text-purple-500' },
}

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Activité récente</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-[#64748B] text-center py-8">Aucune activité pour l&apos;instant.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => {
            const config = ACTIVITY_CONFIG[a.type] ?? {
              icon: <FileText className="w-3.5 h-3.5" />,
              label: a.type,
              color: 'bg-[#F1F5F9] text-[#64748B]',
            }
            return (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#0F172A] truncate">
                    {config.label}{a.entity_name ? ` · ${a.entity_name}` : ''}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
