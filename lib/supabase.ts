import { createBrowserClient } from '@supabase/ssr'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Browser client for client components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server client for server components and API routes
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal errors in middleware
          }
        },
      },
    }
  )
}

// Database types (you'll need to generate these based on your actual schema)
export interface Database {
  public: {
    Tables: {
      search_history: {
        Row: {
          id: string
          query: string
          user_id?: string
          created_at: string
        }
        Insert: {
          id?: string
          query: string
          user_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          query?: string
          user_id?: string
          created_at?: string
        }
      }
      search_suggestions: {
        Row: {
          id: string
          suggestion: string
          frequency: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          suggestion: string
          frequency?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          suggestion?: string
          frequency?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper functions for common operations
export const searchHistory = {
  async add(query: string, userId?: string) {
    const { data, error } = await supabase
      .from('search_history')
      .insert({ query, user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async get(userId?: string, limit = 10) {
    let query = supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }
}

export const searchSuggestions = {
  async get(query: string, limit = 5) {
    const { data, error } = await supabase
      .from('search_suggestions')
      .select('suggestion')
      .ilike('suggestion', `%${query}%`)
      .order('frequency', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data?.map(item => item.suggestion) || []
  },

  async increment(suggestion: string) {
    const { data, error } = await supabase
      .from('search_suggestions')
      .upsert(
        { 
          suggestion, 
          frequency: 1,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'suggestion',
          ignoreDuplicates: false
        }
      )
      .select()

    if (error) throw error
    return data
  }
}
