'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Building2, Plus, Search, MapPin, Users, Globe } from 'lucide-react'

interface Company {
  id: string
  name: string
  sector: string
  size: string
  location: string
  address?: string
  description?: string
  website?: string
  contact_person?: string
  created_at: string
}

interface CompanySelectorProps {
  onCompanySelect: (company: Company) => void
  onAddNew: () => void
}

export function CompanySelector({ onCompanySelect, onAddNew }: CompanySelectorProps) {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [user])

  const loadCompanies = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('companies_pcto')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'Piccola'
      case 'medium': return 'Media'
      case 'large': return 'Grande'
      default: return size
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">Seleziona Azienda</CardTitle>
                <CardDescription>
                  Scegli un'azienda esistente o aggiungine una nuova per iniziare l'assessment ESG
                </CardDescription>
              </div>
            </div>
            <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuova Azienda
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Barra di ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca per nome, settore o località..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista aziende */}
          <div className="space-y-4">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {companies.length === 0 ? 'Nessuna azienda trovata' : 'Nessun risultato'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {companies.length === 0 
                    ? 'Inizia aggiungendo la prima azienda per i tuoi assessment ESG'
                    : 'Prova a modificare i termini di ricerca'
                  }
                </p>
                <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Prima Azienda
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCompanies.map((company) => (
                  <Card 
                    key={company.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                    onClick={() => onCompanySelect(company)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {company.name}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getSizeLabel(company.size)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                              {company.sector}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              {company.location}
                            </div>
                            {company.website && (
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                                <a 
                                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {company.website}
                                </a>
                              </div>
                            )}
                          </div>
                          
                          {company.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {company.description}
                            </p>
                          )}
                          
                          <div className="text-xs text-gray-400 mt-2">
                            Aggiunta il {new Date(company.created_at).toLocaleDateString('it-IT')}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onCompanySelect(company)
                          }}
                          className="ml-4"
                        >
                          Seleziona
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}