'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator
} from '@/components/ui/command'
import { LayoutDashboard, Users, FolderOpen, FileText, Settings, Plus } from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const navigate = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Rechercher ou naviguer…" />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate('/dashboard')}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => navigate('/clients')}>
            <Users className="w-4 h-4 mr-2" />
            Clients
          </CommandItem>
          <CommandItem onSelect={() => navigate('/projects')}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Projets
          </CommandItem>
          <CommandItem onSelect={() => navigate('/invoices')}>
            <FileText className="w-4 h-4 mr-2" />
            Factures
          </CommandItem>
          <CommandItem onSelect={() => navigate('/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions rapides">
          <CommandItem onSelect={() => navigate('/clients?new=1')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </CommandItem>
          <CommandItem onSelect={() => navigate('/invoices?new=1')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle facture
          </CommandItem>
          <CommandItem onSelect={() => navigate('/projects?new=1')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau projet
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
