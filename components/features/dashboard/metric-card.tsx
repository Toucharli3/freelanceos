import { cn } from '@/lib/utils'

const COLORS = {
  indigo: { bg: 'bg-[#EEF2FF]', text: 'text-[#6366F1]' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-500' },
  green: { bg: 'bg-green-50', text: 'text-green-500' },
  red: { bg: 'bg-red-50', text: 'text-red-500' },
  gray: { bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]' },
}

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: keyof typeof COLORS
  trend?: { value: number; label: string }
}

export function MetricCard({ title, value, icon, color, trend }: MetricCardProps) {
  const c = COLORS[color]
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">{title}</p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', c.bg, c.text)}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
      {trend && (
        <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-green-500' : 'text-red-500')}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  )
}
