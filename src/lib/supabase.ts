import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          school: string
          grade: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          school: string
          grade: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          school?: string
          grade?: string
          created_at?: string
        }
      }
      companies_pcto: {
        Row: {
          id: string
          name: string
          sector: string
          size: string
          location: string
          address: string | null
          description: string | null
          website: string | null
          contact_person: string | null
          contact_email: string | null
          contact_phone: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          sector: string
          size: string
          location: string
          address?: string | null
          description?: string | null
          website?: string | null
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          sector?: string
          size?: string
          location?: string
          address?: string | null
          description?: string | null
          website?: string | null
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_by?: string
          created_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          company_id: string
          status: string
          environmental_score: number | null
          social_score: number | null
          governance_score: number | null
          overall_score: number | null
          responses: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          status?: string
          environmental_score?: number | null
          social_score?: number | null
          governance_score?: number | null
          overall_score?: number | null
          responses?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          status?: string
          environmental_score?: number | null
          social_score?: number | null
          governance_score?: number | null
          overall_score?: number | null
          responses?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}