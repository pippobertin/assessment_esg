import { AssessmentResponse, ESGQuestion } from '@/types/esg'
import { allQuestions } from '@/data/vsme-questions'

export interface ScoreResult {
  environmental_score: number
  social_score: number
  governance_score: number
  overall_score: number
  category_details: {
    environmental: CategoryDetail
    social: CategoryDetail
    governance: CategoryDetail
  }
}

export interface CategoryDetail {
  score: number
  max_score: number
  percentage: number
  subcategories: { [key: string]: SubcategoryScore }
}

export interface SubcategoryScore {
  score: number
  max_score: number
  percentage: number
  answered_questions: number
  total_questions: number
}

function getNumericScore(question: ESGQuestion, answer: string | number | boolean): number {
  switch (question.type) {
    case 'boolean':
      return answer === true ? question.weight : 0
    
    case 'multiple_choice':
      if (!question.options || typeof answer !== 'string') return 0
      
      const optionIndex = question.options.indexOf(answer)
      if (optionIndex === -1) return 0
      
      // Punteggio decrescente: prima opzione = punteggio pieno
      const scoreRatio = (question.options.length - optionIndex) / question.options.length
      return Math.round(scoreRatio * question.weight)
    
    case 'number':
    case 'calculator':
      // Per i numeri, consideriamo che sia stata fornita una risposta
      return typeof answer === 'number' && answer > 0 ? question.weight : 0
    
    case 'text':
      return typeof answer === 'string' && answer.trim().length > 0 ? question.weight : 0
    
    default:
      return 0
  }
}

export function calculateAssessmentScore(responses: AssessmentResponse[]): ScoreResult {
  const responseMap = new Map(responses.map(r => [r.question_id, r.answer]))
  
  const categoryScores = {
    environmental: { score: 0, maxScore: 0, subcategories: new Map<string, SubcategoryScore>() },
    social: { score: 0, maxScore: 0, subcategories: new Map<string, SubcategoryScore>() },
    governance: { score: 0, maxScore: 0, subcategories: new Map<string, SubcategoryScore>() }
  }

  allQuestions.forEach(question => {
    const answer = responseMap.get(question.id)
    const score = answer !== undefined ? getNumericScore(question, answer) : 0
    const maxScore = question.weight
    
    const category = categoryScores[question.category]
    category.score += score
    category.maxScore += maxScore
    
    // Gestione sottocategorie
    if (!category.subcategories.has(question.subcategory)) {
      category.subcategories.set(question.subcategory, {
        score: 0,
        max_score: 0,
        percentage: 0,
        answered_questions: 0,
        total_questions: 0
      })
    }
    
    const subcategory = category.subcategories.get(question.subcategory)!
    subcategory.score += score
    subcategory.max_score += maxScore
    subcategory.total_questions += 1
    if (answer !== undefined) {
      subcategory.answered_questions += 1
    }
  })

  // Calcola percentuali
  Object.values(categoryScores).forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.percentage = subcategory.max_score > 0 
        ? Math.round((subcategory.score / subcategory.max_score) * 100)
        : 0
    })
  })

  const environmentalScore = categoryScores.environmental.maxScore > 0
    ? Math.round((categoryScores.environmental.score / categoryScores.environmental.maxScore) * 100)
    : 0

  const socialScore = categoryScores.social.maxScore > 0
    ? Math.round((categoryScores.social.score / categoryScores.social.maxScore) * 100)
    : 0

  const governanceScore = categoryScores.governance.maxScore > 0
    ? Math.round((categoryScores.governance.score / categoryScores.governance.maxScore) * 100)
    : 0

  const overallScore = Math.round((environmentalScore + socialScore + governanceScore) / 3)

  return {
    environmental_score: environmentalScore,
    social_score: socialScore,
    governance_score: governanceScore,
    overall_score: overallScore,
    category_details: {
      environmental: {
        score: categoryScores.environmental.score,
        max_score: categoryScores.environmental.maxScore,
        percentage: environmentalScore,
        subcategories: Object.fromEntries(categoryScores.environmental.subcategories)
      },
      social: {
        score: categoryScores.social.score,
        max_score: categoryScores.social.maxScore,
        percentage: socialScore,
        subcategories: Object.fromEntries(categoryScores.social.subcategories)
      },
      governance: {
        score: categoryScores.governance.score,
        max_score: categoryScores.governance.maxScore,
        percentage: governanceScore,
        subcategories: Object.fromEntries(categoryScores.governance.subcategories)
      }
    }
  }
}

export function getScoreInterpretation(score: number): {
  level: string
  description: string
  color: string
} {
  if (score >= 80) {
    return {
      level: 'Eccellente',
      description: 'Ottimo livello di sostenibilità, l\'azienda è un esempio da seguire',
      color: 'text-green-600'
    }
  } else if (score >= 60) {
    return {
      level: 'Buono', 
      description: 'Buone pratiche di sostenibilità, con margini di miglioramento',
      color: 'text-blue-600'
    }
  } else if (score >= 40) {
    return {
      level: 'Sufficiente',
      description: 'Livello base di sostenibilità, necessari miglioramenti significativi',
      color: 'text-yellow-600'
    }
  } else {
    return {
      level: 'Insufficiente',
      description: 'Sono necessarie azioni urgenti per migliorare la sostenibilità',
      color: 'text-red-600'
    }
  }
}