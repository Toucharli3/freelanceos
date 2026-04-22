import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mailer'
import { format, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Invoice, Profile, Client, EmailTemplate } from '@/types/database'

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

type InvoiceWithClient = Invoice & { clients: Client | null }

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date()

    const { data: rawInvoices } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .eq('user_id', user.id)
      .in('status', ['sent', 'overdue'])
    const overdueInvoices = (rawInvoices ?? []) as unknown as InvoiceWithClient[]

    if (!overdueInvoices.length) return NextResponse.json({ sent: 0 })

    const { data: rawProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const profile = rawProfile as Profile | null

    const { data: rawTemplates } = await supabase.from('email_templates').select('*').eq('user_id', user.id)
    const templates = (rawTemplates ?? []) as EmailTemplate[]

    let sent = 0

    for (const invoice of overdueInvoices) {
      if (!invoice.clients?.email) continue

      const daysOverdue = differenceInDays(today, new Date(invoice.due_date))
      if (daysOverdue <= 0) continue

      if (invoice.status === 'sent' && daysOverdue > 0) {
        await supabase.from('invoices').update({ status: 'overdue' }).eq('id', invoice.id)
      }

      type ReminderType = 'reminder_1' | 'reminder_2' | 'reminder_3'
      type ReminderField = 'reminder_1_sent_at' | 'reminder_2_sent_at' | 'reminder_3_sent_at'

      let reminderType: ReminderType | null = null
      let reminderField: ReminderField | null = null

      if (daysOverdue >= 7 && !invoice.reminder_1_sent_at) {
        reminderType = 'reminder_1'
        reminderField = 'reminder_1_sent_at'
      } else if (daysOverdue >= 14 && !invoice.reminder_2_sent_at) {
        reminderType = 'reminder_2'
        reminderField = 'reminder_2_sent_at'
      } else if (daysOverdue >= 30 && !invoice.reminder_3_sent_at) {
        reminderType = 'reminder_3'
        reminderField = 'reminder_3_sent_at'
      }

      if (!reminderType || !reminderField) continue

      const template = templates.find(t => t.type === reminderType)
      const vars: Record<string, string> = {
        client_name: invoice.clients.name,
        invoice_number: invoice.invoice_number,
        total: invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
        due_date: format(new Date(invoice.due_date), 'dd MMMM yyyy', { locale: fr }),
        business_name: profile?.business_name ?? profile?.full_name ?? 'Votre prestataire',
      }

      const subject = interpolate(template?.subject ?? `Relance — Facture ${invoice.invoice_number}`, vars)
      const body = interpolate(template?.body ?? `Relance pour la facture ${invoice.invoice_number}`, vars)

      try {
        await sendEmail({
          to: invoice.clients.email,
          subject,
          text: body,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#0F172A">${body.replace(/\n/g, '<br/>')}</div>`,
        })
        const patch: Record<string, string> = { [reminderField]: today.toISOString() }
        await supabase.from('invoices').update(patch as { reminder_1_sent_at?: string; reminder_2_sent_at?: string; reminder_3_sent_at?: string }).eq('id', invoice.id)
        sent++
      } catch (e) {
        console.error('Reminder send error:', e)
      }
    }

    return NextResponse.json({ sent })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
