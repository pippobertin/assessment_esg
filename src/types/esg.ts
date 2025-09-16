export interface User {
  id: string;
  email: string;
  name: string;
  school: string;
  grade: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  size: 'small' | 'medium' | 'large';
  location: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  user_id: string;
  company_id: string;
  status: 'draft' | 'in_progress' | 'completed';
  environmental_score: number | null;
  social_score: number | null;
  governance_score: number | null;
  overall_score: number | null;
  responses: AssessmentResponse[];
  created_at: string;
  updated_at: string;
}

export interface AssessmentResponse {
  question_id: string;
  answer: string | number | boolean;
  notes?: string;
}

export interface ESGQuestion {
  id: string;
  category: 'environmental' | 'social' | 'governance';
  subcategory: string;
  question: string;
  type: 'multiple_choice' | 'number' | 'boolean' | 'text' | 'calculator';
  options?: string[];
  required: boolean;
  weight: number;
  description?: string;
}

export interface MetricCalculation {
  input_value: number;
  unit: string;
  co2_equivalent: number;
  calculation_method: string;
}