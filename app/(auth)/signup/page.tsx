import { SignupForm } from '@/components/features/auth/signup-form'
import { Logo } from '@/components/layout/logo'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#0F172A]">Créer un compte</h1>
            <p className="text-sm text-[#64748B] mt-1">Gérez tous vos clients en un seul endroit</p>
          </div>
          <SignupForm />
        </div>
        <p className="text-center text-sm text-[#64748B] mt-6">
          Déjà un compte ?{' '}
          <a href="/login" className="text-[#6366F1] hover:underline font-medium">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}
