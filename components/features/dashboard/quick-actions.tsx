'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserPlus, FileText } from 'lucide-react'

export function QuickActions() {
  const router = useRouter()
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Actions rapides</h3>
      <div className="flex flex-wrap gap-3">
        <Button
          size="sm"
          className="bg-[#6366F1] hover:bg-[#4F46E5] gap-2"
          onClick={() => router.push('/clients?new=1')}
        >
          <UserPlus className="w-4 h-4" />
          Nouveau client
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => router.push('/invoices?new=1')}
        >
          <FileText className="w-4 h-4" />
          Nouvelle facture
        </Button>
      </div>
    </div>
  )
}
