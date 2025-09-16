'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AssessmentWizard } from '@/components/esg/AssessmentWizard'
import { AssessmentResults } from '@/components/esg/AssessmentResults'
import { AssessmentSelector } from '@/components/esg/AssessmentSelector'
import { CompanySelector } from '@/components/esg/CompanySelector'
import { CompanyForm } from '@/components/esg/CompanyForm'
import { CompanyList } from '@/components/esg/CompanyList'
import { AssessmentResponse } from '@/types/esg'
import { calculateAssessmentScore } from '@/utils/scoring'
import { supabase } from '@/lib/supabase'
import { Leaf, Users, Building } from 'lucide-react'

function Dashboard() {
  const { user, signOut } = useAuth()
  const [currentView, setCurrentView] = useState<'dashboard' | 'company-list' | 'assessment-selector' | 'company-selector' | 'company-form' | 'assessment' | 'results'>('dashboard')
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [editingCompany, setEditingCompany] = useState<any>(null)
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResponse[]>([])
  const [hasSavedAssessment, setHasSavedAssessment] = useState(false)
  const [savedAssessmentData, setSavedAssessmentData] = useState<any>(null)
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null)

  useEffect(() => {
    checkForSavedAssessments()
  }, [user])

  const checkForSavedAssessments = async () => {
    if (!user) return

    try {
      // Controlla assessment completati nel database
      const { data: completedAssessments, error: assessmentError } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (assessmentError) throw assessmentError

      if (completedAssessments && completedAssessments.length > 0) {
        setHasSavedAssessment(true)
        return
      }

      // Controlla assessment in draft nel localStorage
      const { data: companies, error: companyError } = await supabase
        .from('companies_pcto')
        .select('id')
        .eq('created_by', user.id)

      if (companyError) throw companyError

      let hasAnyDraftAssessment = false
      for (const company of companies || []) {
        const savedData = localStorage.getItem(`esg-assessment-${user.id}-${company.id}`)
        if (savedData) {
          hasAnyDraftAssessment = true
          break
        }
      }

      setHasSavedAssessment(hasAnyDraftAssessment)
    } catch (error) {
      console.error('Error checking saved assessments:', error)
      setHasSavedAssessment(false)
    }
  }

  const handleAssessmentComplete = (responses: AssessmentResponse[]) => {
    setAssessmentResults(responses)
    setCurrentView('results')
    // Ricontrolla gli assessment salvati dopo il completamento
    setTimeout(() => checkForSavedAssessments(), 100)
  }

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company)
    setCurrentView('assessment')
  }

  const handleCompanyCreated = (company: any) => {
    setSelectedCompany(company)
    setCurrentView('assessment')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedCompany(null)
    setEditingCompany(null)
    setAssessmentResults([])
  }

  const handleAssessmentSelect = async (companyId: string) => {
    try {
      const { data: company, error } = await supabase
        .from('companies_pcto')
        .select('*')
        .eq('id', companyId)
        .eq('created_by', user.id)
        .single()

      if (error) throw error

      setSelectedCompany(company)
      setCurrentAssessmentId(null)
      setCurrentView('assessment')
    } catch (error) {
      console.error('Error loading company:', error)
      setCurrentView('company-selector')
    }
  }

  const handleViewResults = async (assessmentId: string) => {
    try {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('*, companies_pcto(*)')
        .eq('id', assessmentId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      setSelectedCompany(assessment.companies_pcto)
      setAssessmentResults(assessment.responses)
      setCurrentAssessmentId(assessmentId)
      setCurrentView('results')
    } catch (error) {
      console.error('Error loading assessment results:', error)
      alert('Errore nel caricamento dei risultati')
    }
  }

  const handleReopenAssessment = async () => {
    if (!currentAssessmentId || !user || !selectedCompany) return

    try {
      // Copia le risposte completate nel localStorage come draft
      const assessmentKey = `esg-assessment-${user.id}-${selectedCompany.id}`
      const draftData = {
        responses: assessmentResults.map(r => [r.question_id, r]),
        co2Calculations: [],
        currentCategory: 'environmental',
        currentQuestionIndex: 0,
        companyId: selectedCompany.id,
        lastSaved: new Date().toISOString(),
        userId: user.id
      }

      localStorage.setItem(assessmentKey, JSON.stringify(draftData))

      // Vai alla vista assessment per poter modificare
      setCurrentView('assessment')
    } catch (error) {
      console.error('Error reopening assessment:', error)
      alert('Errore nella riapertura dell\'assessment')
    }
  }

  const handleEditCompany = (company: any) => {
    setEditingCompany(company)
    setCurrentView('company-form')
  }

  const handleCompanyUpdated = (updatedCompany: any) => {
    setEditingCompany(null)
    setCurrentView('company-list')
  }

  // Rendering condizionale basato sulla vista corrente
  if (currentView === 'assessment-selector') {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <AssessmentSelector
            onAssessmentSelect={handleAssessmentSelect}
            onNewAssessment={() => setCurrentView('company-selector')}
            onCancel={handleBackToDashboard}
            onViewResults={handleViewResults}
          />
        </div>
      </AuthGuard>
    )
  }

  if (currentView === 'company-selector') {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <CompanySelector
            onCompanySelect={handleCompanySelect}
            onAddNew={() => setCurrentView('company-form')}
          />
        </div>
      </AuthGuard>
    )
  }

  if (currentView === 'company-form') {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <CompanyForm
            onCompanyCreated={handleCompanyCreated}
            onCancel={() => editingCompany ? setCurrentView('company-list') : setCurrentView('company-selector')}
            onBackToDashboard={() => setCurrentView('dashboard')}
            editCompany={editingCompany}
            onCompanyUpdated={handleCompanyUpdated}
          />
        </div>
      </AuthGuard>
    )
  }

  if (currentView === 'company-list') {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <CompanyList
            onBackToDashboard={() => setCurrentView('dashboard')}
            onAddCompany={() => {
              setEditingCompany(null)
              setCurrentView('company-form')
            }}
            onSelectCompany={(company) => {
              setSelectedCompany(company)
              setCurrentView('assessment-selector')
            }}
            onEditCompany={handleEditCompany}
          />
        </div>
      </AuthGuard>
    )
  }

  if (currentView === 'assessment' && selectedCompany) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <AssessmentWizard 
            company={selectedCompany}
            onComplete={handleAssessmentComplete}
            onCancel={handleBackToDashboard}
            onReset={() => {
              console.log('Resetting assessment...')
            }}
          />
        </div>
      </AuthGuard>
    )
  }

  if (currentView === 'results' && selectedCompany && assessmentResults.length > 0) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <AssessmentResults
            company={selectedCompany}
            responses={assessmentResults}
            onBackToDashboard={handleBackToDashboard}
            onReopenAssessment={currentAssessmentId ? handleReopenAssessment : undefined}
          />
        </div>
      </AuthGuard>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                ESG Assessment Tool
              </h1>
            </div>
            <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
              <span className="text-sm text-gray-600">
                Ciao, {user?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
              >
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Benvenuto nel tuo Assessment ESG
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Inizia a valutare l'impatto ambientale, sociale e di governance delle aziende
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Environmental</CardTitle>
              </div>
              <CardDescription>
                Valuta l'impatto ambientale dell'azienda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Emissioni, energia, rifiuti e sostenibilità ambientale
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Social</CardTitle>
              </div>
              <CardDescription>
                Analizza l'impatto sociale e sui dipendenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Diritti umani, diversità, sicurezza sul lavoro
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Governance</CardTitle>
              </div>
              <CardDescription>
                Esamina la governance aziendale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Etica, trasparenza, gestione dei rischi
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-center flex-wrap gap-3 sm:gap-4">
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center space-x-2 w-full sm:w-auto"
            onClick={() => setCurrentView('company-list')}
          >
            <Building className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Le mie Aziende</span>
          </Button>

          {hasSavedAssessment ? (
            <>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                onClick={() => setCurrentView('assessment-selector')}
              >
                <span className="text-sm sm:text-base">I Miei Assessment</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setCurrentView('company-selector')}
              >
                <span className="text-sm sm:text-base">Inizia Nuovo Assessment</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              onClick={() => setCurrentView('company-selector')}
            >
              <span className="text-sm sm:text-base">Inizia Nuovo Assessment</span>
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}
