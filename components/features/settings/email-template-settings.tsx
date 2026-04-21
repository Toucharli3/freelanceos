'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import type { EmailTemplate, EmailTemplateType } from '@/types/database'

const TEMPLATES: Array<{ type: EmailTemplateType; label: string; defaultSubject: string; defaultBody: string }> = [
  {
    type: 'invoice_send',
    label: 'Envoi facture',
    defaultSubject: 'Facture {{invoice_number}} — {{business_name}}',
    defaultBody: `Bonjour {{client_name}},\n\nVeuillez trouver ci-joint votre facture {{invoice_number}} d'un montant de {{total}} TTC, due le {{due_date}}.\n\nCordialement,\n{{business_name}}`,
  },
  {
    type: 'reminder_1',
    label: 'Relance J+7',
    defaultSubject: '⏰ Rappel — Facture {{invoice_number}} due le {{due_date}}',
    defaultBody: `Bonjour {{client_name}},\n\nJe me permets de vous rappeler que la facture {{invoice_number}} d'un montant de {{total}} TTC est due depuis le {{due_date}}.\n\nCordialement,\n{{business_name}}`,
  },
  {
    type: 'reminder_2',
    label: 'Relance J+14',
    defaultSubject: '⚠️ 2e relance — Facture {{invoice_number}} impayée',
    defaultBody: `Bonjour {{client_name}},\n\nMalgré mon précédent rappel, la facture {{invoice_number}} de {{total}} TTC est toujours impayée.\n\nCordialement,\n{{business_name}}`,
  },
  {
    type: 'reminder_3',
    label: 'Relance J+30',
    defaultSubject: '🚨 Mise en demeure — Facture {{invoice_number}}',
    defaultBody: `Bonjour {{client_name}},\n\nJe vous mets en demeure de régler la facture {{invoice_number}} de {{total}} TTC, en souffrance depuis le {{due_date}}.\n\nCordialement,\n{{business_name}}`,
  },
]

export function EmailTemplateSettings() {
  const supabase = createClient()
  const qc = useQueryClient()
  const [saving, setSaving] = useState<EmailTemplateType | null>(null)
  const [forms, setForms] = useState<Record<string, { subject: string; body: string }>>({})

  const { data: templates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('email_templates').select('*')
      if (error) throw error
      return (data ?? []) as EmailTemplate[]
    },
  })

  useEffect(() => {
    const initial: Record<string, { subject: string; body: string }> = {}
    TEMPLATES.forEach(t => {
      const saved = templates.find(s => s.type === t.type)
      initial[t.type] = {
        subject: saved?.subject ?? t.defaultSubject,
        body: saved?.body ?? t.defaultBody,
      }
    })
    setForms(initial)
  }, [templates])

  const save = async (type: EmailTemplateType) => {
    setSaving(type)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(null); return }

    const existing = templates.find(t => t.type === type)
    const values = forms[type]
    if (!values) { setSaving(null); return }

    if (existing) {
      await supabase.from('email_templates').update({ subject: values.subject, body: values.body }).eq('id', existing.id)
    } else {
      await supabase.from('email_templates').insert({ ...values, type, user_id: user.id })
    }
    toast.success('Template enregistré !')
    qc.invalidateQueries({ queryKey: ['email-templates'] })
    setSaving(null)
  }

  const update = (type: string, field: 'subject' | 'body', value: string) => {
    setForms(f => ({ ...f, [type]: { ...f[type], [field]: value } }))
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-[#0F172A]">Templates email</h3>
        <p className="text-sm text-[#64748B] mt-1">
          Variables disponibles :{' '}
          {['{{client_name}}', '{{invoice_number}}', '{{total}}', '{{due_date}}', '{{business_name}}'].map(v => (
            <code key={v} className="bg-[#F1F5F9] px-1 rounded text-xs mr-1">{v}</code>
          ))}
        </p>
      </div>

      <Tabs defaultValue="invoice_send">
        <TabsList className="bg-[#F1F5F9] mb-4 flex-wrap h-auto gap-1">
          {TEMPLATES.map(t => (
            <TabsTrigger key={t.type} value={t.type} className="text-xs">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {TEMPLATES.map(t => (
          <TabsContent key={t.type} value={t.type} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Objet</Label>
              <Input
                value={forms[t.type]?.subject ?? ''}
                onChange={e => update(t.type, 'subject', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Corps du message</Label>
              <Textarea
                rows={10}
                value={forms[t.type]?.body ?? ''}
                onChange={e => update(t.type, 'body', e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => save(t.type)}
                disabled={saving === t.type}
                className="bg-[#6366F1] hover:bg-[#4F46E5] gap-2"
              >
                {saving === t.type ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
