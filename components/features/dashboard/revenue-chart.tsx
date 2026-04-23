'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: { month: string; revenue: number }[]
}

function formatYAxis(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k\u20ac`
  return `${n}\u20ac`
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="44" width="10" height="14" rx="2" fill="#E2E8F0" />
        <rect x="18" y="32" width="10" height="26" rx="2" fill="#CBD5E1" />
        <rect x="32" y="20" width="10" height="38" rx="2" fill="#94A3B8" />
        <rect x="46" y="10" width="10" height="48" rx="2" fill="#6366F1" fillOpacity="0.25" />
        <path d="M6 44 L20 32 L34 20 L48 10" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
        <circle cx="48" cy="10" r="3" fill="#6366F1" fillOpacity="0.5" />
      </svg>
      <div className="text-center">
        <p className="text-sm font-medium text-[#0F172A]">Aucune donn\u00e9e de revenus</p>
        <p className="text-xs text-[#64748B] mt-1">Vos revenus apparaîtront ici une fois les premi\u00e8res factures pay\u00e9es.</p>
      </div>
    </div>
  )
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.every(d => d.revenue === 0)) {
    return <EmptyChart />
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={45} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs shadow-sm">
                <p className="font-medium text-[#0F172A]">{label}</p>
                <p className="text-[#6366F1]">{(payload[0].value as number).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
              </div>
            )
          }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
