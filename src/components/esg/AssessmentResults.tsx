'use client'

import React from 'react'
import { AssessmentResponse } from '@/types/esg'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Leaf,
  Users,
  Building,
  TrendingUp,
  FileText,
  Download,
  Award,
  AlertTriangle,
  CheckCircle,
  Home,
  ArrowRight
} from 'lucide-react'
import { calculateAssessmentScore } from '@/utils/scoring'
import { calculateCO2Emissions, formatEmissions } from '@/utils/co2-calculators'
import { allQuestions } from '@/data/vsme-questions'
import { PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { generateBenchmarkData, generateBenchmarkInsights, getCompetitivePosition } from '@/utils/esg-benchmarking'
import { exportTwoPagePDF, generatePDFFilename } from '@/utils/pdf-export'

interface AssessmentResultsProps {
  company: any
  responses: AssessmentResponse[]
  onBackToDashboard: () => void
  onReopenAssessment?: () => void
}

export function AssessmentResults({ company, responses, onBackToDashboard, onReopenAssessment }: AssessmentResultsProps) {
  const score = calculateAssessmentScore(responses)

  // Dati per il grafico a ragnatela
  const radarData = [
    {
      category: 'Environmental',
      score: score.environmental_score,
      fullMark: 100,
    },
    {
      category: 'Social',
      score: score.social_score,
      fullMark: 100,
    },
    {
      category: 'Governance',
      score: score.governance_score,
      fullMark: 100,
    },
  ]

  // Dati di benchmarking reali basati su ricerche di mercato
  const benchmarkData = generateBenchmarkData(score, {
    sector: company.sector,
    location: company.location
  })

  // Insights di benchmarking
  const benchmarkInsights = generateBenchmarkInsights(score, {
    sector: company.sector,
    location: company.location
  })

  // Posizionamento competitivo
  const competitivePosition = getCompetitivePosition(score.overall_score, {
    sector: company.sector,
    location: company.location
  })
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600' 
    return 'text-red-600'
  }
  
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: 'Eccellente', color: 'bg-green-100 text-green-800' }
    if (score >= 60) return { label: 'Buono', color: 'bg-yellow-100 text-yellow-800' }
    if (score >= 40) return { label: 'Sufficiente', color: 'bg-orange-100 text-orange-800' }
    return { label: 'Da migliorare', color: 'bg-red-100 text-red-800' }
  }

  const getTotalCO2Emissions = () => {
    let totalCO2 = 0
    const calculatorResponses = responses.filter(r => {
      const question = allQuestions.find(q => q.id === r.question_id)
      return question?.type === 'calculator' && typeof r.answer === 'number'
    })

    calculatorResponses.forEach(response => {
      const question = allQuestions.find(q => q.id === response.question_id)
      if (!question || typeof response.answer !== 'number') return

      let factorKey = ''
      if (question.question.toLowerCase().includes('elettrica')) {
        factorKey = 'electricity_italy'
      } else if (question.question.toLowerCase().includes('gas')) {
        factorKey = 'natural_gas'
      } else if (question.question.toLowerCase().includes('acqua')) {
        factorKey = 'water'
      }

      if (factorKey) {
        const result = calculateCO2Emissions(response.answer, factorKey)
        if (result) {
          totalCO2 += result.co2_tonnes
        }
      }
    })

    return totalCO2
  }

  const getCO2EmissionsBreakdown = () => {
    const breakdown: any[] = []
    const calculatorResponses = responses.filter(r => {
      const question = allQuestions.find(q => q.id === r.question_id)
      return question?.type === 'calculator' && typeof r.answer === 'number' && r.answer > 0
    })

    calculatorResponses.forEach(response => {
      const question = allQuestions.find(q => q.id === response.question_id)
      if (!question || typeof response.answer !== 'number') return

      let factorKey = ''
      let category = ''
      if (question.question.toLowerCase().includes('elettrica')) {
        factorKey = 'electricity_italy'
        category = 'Energia Elettrica'
      } else if (question.question.toLowerCase().includes('gas')) {
        factorKey = 'natural_gas'
        category = 'Gas Naturale'
      } else if (question.question.toLowerCase().includes('acqua')) {
        factorKey = 'water'
        category = 'Consumo Idrico'
      }

      if (factorKey) {
        const result = calculateCO2Emissions(response.answer, factorKey)
        if (result) {
          breakdown.push({
            category,
            consumption: response.answer,
            unit: result.factor_used.unit,
            emissions: result.co2_tonnes,
            question: question.question
          })
        }
      }
    })

    return breakdown
  }

  const totalEmissions = getTotalCO2Emissions()
  const emissionsBreakdown = getCO2EmissionsBreakdown()
  const answeredQuestions = responses.length
  const totalQuestions = allQuestions.length
  const completionRate = Math.round((answeredQuestions / totalQuestions) * 100)

  // Funzione per esportare PDF
  const handleExportPDF = async () => {
    try {
      // Mostra un loading
      const button = document.querySelector('button[onClick*="handleExportPDF"]') as HTMLButtonElement
      const originalText = button?.textContent
      if (button) {
        button.disabled = true
        button.textContent = 'Generando PDF...'
      }

      const filename = generatePDFFilename(company.name)
      await exportTwoPagePDF('pdf-content-page-1', 'pdf-content-page-2', {
        filename,
        format: 'a4',
        orientation: 'portrait',
        margin: 15,
        scale: 1.2, // Scala ridotta per evitare problemi
        benchmarkData // Passa i dati per generare il canvas del grafico
      })

      // Ripristina il pulsante
      if (button && originalText) {
        button.disabled = false
        button.textContent = originalText
      }
    } catch (error) {
      console.error('Errore esportazione PDF:', error)

      // Ripristina il pulsante
      const button = document.querySelector('button[onClick*="handleExportPDF"]') as HTMLButtonElement
      if (button) {
        button.disabled = false
        button.textContent = 'Esporta PDF'
      }

      // Messaggio di errore più specifico
      let errorMessage = 'Errore durante l\'esportazione del PDF.'
      if (error instanceof Error) {
        if (error.message.includes('color function')) {
          errorMessage += ' Problema con i colori del tema. Riprova.'
        } else if (error.message.includes('Element with id')) {
          errorMessage += ' Elemento non trovato.'
        } else {
          errorMessage += ` Dettagli: ${error.message}`
        }
      }

      alert(errorMessage)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Contenuto per PDF - Pagina 1 */}
      <div id="pdf-content-page-1" className="bg-white space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Risultati Assessment ESG
          </h1>
          <h2 className="text-3xl font-bold text-blue-600 mb-1">{company.name}</h2>
          <p className="text-lg text-gray-600">
            {company.sector} • {company.location}
          </p>
        </div>

        <div className="flex flex-col items-end space-y-4">
          {company.logo_url && (
            <div className="pdf-logo">
              <img
                src={company.logo_url}
                alt={`Logo ${company.name}`}
                className="w-40 h-40 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <Button
            onClick={onBackToDashboard}
            className="flex items-center space-x-2 pdf-hide"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className={`h-8 w-8 ${getScoreColor(score.overall_score)}`} />
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(score.overall_score)}`}>
              {Math.round(score.overall_score)}%
            </div>
            <p className="text-sm text-gray-600 mb-2">Punteggio Generale</p>
            <Badge className={getScoreLevel(score.overall_score).color}>
              {getScoreLevel(score.overall_score).label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatEmissions(totalEmissions)}
            </div>
            <p className="text-sm text-gray-600">Emissioni CO₂ Totali</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {completionRate}%
            </div>
            <p className="text-sm text-gray-600">
              {answeredQuestions} di {totalQuestions} domande
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className={`h-8 w-8 ${competitivePosition.color}`} />
            </div>
            <div className={`text-lg font-bold ${competitivePosition.color}`}>
              {competitivePosition.position}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {competitivePosition.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ESG Radar Chart */}
      <Card className="mb-6 page-break-avoid">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-purple-600" />
            <span>Punteggi ESG - Confronto con Benchmark</span>
          </CardTitle>
          <div className="text-xs text-gray-500 mt-2 italic">
            Dati di benchmarking basati su: Studio Modefinance 2024 (4.586 PMI italiane),
            Report ESG Italia 2024, Database Sustainalytics ESG Risk Ratings
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={benchmarkData}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis
                  tick={{ fontSize: 14, fontWeight: 'bold' }}
                  tickFormatter={(value) => {
                    switch (value) {
                      case 'Environmental':
                        return '🌱 Environmental'
                      case 'Social':
                        return '👥 Social'
                      case 'Governance':
                        return '🏢 Governance'
                      default:
                        return value
                    }
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickCount={5}
                />
                <Radar
                  name="La tua azienda"
                  dataKey="azienda"
                  stroke="#16a34a"
                  fill="#16a34a"
                  fillOpacity={0.3}
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#16a34a' }}
                />
                <Radar
                  name="Media Settore"
                  dataKey="settore"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={{ r: 3, fill: '#3b82f6' }}
                />
                <Radar
                  name="PMI Italiane"
                  dataKey="PMI Italiane"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.05}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#f59e0b' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Legenda */}
          <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-green-600 rounded"></div>
              <span className="font-medium">La tua azienda</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-blue-600 rounded" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #3b82f6, #3b82f6 8px, transparent 8px, transparent 12px)'
              }}></div>
              <span>Media Settore ({company.sector})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-amber-600 rounded" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b, #f59e0b 4px, transparent 4px, transparent 8px)'
              }}></div>
              <span>PMI Italiane</span>
            </div>
          </div>

          {/* Tabella comparativa */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2"></th>
                  <th className="text-center py-2">
                    <div className="flex items-center justify-center space-x-1">
                      <span>🌱</span>
                      <span>Environmental</span>
                    </div>
                  </th>
                  <th className="text-center py-2">
                    <div className="flex items-center justify-center space-x-1">
                      <span>👥</span>
                      <span>Social</span>
                    </div>
                  </th>
                  <th className="text-center py-2">
                    <div className="flex items-center justify-center space-x-1">
                      <span>🏢</span>
                      <span>Governance</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-center">
                <tr className="border-b">
                  <td className="text-left py-2 font-medium">La tua azienda</td>
                  <td className="py-2">
                    <span className="font-bold text-green-600">{benchmarkData[0].azienda}</span>
                  </td>
                  <td className="py-2">
                    <span className="font-bold text-green-600">{benchmarkData[1].azienda}</span>
                  </td>
                  <td className="py-2">
                    <span className="font-bold text-green-600">{benchmarkData[2].azienda}</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="text-left py-2">Media Settore</td>
                  <td className="py-2 text-blue-600">{benchmarkData[0].settore}</td>
                  <td className="py-2 text-blue-600">{benchmarkData[1].settore}</td>
                  <td className="py-2 text-blue-600">{benchmarkData[2].settore}</td>
                </tr>
                <tr>
                  <td className="text-left py-2">PMI Italiane</td>
                  <td className="py-2 text-amber-600">{benchmarkData[0]['PMI Italiane']}</td>
                  <td className="py-2 text-amber-600">{benchmarkData[1]['PMI Italiane']}</td>
                  <td className="py-2 text-amber-600">{benchmarkData[2]['PMI Italiane']}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ESG Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <Leaf className="h-5 w-5" />
              <span>Environmental</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {Math.round(score.environmental_score)}%
                </span>
                <Badge className={getScoreLevel(score.environmental_score).color}>
                  {getScoreLevel(score.environmental_score).label}
                </Badge>
              </div>
              <Progress value={score.environmental_score} className="h-2" />
              <p className="text-sm text-gray-600">
                Gestione ambientale, emissioni, energia e rifiuti
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-600">
              <Users className="h-5 w-5" />
              <span>Social</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {Math.round(score.social_score)}%
                </span>
                <Badge className={getScoreLevel(score.social_score).color}>
                  {getScoreLevel(score.social_score).label}
                </Badge>
              </div>
              <Progress value={score.social_score} className="h-2" />
              <p className="text-sm text-gray-600">
                Rapporti con dipendenti, comunità e diritti umani
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-600">
              <Building className="h-5 w-5" />
              <span>Governance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">
                  {Math.round(score.governance_score)}%
                </span>
                <Badge className={getScoreLevel(score.governance_score).color}>
                  {getScoreLevel(score.governance_score).label}
                </Badge>
              </div>
              <Progress value={score.governance_score} className="h-2" />
              <p className="text-sm text-gray-600">
                Gestione aziendale, etica e trasparenza
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      </div>

      {/* Contenuto per PDF - Pagina 2 */}
      <div id="pdf-content-page-2" className="bg-white space-y-8">

      {/* Header per Pagina 2 */}
      <div className="border-b pb-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Dettaglio Analisi ESG
        </h2>
        <p className="text-sm text-gray-600">
          {company.name} • Assessment completo • Pagina 2
        </p>
      </div>

      {/* Analisi Comparativa */}
      <Card className="mb-6 page-break-avoid">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Analisi Comparativa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Confronto con il Mercato</h4>
              <div className="space-y-2">
                {benchmarkInsights.slice(0, 6).map((insight, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    {insight}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Posizionamento</h4>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-4">
                <div className={`text-xl font-bold ${competitivePosition.color} mb-2`}>
                  {competitivePosition.position}
                </div>
                <p className="text-sm text-gray-700">
                  {competitivePosition.description}
                </p>
                <div className="mt-3 text-xs text-gray-600">
                  Settore: {company.sector} • Regione: {company.location}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-xs text-gray-700 mb-2">📊 Fonti Benchmarking:</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>Modefinance 2024:</strong> 4.586 PMI italiane, 19 regioni</li>
                  <li>• <strong>ESG Italia Report 2024:</strong> Performance settoriali</li>
                  <li>• <strong>Sustainalytics:</strong> Database ESG Risk Ratings</li>
                  <li>• <strong>FTSE MIB ESG Index:</strong> Benchmark italiani</li>
                </ul>
                <div className="mt-2 text-xs text-gray-500 italic">
                  Dati aggregati e normalizzati per dimensione aziendale e settore
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CO2 Emissions Breakdown */}
      {emissionsBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <span>Dettaglio Emissioni CO₂</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emissionsBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.category}</h4>
                    <p className="text-sm text-gray-600">{item.question}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {item.consumption.toLocaleString()} {item.unit}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {formatEmissions(item.emissions)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Totale Emissioni</span>
                  <span className="text-green-600">{formatEmissions(totalEmissions)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="pdf-hide">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Cosa fare ora?</h3>
              <p className="text-gray-600">
                Esporta i risultati o inizia un nuovo assessment
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex items-center space-x-2 pdf-hide"
                onClick={handleExportPDF}
              >
                <Download className="h-4 w-4" />
                <span>Esporta PDF</span>
              </Button>
              {onReopenAssessment && (
                <Button
                  onClick={onReopenAssessment}
                  variant="outline"
                  className="flex items-center space-x-2 text-blue-600 hover:bg-blue-50 pdf-hide"
                >
                  <FileText className="h-4 w-4" />
                  <span>Riapri Assessment</span>
                </Button>
              )}
              <Button
                onClick={onBackToDashboard}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 pdf-hide"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}