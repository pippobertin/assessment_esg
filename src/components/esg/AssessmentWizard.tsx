'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ESGQuestion, AssessmentResponse } from '@/types/esg'
import { allQuestions, environmentalQuestions, socialQuestions, governanceQuestions } from '@/data/vsme-questions'
import { QuestionCard } from './QuestionCard'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { calculateAssessmentScore } from '@/utils/scoring'
import { calculateCO2Emissions, formatEmissions, calculateWasteEmissions, getRenewablePercentageFromAnswer } from '@/utils/co2-calculators'
import { supabase } from '@/lib/supabase'
import { Leaf, Users, Building, ChevronRight, ChevronLeft, RotateCcw, X, AlertTriangle, Clock } from 'lucide-react'

interface AssessmentWizardProps {
  company: any
  onComplete: (responses: AssessmentResponse[]) => void
  onCancel?: () => void
  onReset?: () => void
}

type CategoryType = 'environmental' | 'social' | 'governance'

const categories = [
  { 
    id: 'environmental' as CategoryType, 
    name: 'Environmental', 
    icon: Leaf, 
    color: 'text-green-600',
    questions: environmentalQuestions 
  },
  { 
    id: 'social' as CategoryType, 
    name: 'Social', 
    icon: Users, 
    color: 'text-blue-600',
    questions: socialQuestions 
  },
  { 
    id: 'governance' as CategoryType, 
    name: 'Governance', 
    icon: Building, 
    color: 'text-purple-600',
    questions: governanceQuestions 
  }
]

