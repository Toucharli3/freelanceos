'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState } from 'react'
import { CommandPalette } from './command-palette'
import { useProfile } from '@/hooks/use-profile'
import { useMobileMenu } from './mobile-menu-context'

interface HeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function Header({ title, description, actions }: HeaderProps) {
  const [cmdOpen, setCmdOpen] = useState(false)
  const { profile } = useProfile()
  const { openMobileMenu } = useMobileMenu()

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <>
      <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#64748B] transition-all duration-150 flex-shrink-0"
            onClick={openMobileMenu}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] truncate">{title}</h1>
            {description && <p className="text-xs text-[#64748B] hidden sm:block">{description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="text-[#64748B] gap-2 hidden sm:flex hover:border-[#6366F1] hover:text-[#6366F1] transition-all duration-150"
            onClick={() => setCmdOpen(true)}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Rechercherâ¦</span>
            <kbd className="text-xs bg-[#F1F5F9] px-1.5 py-0.5 rounded">âK</kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-[#64748B] relative hover:bg-[#F1F5F9] transition-all duration-150 w-8 h-8"
          >
            <Bell className="w-4 h-4" />
          </Button>

          <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-[#6366F1] transition-all duration-150">
            <AvatarFallback className="bg-[#EEF2FF] text-[#6366F1] text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {actions}
        </div>
      </header>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  )
}
