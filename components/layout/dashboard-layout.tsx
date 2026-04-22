'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { MobileMenuProvider, useMobileMenu } from './mobile-menu-context'
import { cn } from '@/lib/utils'

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const { mobileOpen, closeMobileMenu } = useMobileMenu()

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) setCollapsed(JSON.parse(saved))
  }, [])

  const toggle = () => {
    setCollapsed(c => {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(!c))
      return !c
    })
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobileMenu}
      />

      <main className={cn(
        'flex-1 flex flex-col overflow-hidden transition-all duration-300',
        collapsed ? 'md:ml-16' : 'md:ml-[240px]'
      )}>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileMenuProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </MobileMenuProvider>
  )
}
