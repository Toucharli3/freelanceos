'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-4 max-w-sm px-4">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-[#0F172A]">Une erreur est survenue</h1>
        <p className="text-sm text-[#64748B]">
          Quelque chose s&apos;est mal passé. Réessayez ou contactez le support si le problème persiste.
        </p>
        <Button onClick={reset} className="bg-[#6366F1] hover:bg-[#4F46E5]">
          Réessayer
        </Button>
      </div>
    </div>
  )
}
