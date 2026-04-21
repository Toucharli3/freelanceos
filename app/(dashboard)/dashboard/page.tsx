import { Header } from '@/components/layout/header'
import { DashboardContent } from '@/components/features/dashboard/dashboard-content'

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        description="Bienvenue dans FreelanceOS"
      />
      <div className="p-6">
        <DashboardContent />
      </div>
    </>
  )
}
