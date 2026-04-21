export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          business_name: string | null
          legal_status: string | null
          siret: string | null
          address: string | null
          city: string | null
          zip_code: string | null
          country: string | null
          phone: string | null
          iban: string | null
          logo_url: string | null
          vat_number: string | null
          default_payment_terms: number | null
          default_invoice_notes: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          business_name?: string | null
          legal_status?: string | null
          siret?: string | null
          address?: string | null
          city?: string | null
          zip_code?: string | null
          country?: string | null
          phone?: string | null
          iban?: string | null
          logo_url?: string | null
          vat_number?: string | null
          default_payment_terms?: number | null
          default_invoice_notes?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          address: string | null
          city: string | null
          zip_code: string | null
          country: string | null
          siret: string | null
          vat_number: string | null
          notes: string | null
          status: 'active' | 'inactive' | 'prospect'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          city?: string | null
          zip_code?: string | null
          country?: string | null
          siret?: string | null
          vat_number?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'prospect'
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          title: string
          description: string | null
          start_date: string | null
          end_date: string | null
          rate_type: 'fixed' | 'daily' | 'hourly'
          rate_amount: number
          estimated_days: number | null
          status: 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          title: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          rate_type?: 'fixed' | 'daily' | 'hourly'
          rate_amount?: number
          estimated_days?: number | null
          status?: 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          project_id: string | null
          invoice_number: string
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          issue_date: string
          due_date: string
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          notes: string | null
          payment_terms: string | null
          sent_at: string | null
          paid_at: string | null
          reminder_1_sent_at: string | null
          reminder_2_sent_at: string | null
          reminder_3_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          project_id?: string | null
          invoice_number: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          issue_date?: string
          due_date: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          payment_terms?: string | null
          sent_at?: string | null
          paid_at?: string | null
          reminder_1_sent_at?: string | null
          reminder_2_sent_at?: string | null
          reminder_3_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
        Relationships: []
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          tax_rate: number | null
          total: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price?: number
          tax_rate?: number | null
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>
        Relationships: []
      }
      email_templates: {
        Row: {
          id: string
          user_id: string
          type: 'invoice_send' | 'reminder_1' | 'reminder_2' | 'reminder_3'
          subject: string
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'invoice_send' | 'reminder_1' | 'reminder_2' | 'reminder_3'
          subject: string
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['email_templates']['Insert']>
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          user_id: string
          type: string
          entity_type: string | null
          entity_id: string | null
          entity_name: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          entity_type?: string | null
          entity_id?: string | null
          entity_name?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['activities']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      generate_invoice_number: {
        Args: { p_user_id: string }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Alias utiles
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']

export type ClientStatus = Client['status']
export type ProjectStatus = Project['status']
export type InvoiceStatus = Invoice['status']
export type RateType = Project['rate_type']
export type EmailTemplateType = EmailTemplate['type']

// Types enrichis (avec relations)
export type InvoiceWithClient = Invoice & {
  clients: Pick<Client, 'id' | 'name' | 'email' | 'company'> | null
}

export type InvoiceWithItems = Invoice & {
  invoice_items: InvoiceItem[]
  clients: Pick<Client, 'id' | 'name' | 'email' | 'company' | 'address' | 'city' | 'zip_code' | 'country'> | null
}

export type ProjectWithClient = Project & {
  clients: Pick<Client, 'id' | 'name' | 'company'> | null
}
