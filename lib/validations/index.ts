import { z } from 'zod'

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Nom requis'),
  business_name: z.string().optional(),
  legal_status: z.string().optional(),
  siret: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  iban: z.string().optional(),
  vat_number: z.string().optional(),
  default_payment_terms: z.number().int().positive().optional(),
  default_invoice_notes: z.string().optional(),
})

export const clientSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  siret: z.string().optional(),
  vat_number: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
})

export const projectSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  client_id: z.string().uuid().optional().nullable(),
  description: z.string().optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  rate_type: z.enum(['fixed', 'daily', 'hourly']).optional(),
  rate_amount: z.number().min(0).optional(),
  estimated_days: z.number().int().positive().optional().nullable(),
  status: z.enum(['in_progress', 'completed', 'on_hold', 'cancelled']).optional(),
})

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().min(0.01, 'Quantité invalide'),
  unit_price: z.number().min(0, 'Prix invalide'),
  tax_rate: z.number().min(0).max(100).optional().nullable(),
})

export const invoiceSchema = z.object({
  client_id: z.string().uuid('Client requis').optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  issue_date: z.string().min(1, 'Date requise'),
  due_date: z.string().min(1, 'Date échéance requise'),
  tax_rate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Au moins une ligne requise'),
}).refine(
  (d) => !d.issue_date || !d.due_date || d.due_date >= d.issue_date,
  { message: "L'échéance doit être après la date d'émission", path: ['due_date'] }
)

export const emailTemplateSchema = z.object({
  type: z.enum(['invoice_send', 'reminder_1', 'reminder_2', 'reminder_3']),
  subject: z.string().min(1, 'Sujet requis'),
  body: z.string().min(1, 'Corps requis'),
})

// Utiliser z.input pour les types de formulaires (compatibilité zodResolver)
export type ProfileFormValues = z.input<typeof profileSchema>
export type ClientFormValues = z.input<typeof clientSchema>
export type ProjectFormValues = z.input<typeof projectSchema>
export type InvoiceFormValues = z.input<typeof invoiceSchema>
export type InvoiceItemFormValues = z.input<typeof invoiceItemSchema>
export type EmailTemplateFormValues = z.input<typeof emailTemplateSchema>
