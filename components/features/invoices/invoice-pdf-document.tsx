import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { InvoiceWithItems, Profile } from '@/types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#0F172A', padding: 48, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  title: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: '#0F172A' },
  invoiceNumber: { fontSize: 14, color: '#6366F1', fontFamily: 'Helvetica-Bold', marginTop: 4 },
  badge: { backgroundColor: '#EEF2FF', color: '#6366F1', padding: '4 8', borderRadius: 4, fontSize: 9, marginTop: 8, alignSelf: 'flex-start' },
  sectionLabel: { fontSize: 8, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  bold: { fontFamily: 'Helvetica-Bold' },
  separator: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginVertical: 16 },
  table: { width: '100%', marginBottom: 16 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 6, marginBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  col1: { flex: 1 },
  col2: { width: 40, textAlign: 'center' },
  col3: { width: 80, textAlign: 'right' },
  col4: { width: 90, textAlign: 'right' },
  colHeader: { fontSize: 8, color: '#64748B', fontFamily: 'Helvetica-Bold' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  totalRowFinal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  totalLabel: { color: '#64748B' },
  totalValue: { fontFamily: 'Helvetica-Bold' },
  totalFinalValue: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: '#6366F1' },
  iban: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 4, marginTop: 16 },
  notes: { marginTop: 12 },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, fontSize: 8, color: '#94A3B8', textAlign: 'center' },
})

function fmtEur(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

function fmtDate(d: string) {
  return format(new Date(d), 'dd MMMM yyyy', { locale: fr })
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon', sent: 'Envoyée', paid: 'Payée', overdue: 'En retard', cancelled: 'Annulée'
}

interface Props { invoice: InvoiceWithItems; profile: Profile | null | undefined }

export function InvoicePDFDocument({ invoice, profile }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FACTURE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <View style={styles.badge}>
              <Text>{STATUS_LABELS[invoice.status]}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.bold}>{profile?.business_name ?? profile?.full_name ?? ''}</Text>
            {profile?.address && <Text style={{ color: '#64748B' }}>{profile.address}</Text>}
            {profile?.city && <Text style={{ color: '#64748B' }}>{profile.zip_code} {profile.city}</Text>}
            {profile?.siret && <Text style={{ color: '#94A3B8', fontSize: 8, marginTop: 4 }}>SIRET : {profile.siret}</Text>}
          </View>
        </View>

        <View style={styles.separator} />

        {/* Dates & client */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View>
            <Text style={styles.sectionLabel}>Facturé à</Text>
            {invoice.clients ? (
              <>
                <Text style={styles.bold}>{invoice.clients.name}</Text>
                {invoice.clients.company && <Text style={{ color: '#64748B' }}>{invoice.clients.company}</Text>}
                {invoice.clients.email && <Text style={{ color: '#64748B' }}>{invoice.clients.email}</Text>}
              </>
            ) : <Text style={{ color: '#64748B' }}>—</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.sectionLabel}>Dates</Text>
            <Text>Émise le : <Text style={styles.bold}>{fmtDate(invoice.issue_date)}</Text></Text>
            <Text>Échéance : <Text style={styles.bold}>{fmtDate(invoice.due_date)}</Text></Text>
            {invoice.paid_at && (
              <Text style={{ color: '#16A34A' }}>Payée le : {fmtDate(invoice.paid_at)}</Text>
            )}
          </View>
        </View>

        <View style={styles.separator} />

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Description</Text>
            <Text style={[styles.col2, styles.colHeader]}>Qté</Text>
            <Text style={[styles.col3, styles.colHeader]}>Prix unit.</Text>
            <Text style={[styles.col4, styles.colHeader]}>Total HT</Text>
          </View>
          {invoice.invoice_items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={[styles.col2, { color: '#64748B' }]}>{item.quantity}</Text>
              <Text style={[styles.col3, { color: '#64748B' }]}>{fmtEur(item.unit_price)}</Text>
              <Text style={[styles.col4, styles.bold]}>{fmtEur(item.quantity * item.unit_price)}</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ width: 240 }}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>Sous-total HT</Text>
              <Text>{fmtEur(invoice.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>TVA ({invoice.tax_rate}%)</Text>
              <Text>{fmtEur(invoice.tax_amount)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text style={[styles.bold, { fontSize: 12 }]}>Total TTC</Text>
              <Text style={styles.totalFinalValue}>{fmtEur(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <View style={styles.separator} />
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={{ color: '#64748B' }}>{invoice.notes}</Text>
          </View>
        )}

        {/* IBAN */}
        {profile?.iban && (
          <View style={styles.iban}>
            <Text style={styles.sectionLabel}>Coordonnées bancaires</Text>
            <Text style={{ fontFamily: 'Courier', fontSize: 9 }}>{profile.iban}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {profile?.business_name ?? profile?.full_name} — {profile?.siret ? `SIRET ${profile.siret}` : ''}
        </Text>
      </Page>
    </Document>
  )
}
