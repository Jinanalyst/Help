import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { type, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check existing vote
    const { data: existingVote } = await supabase
      .from('question_votes')
      .select('*')
      .eq('question_id', params.id)
      .eq('user_id', userId)
      .single()

    if (existingVote) {
      // Remove existing vote
      await supabase
        .from('question_votes')
        .delete()
        .eq('question_id', params.id)
        .eq('user_id', userId)

      if (existingVote.vote_type === 'up') {
        await supabase.rpc('decrement_question_votes', { question_id: params.id })
      } else {
        await supabase.rpc('increment_question_votes', { question_id: params.id })
      }

      // If clicking same button, just remove vote
      if (existingVote.vote_type === type) {
        return NextResponse.json({ success: true })
      }
    }

    // Add new vote
    await supabase
      .from('question_votes')
      .insert({ 
        question_id: params.id, 
        user_id: userId,
        vote_type: type 
      })

    if (type === 'up') {
      await supabase.rpc('increment_question_votes', { question_id: params.id })
    } else {
      await supabase.rpc('decrement_question_votes', { question_id: params.id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vote API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

