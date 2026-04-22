import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mailer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Invoice, Profile, Client, EmailTemplate } from '@/types/database'

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export async function POST(request: Request) {
  try {
    const { invoiceId } = await request.json()
    if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: rawInvoice, error: invErr } = await supabase
      .from('invoices')
      .select('*, invoice_items(*), clients(*)')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single()

    if (invErr || !rawInvoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    const invoice = rawInvoice as unknown as Invoice & { clients: Client | null; invoice_items: unknown[] }

    if (!invoice.clients?.email) return NextResponse.json({ error: 'Client has no email' }, { status: 400 })

    const { data: rawProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const profile = rawProfile as Profile | null

    const { data: rawTemplate } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'invoice_send')
      .maybeSingle()
    const template = rawTemplate as EmailTemplate | null

    const vars: Record<string, string> = {
      client_name: invoice.clients.name,
      invoice_number: invoice.invoice_number,
      total: invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
      due_date: format(new Date(invoice.due_date), 'dd MMMM yyyy', { locale: fr }),
      business_name: profile?.business_name ?? profile?.full_name ?? 'Votre prestataire',
    }

    const defaultSubject = `Facture ${invoice.invoice_number} — ${vars.business_name}`
    const defaultBody = `Bonjour ${vars.client_name},\n\nVeuillez trouver ci-joint votre facture ${invoice.invoice_number} d'un montant de ${vars.total} TTC, due le ${vars.due_date}.\n\nCordialement,\n${vars.business_name}`

    const subject = interpolate(template?.subject ?? defaultSubject, vars)
    const body = interpolate(template?.body ?? defaultBody, vars)

    await sendEmail({
      to: invoice.clients.email,
      subject,
      text: body,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#0F172A">${body.replace(/\n/g, '<br/>')}</div>`,
    })

    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'invoice_sent',
      entity_type: 'invoice',
      entity_id: invoice.id,
      entity_name: invoice.invoice_number,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
