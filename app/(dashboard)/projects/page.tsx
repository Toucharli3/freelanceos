import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { ProjectsContent } from '@/components/features/projects/projects-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProjectsPage() {
  return (
    <>
      <Header title="Projets" description="Suivez vos missions et leur avancement" />
      <div className="p-6">
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          <ProjectsContent />
        </Suspense>
      </div>
    </>
  )
}
