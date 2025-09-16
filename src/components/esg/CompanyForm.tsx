'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Building2, MapPin, Users, Factory, Home } from 'lucide-react'
import { LogoUpload } from '@/components/ui/logo-upload'

interface CompanyFormProps {
  onCompanyCreated: (company: any) => void
  onCancel: () => void
  onBackToDashboard?: () => void
  editCompany?: any
  onCompanyUpdated?: (company: any) => void
}

const companySizes = [
  { value: 'small', label: 'Piccola (1-49 dipendenti)', description: 'Micro e piccole imprese' },
  { value: 'medium', label: 'Media (50-249 dipendenti)', description: 'Medie imprese' },
  { value: 'large', label: 'Grande (250+ dipendenti)', description: 'Grandi imprese e multinazionali' }
]

const companySectors = [
  'Agricoltura e Pesca',
  'Industria Alimentare',
  'Tessile e Abbigliamento', 
  'Legno e Mobilio',
  'Carta e Editoria',
  'Chimica e Farmaceutica',
  'Gomma e Plastica',
  'Metallurgia',
  'Meccanica',
  'Elettronica e ICT',
  'Automotive',
  'Energia e Utilities',
  'Costruzioni',
  'Commercio',
  'Trasporti e Logistica',
  'Alberghiero e Ristorazione',
  'Servizi Finanziari',
  'Servizi Professionali',
  'Sanità',
  'Istruzione',
  'Altro'
]

export function CompanyForm({ onCompanyCreated, onCancel, onBackToDashboard, editCompany, onCompanyUpdated }: CompanyFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: editCompany?.name || '',
    sector: editCompany?.sector || '',
    size: editCompany?.size || '',
    location: editCompany?.location || '',
    address: editCompany?.address || '',
    description: editCompany?.description || '',
    website: editCompany?.website || '',
    contact_person: editCompany?.contact_person || '',
    contact_email: editCompany?.contact_email || '',
    contact_phone: editCompany?.contact_phone || '',
    logo_url: editCompany?.logo_url || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      if (editCompany) {
        // Update existing company
        const { data, error } = await supabase
          .from('companies_pcto')
          .update({
            name: formData.name,
            sector: formData.sector,
            size: formData.size,
            location: formData.location,
            address: formData.address || null,
            description: formData.description || null,
            website: formData.website || null,
            contact_person: formData.contact_person || null,
            contact_email: formData.contact_email || null,
            contact_phone: formData.contact_phone || null,
            logo_url: formData.logo_url || null,
          })
          .eq('id', editCompany.id)
          .eq('created_by', user.id)
          .select()
          .single()

        if (error) throw error

        onCompanyUpdated?.(data)
      } else {
        // Create new company
        const { data, error } = await supabase
          .from('companies_pcto')
          .insert([{
            name: formData.name,
            sector: formData.sector,
            size: formData.size,
            location: formData.location,
            address: formData.address || null,
            description: formData.description || null,
            website: formData.website || null,
            contact_person: formData.contact_person || null,
            contact_email: formData.contact_email || null,
            contact_phone: formData.contact_phone || null,
            logo_url: formData.logo_url || null,
            created_by: user.id
          }])
          .select()
          .single()

        if (error) throw error

        onCompanyCreated(data)
      }
    } catch (error: any) {
      console.error('Error saving company:', error)
      alert('Errore nel salvataggio dell\'azienda: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header con pulsante Dashboard */}
      {onBackToDashboard && (
        <div className="mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={onBackToDashboard}
            className="flex items-center space-x-2"
            size="sm"
          >
            <Home className="h-4 w-4" />
            <span className="hidden xs:inline">Dashboard</span>
            <span className="xs:hidden">Home</span>
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl sm:text-2xl">{editCompany ? 'Modifica Azienda' : 'Censimento Azienda'}</CardTitle>
              <CardDescription className="text-sm">
                {editCompany ? 'Modifica i dati dell\'azienda' : 'Inserisci i dati dell\'azienda per creare un nuovo assessment ESG'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informazioni Base */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Informazioni Azienda
                </h3>
                <LogoUpload
                  value={formData.logo_url}
                  onChange={(url) => handleChange('logo_url', url)}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome Azienda *
                  </label>
                  <Input
                    id="name"
                    placeholder="Es. Rossi S.r.l."
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sector" className="text-sm font-medium">
                    Settore *
                  </label>
                  <select
                    id="sector"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.sector}
                    onChange={(e) => handleChange('sector', e.target.value)}
                    required
                  >
                    <option value="">Seleziona settore</option>
                    {companySectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Dimensione Azienda *
                </label>
                <RadioGroup 
                  value={formData.size} 
                  onValueChange={(value) => handleChange('size', value)}
                >
                  {companySizes.map((size) => (
                    <div key={size.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={size.value} id={size.value} className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={size.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {size.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {size.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Ubicazione */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Ubicazione
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Città/Provincia *
                  </label>
                  <Input
                    id="location"
                    placeholder="Es. Milano, MI"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Indirizzo (opzionale)
                  </label>
                  <Input
                    id="address"
                    placeholder="Es. Via Roma 123"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Contatti */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contatti (opzionale)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="contact_person" className="text-sm font-medium">
                    Persona di Riferimento
                  </label>
                  <Input
                    id="contact_person"
                    placeholder="Es. Mario Rossi"
                    value={formData.contact_person}
                    onChange={(e) => handleChange('contact_person', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">
                    Sito Web
                  </label>
                  <Input
                    id="website"
                    placeholder="Es. www.azienda.it"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                  />
                </div>


                <div className="space-y-2">
                  <label htmlFor="contact_email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="info@azienda.it"
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact_phone" className="text-sm font-medium">
                    Telefono
                  </label>
                  <Input
                    id="contact_phone"
                    placeholder="Es. +39 02 1234567"
                    value={formData.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Descrizione */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrizione Attività (opzionale)
              </label>
              <Textarea
                id="description"
                placeholder="Breve descrizione dell'attività dell'azienda..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1"
            size="sm"
          >
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.sector || !formData.size || !formData.location}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2"
            size="sm"
          >
            {loading ? 'Salvataggio...' : (editCompany ? 'Aggiorna Azienda' : 'Salva Azienda')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}