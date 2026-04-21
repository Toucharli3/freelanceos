'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { InvoiceWithItems, Profile } from '@/types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface InvoicePDFButtonProps {
  invoice: InvoiceWithItems
  profile: Profile | null | undefined
}

export function InvoicePDFButton({ invoice, profile }: InvoicePDFButtonProps) {
  const [generating, setGenerating] = useState(false)

  const generatePDF = async () => {
    setGenerating(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { InvoicePDFDocument } = await import('./invoice-pdf-document')
      const blob = await pdf(<InvoicePDFDocument invoice={invoice} profile={profile} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${invoice.invoice_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur génération PDF:', err)
      toast.error('Impossible de générer le PDF')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={generatePDF} disabled={generating} className="gap-2">
      {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
      PDF
    </Button>
  )
}
