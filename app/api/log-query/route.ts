// Force dynamic rendering to prevent SSG issues
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

// Mock database - in a real app, this would be a proper database
let queries: Array<{ id: string; q: string; user_id?: string; created_at: string }> = []

export async function POST(request: NextRequest) {
  try {
    const { q } = await request.json()

    if (!q || typeof q !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Extract user_id from request headers or auth context
    // In a real app, this would come from authentication middleware
    const userId = request.headers.get('x-user-id') || undefined

    // Insert query into queries table
    const newQuery = {
      id: Date.now().toString(),
      q: q.trim(),
      user_id: userId,
      created_at: new Date().toISOString()
    }

    // Add to mock database
    queries.push(newQuery)

    // In a real application, this would be:
    // await supabase.from('queries').insert(newQuery)

    // Return success (ignore any failures silently as per requirements)
    return NextResponse.json({ 
      success: true, 
      message: 'Query logged successfully'
    })
  } catch (error) {
    // Ignore failures silently as per requirements
    console.error('Error logging query (silently ignored):', error)
    return NextResponse.json({ 
      success: true, 
      message: 'Query logged successfully' 
    })
  }
}
