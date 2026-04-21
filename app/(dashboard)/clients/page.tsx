'use client'

import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { ClientsContent } from '@/components/features/clients/clients-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function ClientsPage() {
  return (
    <>
      <Header title="Clients" description="Gérez vos clients et prospects" />
      <div className="p-6">
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          <ClientsContent />
        </Suspense>
      </div>
    </>
  )
}