export function AssessmentWizard({ company, onComplete, onCancel, onReset }: AssessmentWizardProps) {
  const { user } = useAuth()
  const [responses, setResponses] = useState<Map<string, AssessmentResponse>>(new Map())
  const [co2Calculations, setCo2Calculations] = useState<Map<string, any>>(new Map())
  const [currentCategory, setCurrentCategory] = useState<CategoryType>('environmental')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const currentCategoryData = categories.find(cat => cat.id === currentCategory)!
  const currentQuestion = currentCategoryData.questions[currentQuestionIndex]

  const handleAnswerChange = (response: AssessmentResponse) => {
    setResponses(prev => new Map(prev.set(response.question_id, response)))

    // Calcola e salva CO₂ se è una domanda calculator
    const question = allQuestions.find(q => q.id === response.question_id)

    if (question?.type === 'calculator' && typeof response.answer === 'number' && response.answer > 0) {
      let calculation = null;

      if (question.question.toLowerCase().includes('elettrica')) {
        // Per l'energia elettrica, cerca la risposta sulla percentuale di rinnovabili
        const renewableResponse = responses.get('E1_01')
        let renewablePercentage = 5; // Default conservativo

        if (renewableResponse && typeof renewableResponse.answer === 'string') {
          renewablePercentage = getRenewablePercentageFromAnswer(renewableResponse.answer)
        }

        calculation = calculateCO2Emissions(response.answer, 'electricity_italy')
        if (calculation && renewablePercentage > 5) {
          // Applica la riduzione per fonti rinnovabili
          const reductionFactor = renewablePercentage / 100
          calculation.co2_kg = calculation.co2_kg * (1 - reductionFactor)
          calculation.co2_tonnes = calculation.co2_kg / 1000
          calculation.factor_used = {
            ...calculation.factor_used,
            co2_kg_per_unit: calculation.factor_used.co2_kg_per_unit * (1 - reductionFactor),
            description: `${calculation.factor_used.description} (ridotto del ${renewablePercentage}% per fonti rinnovabili)`
          }
        }
      } else if (question.question.toLowerCase().includes('gas')) {
        calculation = calculateCO2Emissions(response.answer, 'natural_gas')
      } else if (question.question.toLowerCase().includes('acqua')) {
        calculation = calculateCO2Emissions(response.answer, 'water')
      }

      if (calculation) {
        setCo2Calculations(prev => new Map(prev.set(response.question_id, calculation)))
      }
    } else if (question?.type === 'number' && typeof response.answer === 'number' && response.answer > 0 && question.question.toLowerCase().includes('rifiuti')) {
      // Calcolo emissioni rifiuti
      const wasteManagementResponse = responses.get('E2_01') // ID della domanda gestione rifiuti
      let wasteManagementLevel = undefined;

      if (wasteManagementResponse && typeof wasteManagementResponse.answer === 'string') {
        wasteManagementLevel = wasteManagementResponse.answer
      }

      const calculation = calculateWasteEmissions(response.answer, wasteManagementLevel)
      if (calculation) {
        setCo2Calculations(prev => new Map(prev.set(response.question_id, calculation)))
      }
    } else if ((question?.type === 'calculator' || question?.type === 'number')) {
      // Rimuovi il calcolo se la risposta è vuota o zero
      setCo2Calculations(prev => {
        const newMap = new Map(prev)
        newMap.delete(response.question_id)
        return newMap
      })
    }

    // Se la risposta è sulla percentuale di rinnovabili, ricalcola le emissioni dell'energia elettrica
    if (response.question_id === 'E1_01' && typeof response.answer === 'string') {
      const energyResponse = responses.get('E1_02') // ID domanda consumo energia elettrica
      if (energyResponse && typeof energyResponse.answer === 'number' && energyResponse.answer > 0) {
        const renewablePercentage = getRenewablePercentageFromAnswer(response.answer)
        let calculation = calculateCO2Emissions(energyResponse.answer, 'electricity_italy')

        if (calculation && renewablePercentage > 5) {
          const reductionFactor = renewablePercentage / 100
          calculation.co2_kg = calculation.co2_kg * (1 - reductionFactor)
          calculation.co2_tonnes = calculation.co2_kg / 1000
          calculation.factor_used = {
            ...calculation.factor_used,
            co2_kg_per_unit: calculation.factor_used.co2_kg_per_unit * (1 - reductionFactor),
            description: `${calculation.factor_used.description} (ridotto del ${renewablePercentage}% per fonti rinnovabili)`
          }
        }

        if (calculation) {
          setCo2Calculations(prev => new Map(prev.set('E1_02', calculation)))
        }
      }
    }

    // Se la risposta è sulla gestione rifiuti, ricalcola le emissioni dei rifiuti
    if (response.question_id === 'E2_01' && typeof response.answer === 'string') {
      const wasteResponse = responses.get('E2_02') // ID domanda quantità rifiuti
      if (wasteResponse && typeof wasteResponse.answer === 'number' && wasteResponse.answer > 0) {
        const calculation = calculateWasteEmissions(wasteResponse.answer, response.answer)
        if (calculation) {
          setCo2Calculations(prev => new Map(prev.set('E2_02', calculation)))
        }
      }
    }

    // Salva automaticamente ogni cambio con un piccolo delay
    setTimeout(() => {
      saveToLocalStorage()
    }, 500)
  }

  const saveToLocalStorage = () => {
    if (!user) return
    
    const assessmentData = {
      responses: Array.from(responses.entries()),
      co2Calculations: Array.from(co2Calculations.entries()),
      currentCategory,
      currentQuestionIndex,
      companyId: company.id,
      lastSaved: new Date().toISOString(),
      userId: user.id
    }
    
    try {
      localStorage.setItem(`esg-assessment-${user.id}-${company.id}`, JSON.stringify(assessmentData))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Errore nel salvataggio locale:', error)
    }
  }

  const loadFromLocalStorage = () => {
    if (!user) return
    
    const savedData = localStorage.getItem(`esg-assessment-${user.id}-${company.id}`)
    if (savedData) {
      try {
        const assessmentData = JSON.parse(savedData)
        const savedResponses = new Map(assessmentData.responses)
        const savedCO2Calculations = new Map(assessmentData.co2Calculations || [])
        setResponses(savedResponses)
        setCo2Calculations(savedCO2Calculations)
        setCurrentCategory(assessmentData.currentCategory || 'environmental')
        setCurrentQuestionIndex(assessmentData.currentQuestionIndex || 0)
        setLastSaved(new Date(assessmentData.lastSaved))
      } catch (error) {
        console.error('Error loading saved assessment:', error)
      }
    }
  }

  const clearSavedData = () => {
    if (!user) return
    localStorage.removeItem(`esg-assessment-${user.id}-${company.id}`)
    setLastSaved(null)
  }

  // Carica i dati salvati all'avvio
  useEffect(() => {
    loadFromLocalStorage()
  }, [user])

  // Salvataggio automatico periodico ogni 30 secondi
  useEffect(() => {
    if (!user) return
    
    const interval = setInterval(() => {
      if (responses.size > 0) {
        saveToLocalStorage()
      }
    }, 30000) // 30 secondi
    
    return () => clearInterval(interval)
  }, [user, responses.size])

  const getProgress = () => {
    const totalQuestions = allQuestions.length
    const answeredQuestions = responses.size
    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  const getCategoryProgress = (categoryId: CategoryType) => {
    const categoryQuestions = categories.find(cat => cat.id === categoryId)?.questions || []
    const answeredInCategory = categoryQuestions.filter(q => responses.has(q.id)).length
    return Math.round((answeredInCategory / categoryQuestions.length) * 100)
  }

  const goToNextQuestion = () => {
    saveToLocalStorage()
    if (currentQuestionIndex < currentCategoryData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Vai alla prossima categoria
      const currentCatIndex = categories.findIndex(cat => cat.id === currentCategory)
      if (currentCatIndex < categories.length - 1) {
        setCurrentCategory(categories[currentCatIndex + 1].id)
        setCurrentQuestionIndex(0)
      }
    }
  }

  const goToPreviousQuestion = () => {
    saveToLocalStorage()
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else {
      // Vai alla categoria precedente
      const currentCatIndex = categories.findIndex(cat => cat.id === currentCategory)
      if (currentCatIndex > 0) {
        const prevCategory = categories[currentCatIndex - 1]
        setCurrentCategory(prevCategory.id)
        setCurrentQuestionIndex(prevCategory.questions.length - 1)
      }
    }
  }

  const isLastQuestion = () => {
    const currentCatIndex = categories.findIndex(cat => cat.id === currentCategory)
    return currentCatIndex === categories.length - 1 && 
           currentQuestionIndex === currentCategoryData.questions.length - 1
  }

  const isFirstQuestion = () => {
    return currentCategory === 'environmental' && currentQuestionIndex === 0
  }

  const handleComplete = async () => {
    const responsesArray = Array.from(responses.values())
    const score = calculateAssessmentScore(responsesArray)

    try {
      // Salva l'assessment su Supabase
      const { data, error } = await supabase
        .from('assessments')
        .insert([{
          user_id: user?.id,
          company_id: company.id,
          status: 'completed',
          environmental_score: score.environmental_score,
          social_score: score.social_score,
          governance_score: score.governance_score,
          overall_score: score.overall_score,
          responses: responsesArray
        }])
        .select()
        .single()

      if (error) throw error

      // Cancella i dati salvati localmente dopo il salvataggio su DB
      clearSavedData()
      
      onComplete(responsesArray)
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('Errore nel salvataggio dell\'assessment. Le risposte sono state comunque salvate localmente.')
      onComplete(responsesArray)
    }
  }

  const canComplete = () => {
    // Permetti completamento anche senza tutte le domande obbligatorie
    // ma informa l'utente di quante ne mancano
    return true
  }

  const getRequiredMissing = () => {
    const requiredQuestions = allQuestions.filter(q => q.required)
    const missingRequired = requiredQuestions.filter(q => !responses.has(q.id))
    return missingRequired.length
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
    }
    setResponses(new Map())
    setCo2Calculations(new Map())
    setCurrentCategory('environmental')
    setCurrentQuestionIndex(0)
    clearSavedData()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const getTotalCO2Emissions = () => {
    let totalCO2 = 0
    
    // Somma tutte le emissioni dai calcoli salvati
    co2Calculations.forEach(calculation => {
      if (calculation && calculation.co2_tonnes) {
        totalCO2 += calculation.co2_tonnes
      }
    })

    return totalCO2
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header con progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">
                Assessment ESG
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                {company.name} • {company.sector} • {company.location}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Progresso: {getProgress()}% completato
              </div>
              {lastSaved && (
                <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  <Clock className="h-3 w-3 mr-1" />
                  Salvato {lastSaved.toLocaleTimeString()}
                </div>
              )}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-orange-600 hover:bg-orange-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="text-gray-600 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
          
          <Progress value={getProgress()} className="mb-4" />
          
          {/* Tabs per categorie */}
          <Tabs value={currentCategory} onValueChange={(value) => {
            setCurrentCategory(value as CategoryType)
            setCurrentQuestionIndex(0)
          }}>
            <TabsList className="grid w-full grid-cols-3">
              {categories.map((category) => {
                const Icon = category.icon
                const progress = getCategoryProgress(category.id)
                
                return (
                  <TabsTrigger key={category.id} value={category.id} className="space-x-2">
                    <Icon className={`h-4 w-4 ${category.color}`} />
                    <span>{category.name}</span>
                    <span className="text-xs">({progress}%)</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Domanda corrente */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <currentCategoryData.icon className={`h-5 w-5 ${currentCategoryData.color}`} />
            <span>
              Domanda {currentQuestionIndex + 1} di {currentCategoryData.questions.length}
            </span>
          </h3>
          
          <div className="text-sm text-muted-foreground">
            {currentCategoryData.name}
          </div>
        </div>

        <QuestionCard
          question={currentQuestion}
          value={responses.get(currentQuestion.id)?.answer}
          notes={responses.get(currentQuestion.id)?.notes}
          co2Result={co2Calculations.get(currentQuestion.id)}
          onAnswerChange={handleAnswerChange}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={goToPreviousQuestion}
          disabled={isFirstQuestion()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Precedente
        </Button>

        <div className="text-sm text-muted-foreground">
          Domanda {allQuestions.findIndex(q => q.id === currentQuestion.id) + 1} di {allQuestions.length}
        </div>

        {!isLastQuestion() ? (
          <Button onClick={goToNextQuestion}>
            Successiva
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <div className="flex flex-col items-end space-y-2">
            {getRequiredMissing() > 0 && (
              <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mancano {getRequiredMissing()} domande obbligatorie
              </div>
            )}
            <Button 
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              Completa Assessment
            </Button>
          </div>
        )}
      </div>

      {/* Summary footer */}
      {responses.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              {categories.map((category) => {
                const progress = getCategoryProgress(category.id)
                const Icon = category.icon
                
                return (
                  <div key={category.id} className="space-y-2">
                    <Icon className={`h-6 w-6 mx-auto ${category.color}`} />
                    <div className="text-sm font-medium">{category.name}</div>
                    <div className={`text-lg font-bold ${category.color}`}>
                      {progress}%
                    </div>
                  </div>
                )
              })}
              
              {/* Totale CO₂ */}
              <div className="space-y-2">
                <Leaf className="h-6 w-6 mx-auto text-green-600" />
                <div className="text-sm font-medium">Emissioni CO₂</div>
                <div className="text-lg font-bold text-green-600">
                  {formatEmissions(getTotalCO2Emissions())}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}