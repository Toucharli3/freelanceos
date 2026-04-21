import { Button } from './button'

interface EmptyStateProps {
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon ?? (
        <svg className="w-16 h-16 text-[#E2E8F0] mb-4" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="16" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 28h24M20 36h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}
      <h3 className="text-base font-semibold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-xs mb-4">{description}</p>
      {action && (
        <Button
          size="sm"
          className="bg-[#6366F1] hover:bg-[#4F46E5]"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
