'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Persist collapse state
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
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar collapsed={collapsed} onToggle={toggle} />

      <main
        className={cn(
          'flex-1 flex flex-col overflow-hidden transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-[240px]'
        )}
      >
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
