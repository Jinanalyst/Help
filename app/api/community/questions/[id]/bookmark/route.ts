import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { bookmarked, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (bookmarked) {
      await supabase
        .from('question_bookmarks')
        .insert({ question_id: params.id, user_id: userId })
    } else {
      await supabase
        .from('question_bookmarks')
        .delete()
        .eq('question_id', params.id)
        .eq('user_id', userId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Bookmark API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

