import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { InvoicesContent } from '@/components/features/invoices/invoices-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function InvoicesPage() {
  return (
    <>
      <Header title="Factures" description="Créez et suivez vos factures" />
      <div className="p-6">
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          <InvoicesContent />
        </Suspense>
      </div>
    </>
  )
}
