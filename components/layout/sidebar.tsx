'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projets', icon: FolderKanban },
  { href: '/invoices', label: 'Factures', icon: FileText },
  { href: '/settings', label: 'Param\u00e8tres', icon: Settings },
]

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-[#6366F1] text-white shadow-sm'
                : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]',
              collapsed && 'justify-center px-2'
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed top-0 left-0 h-screen bg-white border-r border-[#E2E8F0] z-30 transition-all duration-300',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-16 px-4 border-b border-[#E2E8F0]', collapsed && 'justify-center px-2')}>
          {!collapsed && (
            <span className="text-lg font-bold text-[#0F172A]">FreelanceOS</span>
          )}
          {collapsed && (
            <span className="text-lg font-bold text-[#6366F1]">F</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>

        {/* Toggle button */}
        <div className="p-3 border-t border-[#E2E8F0]">
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-full h-9 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all duration-150"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
          />
          {/* Drawer panel */}
          <aside className="relative z-50 flex flex-col w-64 h-full bg-white shadow-xl animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-[#E2E8F0]">
              <span className="text-lg font-bold text-[#0F172A]">FreelanceOS</span>
              <button
                onClick={onMobileClose}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors duration-150"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              <NavLinks />
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
