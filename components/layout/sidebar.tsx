'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import {
  LayoutDashboard, Users, FolderOpen, FileText,
  Settings, LogOut, ChevronLeft, Menu
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/projects', icon: FolderOpen, label: 'Projets' },
  { href: '/invoices', icon: FileText, label: 'Factures' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-[#E2E8F0] flex flex-col z-30 transition-all duration-300',
          collapsed ? 'w-16' : 'w-[240px]'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-[#E2E8F0]',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && <Logo size="sm" />}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#64748B] transition-colors"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            const navLink = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-[#EEF2FF] text-[#6366F1]'
                    : 'text-[#64748B] hover:bg-[#F9FAFB] hover:text-[#0F172A]'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }
            return navLink
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#E2E8F0] space-y-1">
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/settings" className={cn(
                    'flex items-center justify-center px-3 py-2 rounded-lg text-sm transition-colors',
                    pathname.startsWith('/settings') ? 'bg-[#EEF2FF] text-[#6366F1]' : 'text-[#64748B] hover:bg-[#F9FAFB]'
                  )}>
                    <Settings className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Paramètres</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm text-[#64748B] hover:bg-[#F9FAFB] hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Déconnexion</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link href="/settings" className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith('/settings') ? 'bg-[#EEF2FF] text-[#6366F1]' : 'text-[#64748B] hover:bg-[#F9FAFB] hover:text-[#0F172A]'
              )}>
                <Settings className="w-4 h-4" />
                Paramètres
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:bg-[#F9FAFB] hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
