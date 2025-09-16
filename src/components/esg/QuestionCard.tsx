'use client'

import React, { useState } from 'react'
import { ESGQuestion, AssessmentResponse } from '@/types/esg'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { calculateCO2Emissions, formatEmissions } from '@/utils/co2-calculators'
import { Calculator, Leaf, AlertCircle } from 'lucide-react'

interface QuestionCardProps {
  question: ESGQuestion
  value?: string | number | boolean
  notes?: string
  co2Result?: any
  onAnswerChange: (response: AssessmentResponse) => void
  showDescription?: boolean
}

export function QuestionCard({ 
  question, 
  value, 
  notes: initialNotes = '',
  co2Result: externalCo2Result,
  onAnswerChange, 
  showDescription = true 
}: QuestionCardProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [co2Result, setCo2Result] = useState<any>(externalCo2Result)

  const handleAnswerChange = (answer: string | number | boolean) => {
    const response: AssessmentResponse = {
      question_id: question.id,
      answer,
      notes: notes || undefined
    }
    onAnswerChange(response)

    // Calcola CO₂ per domande calculator
    if (question.type === 'calculator' && typeof answer === 'number' && answer > 0) {
      let factorKey = ''
      if (question.question.toLowerCase().includes('elettrica')) {
        factorKey = 'electricity_italy'
      } else if (question.question.toLowerCase().includes('gas')) {
        factorKey = 'natural_gas'  
      } else if (question.question.toLowerCase().includes('acqua')) {
        factorKey = 'water'
      }
      
      if (factorKey) {
        const result = calculateCO2Emissions(answer, factorKey)
        setCo2Result(result)
      }
    }
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    // Aggiorna immediatamente la risposta con le nuove note
    if (value !== undefined) {
      const response: AssessmentResponse = {
        question_id: question.id,
        answer: value,
        notes: newNotes || undefined
      }
      onAnswerChange(response)
    }
  }

  // Aggiorna le note quando cambia la domanda
  React.useEffect(() => {
    setNotes(initialNotes)
  }, [question.id, initialNotes])

  // Aggiorna il risultato CO₂ quando viene passato dall'esterno
  React.useEffect(() => {
    setCo2Result(externalCo2Result)
  }, [externalCo2Result])

  const getCategoryIcon = () => {
    switch (question.category) {
      case 'environmental':
        return <Leaf className="h-5 w-5 text-green-600" />
      case 'social':
        return <div className="h-5 w-5 bg-blue-600 rounded-full" />
      case 'governance':
        return <div className="h-5 w-5 bg-purple-600 rounded-sm" />
    }
  }

  const getCategoryColor = () => {
    switch (question.category) {
      case 'environmental':
        return 'border-l-green-500'
      case 'social':
        return 'border-l-blue-500'
      case 'governance':
        return 'border-l-purple-500'
    }
  }

  return (
    <Card className={`border-l-4 ${getCategoryColor()}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {getCategoryIcon()}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className="text-lg">
                  {question.question}
                </CardTitle>
                {question.required && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                {question.type === 'calculator' && (
                  <Calculator className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{question.subcategory}</span>
                <span className="mx-2">•</span>
                <span>Peso: {question.weight}</span>
              </div>
            </div>
          </div>
        </div>
        
        {showDescription && question.description && (
          <CardDescription className="mt-2">
            {question.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rendering della domanda basato sul tipo */}
        {question.type === 'multiple_choice' && question.options && (
          <RadioGroup 
            value={value as string || ''} 
            onValueChange={handleAnswerChange}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <label 
                  htmlFor={`${question.id}-${index}`} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'boolean' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={question.id}
              checked={value as boolean || false}
              onCheckedChange={handleAnswerChange}
            />
            <label
              htmlFor={question.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Sì
            </label>
          </div>
        )}

        {(question.type === 'number' || question.type === 'calculator') && (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Inserisci il valore"
              value={value as number || ''}
              onChange={(e) => handleAnswerChange(parseFloat(e.target.value) || 0)}
            />
            
            {(question.type === 'calculator' || (question.type === 'number' && question.question.toLowerCase().includes('rifiuti'))) && co2Result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Calcolo Emissioni CO₂
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  <div>
                    <strong>{formatEmissions(co2Result.co2_tonnes)}</strong>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Fattore: {co2Result.factor_used.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {question.type === 'text' && (
          <Textarea
            placeholder="Inserisci la tua risposta..."
            value={value as string || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
        )}

        {/* Note aggiuntive */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Note aggiuntive (opzionale)
          </label>
          <Textarea
            placeholder="Aggiungi eventuali osservazioni..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  )
}