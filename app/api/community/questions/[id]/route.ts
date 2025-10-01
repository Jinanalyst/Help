import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('questions')
      .select('*, user:user_id(*)')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json({ question: data })
  } catch (error) {
    console.error('Question detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

