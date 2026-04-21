'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState } from 'react'
import { CommandPalette } from './command-palette'
import { useProfile } from '@/hooks/use-profile'

interface HeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function Header({ title, description, actions }: HeaderProps) {
  const [cmdOpen, setCmdOpen] = useState(false)
  const { profile } = useProfile()

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <>
      <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 sticky top-0 z-20">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A]">{title}</h1>
          {description && <p className="text-xs text-[#64748B]">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-[#64748B] gap-2 hidden sm:flex"
            onClick={() => setCmdOpen(true)}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Rechercher…</span>
            <kbd className="text-xs bg-[#F1F5F9] px-1.5 py-0.5 rounded">⌘K</kbd>
          </Button>

          <Button variant="ghost" size="icon" className="text-[#64748B] relative">
            <Bell className="w-4 h-4" />
          </Button>

          <Avatar className="w-8 h-8 cursor-pointer">
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
