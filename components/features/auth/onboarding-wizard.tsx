'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { Loader2, User, Building2, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Votre profil', icon: User, description: 'Comment vous appelle-t-on ?' },
  { id: 2, title: 'Votre activité', icon: Building2, description: 'Infos légales et professionnelles' },
  { id: 3, title: 'Paiements', icon: CreditCard, description: 'Pour générer vos factures' },
]

const step1Schema = z.object({
  full_name: z.string().min(1, 'Nom requis'),
  phone: z.string().optional(),
})

const step2Schema = z.object({
  business_name: z.string().optional(),
  legal_status: z.string().optional(),
  siret: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip_code: z.string().optional(),
})

const step3Schema = z.object({
  iban: z.string().optional(),
  default_payment_terms: z.string().optional(),
})

type Step1 = z.input<typeof step1Schema>
type Step2 = z.input<typeof step2Schema>
type Step3 = z.input<typeof step3Schema>

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Partial<Step1 & Step2 & Step3>>({})

  const supabase = createClient()

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema) })
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema) })

  const next = async () => {
    if (step === 1) {
      const ok = await form1.trigger()
      if (ok) { setData(d => ({ ...d, ...form1.getValues() })); setStep(2) }
    } else if (step === 2) {
      const ok = await form2.trigger()
      if (ok) { setData(d => ({ ...d, ...form2.getValues() })); setStep(3) }
    }
  }

  const finish = async () => {
    const ok = await form3.trigger()
    if (!ok) return
    const final = { ...data, ...form3.getValues() }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: final.full_name ?? null,
        phone: final.phone ?? null,
        business_name: final.business_name ?? null,
        legal_status: final.legal_status ?? null,
        siret: final.siret ?? null,
        address: final.address ?? null,
        city: final.city ?? null,
        zip_code: final.zip_code ?? null,
        iban: final.iban ?? null,
        default_payment_terms: final.default_payment_terms ? parseInt(final.default_payment_terms) : 30,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Erreur lors de la sauvegarde')
    } else {
      toast.success('Profil configuré !')
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const skip = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
      {/* Progress */}
      <div className="px-8 pt-8 pb-6 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                step > s.id ? 'bg-[#6366F1] text-white' :
                step === s.id ? 'bg-[#6366F1] text-white' :
                'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-16 mx-2 transition-colors ${step > s.id ? 'bg-[#6366F1]' : 'bg-[#E2E8F0]'}`} />
              )}
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#0F172A]">{STEPS[step - 1].title}</h2>
          <p className="text-sm text-[#64748B] mt-1">{STEPS[step - 1].description}</p>
        </div>
      </div>

      <div className="p-8">
        {step === 1 && (
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Votre nom complet *</Label>
              <Input placeholder="Jean Dupont" {...form1.register('full_name')} />
              {form1.formState.errors.full_name && (
                <p className="text-xs text-red-500">{form1.formState.errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input placeholder="+33 6 00 00 00 00" {...form1.register('phone')} />
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nom commercial / Entreprise</Label>
                <Input placeholder="Jean Dupont Design" {...form2.register('business_name')} />
              </div>
              <div className="space-y-2">
                <Label>Statut juridique</Label>
                <Input placeholder="Auto-entrepreneur" {...form2.register('legal_status')} />
              </div>
              <div className="space-y-2">
                <Label>SIRET</Label>
                <Input placeholder="000 000 000 00000" {...form2.register('siret')} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Adresse</Label>
                <Input placeholder="10 rue de la Paix" {...form2.register('address')} />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input placeholder="Paris" {...form2.register('city')} />
              </div>
              <div className="space-y-2">
                <Label>Code postal</Label>
                <Input placeholder="75001" {...form2.register('zip_code')} />
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>IBAN (pour les mentions sur facture)</Label>
              <Input placeholder="FR76 0000 0000 0000 0000 0000 000" {...form3.register('iban')} />
              <p className="text-xs text-[#64748B]">Affiché sur vos factures comme information de paiement</p>
            </div>
            <div className="space-y-2">
              <Label>Délai de paiement par défaut</Label>
              <Select onValueChange={(v) => form3.setValue('default_payment_terms', v)} defaultValue="30">
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Paiement à réception</SelectItem>
                  <SelectItem value="15">15 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="45">45 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        )}

        <div className="flex items-center justify-between mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="text-[#64748B]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>

          {step < 3 ? (
            <Button type="button" onClick={next} className="bg-[#6366F1] hover:bg-[#4F46E5]">
              Continuer
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" onClick={finish} disabled={loading} className="bg-[#6366F1] hover:bg-[#4F46E5]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Commencer FreelanceOS
            </Button>
          )}
        </div>

        {step === 1 && (
          <p className="text-center mt-4">
            <button
              type="button"
              onClick={skip}
              className="text-xs text-[#64748B] hover:text-[#0F172A] underline"
            >
              Passer pour l&apos;instant
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
