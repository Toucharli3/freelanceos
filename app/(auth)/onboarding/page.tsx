import { OnboardingWizard } from '@/components/features/auth/onboarding-wizard'
import { Logo } from '@/components/layout/logo'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <OnboardingWizard />
      </div>
    </div>
  )
}
