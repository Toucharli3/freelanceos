'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, ProfileFormValues } from '@/lib/validations'
import { useProfile } from '@/hooks/use-profile'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmailTemplateSettings } from '@/components/features/settings/email-template-settings'
import toast from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

export default function SettingsPage() {
  const { profile, isLoading } = useProfile()
  const qc = useQueryClient()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? '',
        business_name: profile.business_name ?? '',
        legal_status: profile.legal_status ?? '',
        siret: profile.siret ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        zip_code: profile.zip_code ?? '',
        phone: profile.phone ?? '',
        iban: profile.iban ?? '',
        vat_number: profile.vat_number ?? '',
        default_payment_terms: profile.default_payment_terms ?? 30,
        default_invoice_notes: profile.default_invoice_notes ?? '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (values: ProfileFormValues) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: values.full_name,
        business_name: values.business_name ?? null,
        legal_status: values.legal_status ?? null,
        siret: values.siret ?? null,
        address: values.address ?? null,
        city: values.city ?? null,
        zip_code: values.zip_code ?? null,
        phone: values.phone ?? null,
        iban: values.iban ?? null,
        vat_number: values.vat_number ?? null,
        default_payment_terms: values.default_payment_terms ?? null,
        default_invoice_notes: values.default_invoice_notes ?? null,
      })
      .eq('id', user.id)
    if (error) {
      toast.error('Erreur lors de la sauvegarde')
    } else {
      toast.success('Profil enregistré !')
      qc.invalidateQueries({ queryKey: ['profile'] })
    }
    setSaving(false)
  }

  if (isLoading) {
    return (
      <>
        <Header title="Paramètres" />
        <div className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Paramètres" description="Gérez votre profil et vos préférences" />
      <div className="p-6 max-w-3xl animate-fade-in">
        <Tabs defaultValue="profile">
          <TabsList className="bg-[#F1F5F9] mb-6">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="invoicing">Facturation</TabsTrigger>
            <TabsTrigger value="emails">Templates email</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-[#0F172A] mb-4">Informations personnelles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nom complet *</Label>
                      <Input {...register('full_name')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Téléphone</Label>
                      <Input {...register('phone')} />
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-[#0F172A] mb-4">Entreprise / Activité</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nom commercial</Label>
                      <Input placeholder="Jean Dupont Design" {...register('business_name')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Statut juridique</Label>
                      <Input placeholder="Auto-entrepreneur" {...register('legal_status')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>SIRET</Label>
                      <Input placeholder="000 000 000 00000" {...register('siret')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>N° TVA intracommunautaire</Label>
                      <Input placeholder="FR00000000000" {...register('vat_number')} />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label>Adresse</Label>
                      <Input {...register('address')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Ville</Label>
                      <Input {...register('city')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Code postal</Label>
                      <Input {...register('zip_code')} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-[#6366F1] hover:bg-[#4F46E5] gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="invoicing">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5">
                <h3 className="font-semibold text-[#0F172A]">Préférences de facturation</h3>
                <div className="space-y-1.5">
                  <Label>IBAN (affiché sur les factures)</Label>
                  <Input placeholder="FR76 0000 0000 0000 0000 0000 000" {...register('iban')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Délai de paiement par défaut</Label>
                  <Select
                    defaultValue={String(profile?.default_payment_terms ?? 30)}
                    onValueChange={(v) => setValue('default_payment_terms', parseInt(v))}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
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
                <div className="space-y-1.5">
                  <Label>Mentions légales par défaut</Label>
                  <Textarea
                    rows={4}
                    placeholder="Pénalités de retard : 3 fois le taux légal..."
                    {...register('default_invoice_notes')}
                  />
                  <p className="text-xs text-[#64748B]">Ajouté automatiquement sur chaque nouvelle facture.</p>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-[#6366F1] hover:bg-[#4F46E5] gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="emails">
            <EmailTemplateSettings />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
