export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      scores: {
        Row: {
          id: number
          created_at: string
          user_id: string
          score: number
          day: number
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          score: number
          day: number
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          score?: number
          day?: number
        }
      }
    }
  }
} 