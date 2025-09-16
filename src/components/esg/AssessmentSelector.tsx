'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Clock, 
  Building2, 
  MapPin, 
  Trash2, 
  Play,
  Plus,
  AlertCircle
} from 'lucide-react'

interface SavedAssessment {
  companyId: string
  companyName: string
  companySector: string
  companyLocation: string
  responses: number
  totalQuestions: number
  currentCategory: string
  currentQuestionIndex: number
  lastSaved: string
  progress: number
  status?: 'draft' | 'completed'
  assessmentId?: string
  scores?: {
    environmental: number
    social: number
    governance: number
    overall: number
  }
}

interface AssessmentSelectorProps {
  onAssessmentSelect: (companyId: string) => void
  onNewAssessment: () => void
  onCancel: () => void
  onViewResults: (assessmentId: string) => void
}

export function AssessmentSelector({ onAssessmentSelect, onNewAssessment, onCancel, onViewResults }: AssessmentSelectorProps) {
  const { user } = useAuth()
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<Map<string, any>>(new Map())

  useEffect(() => {
    loadSavedAssessments()
  }, [user])

  const loadSavedAssessments = async () => {
    if (!user) return

    try {
      // Carica tutte le aziende dell'utente
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies_pcto')
        .select('*')
        .eq('created_by', user.id)

      if (companiesError) throw companiesError

      const companiesMap = new Map()
      companiesData?.forEach(company => {
        companiesMap.set(company.id, company)
      })
      setCompanies(companiesMap)

      // Carica gli assessment completati dal database
      const { data: completedAssessments, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (assessmentError) throw assessmentError

      const assessments: SavedAssessment[] = []

      // Aggiungi assessment completati dal database
      completedAssessments?.forEach(assessment => {
        const company = companiesMap.get(assessment.company_id)
        if (company) {
          assessments.push({
            companyId: company.id,
            companyName: company.name,
            companySector: company.sector,
            companyLocation: company.location,
            responses: assessment.responses?.length || 0,
            totalQuestions: 32, // Numero totale domande V-SME
            currentCategory: 'completed',
            currentQuestionIndex: 0,
            lastSaved: assessment.created_at,
            progress: 100,
            status: 'completed',
            assessmentId: assessment.id,
            scores: {
              environmental: assessment.environmental_score,
              social: assessment.social_score,
              governance: assessment.governance_score,
              overall: assessment.overall_score
            }
          })
        }
      })

      // Carica gli assessment salvati dal localStorage (in corso)
      // Solo se non c'è già un assessment completato per la stessa azienda
      for (const company of companiesData || []) {
        const hasCompletedAssessment = assessments.some(a =>
          a.companyId === company.id && a.status === 'completed'
        )

        if (!hasCompletedAssessment) {
          const savedData = localStorage.getItem(`esg-assessment-${user.id}-${company.id}`)
          if (savedData) {
            try {
              const assessmentData = JSON.parse(savedData)
              const responses = assessmentData.responses?.length || 0
              const totalQuestions = 32 // Numero totale domande V-SME

              assessments.push({
                companyId: company.id,
                companyName: company.name,
                companySector: company.sector,
                companyLocation: company.location,
                responses,
                totalQuestions,
                currentCategory: assessmentData.currentCategory || 'environmental',
                currentQuestionIndex: assessmentData.currentQuestionIndex || 0,
                lastSaved: assessmentData.lastSaved,
                progress: Math.round((responses / totalQuestions) * 100),
                status: 'draft'
              })
            } catch (error) {
              console.error(`Error parsing assessment for company ${company.id}:`, error)
            }
          }
        }
      }

      setSavedAssessments(assessments.sort((a, b) =>
        new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime()
      ))
    } catch (error) {
      console.error('Error loading saved assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteDraftAssessment = (companyId: string) => {
    if (!user) return

    if (confirm('Sei sicuro di voler eliminare questo assessment salvato?')) {
      localStorage.removeItem(`esg-assessment-${user.id}-${companyId}`)
      loadSavedAssessments()
    }
  }

  const deleteCompletedAssessment = async (assessmentId: string) => {
    if (!user) return

    if (confirm('Sei sicuro di voler eliminare questo assessment completato? Questa azione non può essere annullata.')) {
      try {
        const { error } = await supabase
          .from('assessments')
          .delete()
          .eq('id', assessmentId)
          .eq('user_id', user.id)

        if (error) throw error

        loadSavedAssessments()
      } catch (error) {
        console.error('Error deleting assessment:', error)
        alert('Errore nell\'eliminazione dell\'assessment')
      }
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental': return '🌱'
      case 'social': return '👥'
      case 'governance': return '🏢'
      default: return '📋'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'environmental': return 'Environmental'
      case 'social': return 'Social'
      case 'governance': return 'Governance'
      default: return category
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle className="text-xl sm:text-2xl">Assessment Salvati</CardTitle>
                <CardDescription className="text-sm">
                  Riprendi un assessment esistente o iniziane uno nuovo
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={onNewAssessment} className="bg-green-600 hover:bg-green-700 text-sm" size="sm">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Nuovo Assessment</span>
                <span className="xs:hidden">Nuovo</span>
              </Button>
              <Button variant="outline" onClick={onCancel} size="sm">
                <span className="hidden xs:inline">Dashboard</span>
                <span className="xs:hidden">Home</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {savedAssessments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun assessment salvato
              </h3>
              <p className="text-gray-500 mb-6">
                Non hai assessment in corso. Inizia un nuovo assessment per una delle tue aziende.
              </p>
              <Button onClick={onNewAssessment} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Inizia Nuovo Assessment</span>
                <span className="sm:hidden">Nuovo Assessment</span>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedAssessments.map((assessment, index) => (
                <Card
                  key={`${assessment.companyId}-${assessment.status}-${index}`}
                  className="hover:shadow-md transition-shadow border-l-4 border-l-green-500"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-3 space-y-2 sm:space-y-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {assessment.companyName}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={assessment.status === 'completed' ? 'default' : 'outline'}>
                              {assessment.status === 'completed' ? 'Completato' : `${assessment.progress}% completato`}
                            </Badge>
                            {assessment.status === 'completed' && assessment.scores && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Score: {assessment.scores.overall.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{assessment.companySector}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{assessment.companyLocation}</span>
                          </div>
                          <div className="flex items-center sm:col-span-2 lg:col-span-1">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{new Date(assessment.lastSaved).toLocaleString('it-IT')}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">
                              Progresso: {assessment.responses} di {assessment.totalQuestions} domande
                            </span>
                            <span className="text-sm text-gray-500">
                              {getCategoryIcon(assessment.currentCategory)} {getCategoryName(assessment.currentCategory)}
                            </span>
                          </div>
                          <Progress value={assessment.progress} className="h-2" />
                        </div>

                        {assessment.status === 'draft' && assessment.progress < 100 && (
                          <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Assessment in corso - {100 - assessment.progress}% rimanente
                          </div>
                        )}

                        {assessment.status === 'completed' && (
                          <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                            <div className="grid grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="text-gray-500">Environmental:</span>
                                <div className="font-semibold">{assessment.scores?.environmental.toFixed(1)}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Social:</span>
                                <div className="font-semibold">{assessment.scores?.social.toFixed(1)}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Governance:</span>
                                <div className="font-semibold">{assessment.scores?.governance.toFixed(1)}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Totale:</span>
                                <div className="font-semibold text-green-700">{assessment.scores?.overall.toFixed(1)}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-4 w-full sm:w-auto">
                        {assessment.status === 'draft' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onAssessmentSelect(assessment.companyId)}
                              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-last sm:order-none"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Riprendi
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteDraftAssessment(assessment.companyId)}
                              className="text-red-600 hover:bg-red-50 w-full sm:w-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="ml-1 sm:hidden">Elimina</span>
                            </Button>
                          </>
                        )}

                        {assessment.status === 'completed' && assessment.assessmentId && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onViewResults(assessment.assessmentId!)}
                              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-last sm:order-none"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Visualizza
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCompletedAssessment(assessment.assessmentId!)}
                              className="text-red-600 hover:bg-red-50 w-full sm:w-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="ml-1 sm:hidden">Elimina</span>
                            </Button>
                          </>
                        )}
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