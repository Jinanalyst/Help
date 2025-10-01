import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    await supabase.rpc('increment_question_views', { question_id: params.id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('View increment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

