'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: { month: string; revenue: number }[]
}

function formatYAxis(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k€`
  return `${n}€`
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.every(d => d.revenue === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-[#64748B]">
        Vos revenus apparaîtront ici une fois les premières factures payées.
      </div>
    )
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
