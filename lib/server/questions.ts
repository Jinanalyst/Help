import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export interface QuestionParams {
  q?: string
  limit?: number
  offset?: number
  sort?: 'latest' | 'hot' | 'most_voted'
  filter?: string
}

export async function listQuestions(params: QuestionParams = {}) {
  const { q, limit = 10, offset = 0, sort = 'latest', filter } = params

  let query = supabase
    .from('questions')
    .select('*, user:user_id(*)', { count: 'exact' })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (filter && filter !== 'All') {
    query = query.eq('category', filter)
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  }

  // Apply sorting
  switch (sort) {
    case 'hot':
      query = query.order('like_count', { ascending: false })
      break
    case 'most_voted':
      query = query.order('vote_score', { ascending: false })
      break
    case 'latest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`)
  }

  return {
    questions: data || [],
    total: count || 0,
  }
}

export async function getQuestionById(id: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*, user:user_id(*)')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch question: ${error.message}`)
  }

  return data
}
