import { Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-base', container: 'w-7 h-7' },
    md: { icon: 'w-5 h-5', text: 'text-lg', container: 'w-8 h-8' },
    lg: { icon: 'w-6 h-6', text: 'text-xl', container: 'w-10 h-10' },
  }

  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('bg-[#6366F1] rounded-lg flex items-center justify-center flex-shrink-0', s.container)}>
        <Briefcase className={cn('text-white', s.icon)} />
      </div>
      {showText && (
        <span className={cn('font-semibold text-[#0F172A]', s.text)}>
          FreelanceOS
        </span>
      )}
    </div>
  )
}
