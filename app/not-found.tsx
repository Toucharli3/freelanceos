import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-4 max-w-sm px-4">
        <p className="text-6xl font-bold text-[#E2E8F0]">404</p>
        <h1 className="text-xl font-semibold text-[#0F172A]">Page introuvable</h1>
        <p className="text-sm text-[#64748B]">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Button asChild className="bg-[#6366F1] hover:bg-[#4F46E5]">
          <Link href="/dashboard">Retour au tableau de bord</Link>
        </Button>
      </div>
    </div>
  )
}
