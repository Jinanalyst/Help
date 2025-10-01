import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { liked, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (liked) {
      // Add like
      await supabase
        .from('question_likes')
        .insert({ question_id: params.id, user_id: userId })

      await supabase.rpc('increment_question_likes', { question_id: params.id })
    } else {
      // Remove like
      await supabase
        .from('question_likes')
        .delete()
        .eq('question_id', params.id)
        .eq('user_id', userId)

      await supabase.rpc('decrement_question_likes', { question_id: params.id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Like API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

