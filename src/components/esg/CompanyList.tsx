'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Users, Factory, Plus, Home, Edit, Trash2, FileText } from 'lucide-react'

interface Company {
  id: string
  name: string
  sector: string
  size: string
  location: string
  address?: string
  contact_person?: string
  contact_email?: string
  contact_phone?: string
  website?: string
  description?: string
  logo_url?: string
  created_at: string
}

interface CompanyListProps {
  onBackToDashboard: () => void
  onAddCompany: () => void
  onSelectCompany: (company: Company) => void
  onEditCompany: (company: Company) => void
}

export function CompanyList({ onBackToDashboard, onAddCompany, onSelectCompany, onEditCompany }: CompanyListProps) {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa azienda? Verranno eliminati anche tutti gli assessment associati.')) {
      return
    }

    try {
      // Elimina prima gli assessment associati
      await supabase
        .from('assessments')
        .delete()
        .eq('company_id', companyId)

      // Poi elimina l'azienda
      const { error } = await supabase
        .from('companies_pcto')
        .delete()
        .eq('id', companyId)

      if (error) throw error

      // Rimuovi anche i dati localStorage
      if (user) {
        localStorage.removeItem(`esg-assessment-${user.id}-${companyId}`)
      }

      // Ricarica la lista
      loadCompanies()
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Errore durante l\'eliminazione dell\'azienda')
    }
  }

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'Piccola (1-49 dip.)'
      case 'medium': return 'Media (50-249 dip.)'
      case 'large': return 'Grande (250+ dip.)'
      default: return size
    }
  }

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'large': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-600 rounded-full" />
          <p className="mt-2 text-gray-600">Caricamento aziende...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl sm:text-2xl">Le tue Aziende</CardTitle>
                <CardDescription className="text-sm">
                  Gestisci le aziende e i relativi assessment ESG
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={onAddCompany}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Nuova Azienda</span>
                <span className="xs:hidden">Nuova</span>
              </Button>
              <Button variant="outline" onClick={onBackToDashboard} size="sm">
                <span className="hidden xs:inline">Dashboard</span>
                <span className="xs:hidden">Home</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessuna azienda trovata
              </h3>
              <p className="text-gray-500 mb-6">
                Inizia creando la tua prima azienda per poter effettuare assessment ESG
              </p>
              <Button
                onClick={onAddCompany}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crea Prima Azienda
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {companies.map((company) => (
                <Card
                  key={company.id}
                  className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {company.name}
                            </h3>
                            <Badge className={getSizeColor(company.size)}>
                              {getSizeLabel(company.size)}
                            </Badge>
                          </div>
                          {company.logo_url && (
                            <div className="flex-shrink-0 ml-4">
                              <img
                                src={company.logo_url}
                                alt={`Logo ${company.name}`}
                                className="w-12 h-12 object-contain rounded border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Factory className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{company.sector}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{company.location}</span>
                          </div>
                          <div className="flex items-center sm:col-span-2 lg:col-span-1">
                            <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">Creata il {new Date(company.created_at).toLocaleDateString('it-IT')}</span>
                          </div>
                        </div>

                        {company.contact_person && (
                          <div className="mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Referente: {company.contact_person}</span>
                            </div>
                          </div>
                        )}

                        {company.description && (
                          <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                            <p className="line-clamp-2 leading-relaxed">
                              {company.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-4 w-full sm:w-auto">
                        <Button
                          size="sm"
                          onClick={() => onSelectCompany(company)}
                          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-last sm:order-none"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Assessment
                        </Button>
                        <div className="flex space-x-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditCompany(company)}
                            className="text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none"
                            title="Modifica azienda"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="ml-1 sm:hidden">Modifica</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCompany(company.id)}
                            className="text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                            title="Elimina azienda"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-1 sm:hidden">Elimina</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}