import { NextRequest, NextResponse } from 'next/server'

// Mock data storage for assists - in a real app, this would use a database
let assists: Array<{ 
  id: string; 
  title: string; 
  url: string; 
  note: string; 
  userId?: string; 
  timestamp: string 
}> = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let filteredAssists = assists

    // If userId is provided, filter by user
    if (userId) {
      filteredAssists = assists.filter(assist => assist.userId === userId)
    }

    // Return last 20 assists, sorted by timestamp (newest first)
    const sortedAssists = filteredAssists
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)

    return NextResponse.json(sortedAssists)
  } catch (error) {
    console.error('Error fetching assists:', error)
    return NextResponse.json({ error: 'Failed to fetch assists' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, url, note, userId } = await request.json()

    // Validate required fields
    if (!title || !url || !note) {
      return NextResponse.json({ 
        error: 'Title, URL, and note are required' 
      }, { status: 400 })
    }

    // Create new assist
    const newAssist = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      note: note.trim(),
      userId: userId || undefined,
      timestamp: new Date().toISOString()
    }

    // Add to assists array
    assists.unshift(newAssist)

    // Keep only the last 1000 assists per user (or 5000 total)
    if (userId) {
      const userAssists = assists.filter(assist => assist.userId === userId)
      if (userAssists.length > 1000) {
        const userAssistIds = userAssists.slice(1000).map(a => a.id)
        assists = assists.filter(assist => !userAssistIds.includes(assist.id))
      }
    } else {
      if (assists.length > 5000) {
        assists = assists.slice(0, 5000)
      }
    }

    return NextResponse.json(newAssist)
  } catch (error) {
    console.error('Error adding assist:', error)
    return NextResponse.json({ error: 'Failed to add assist' }, { status: 500 })
  }
}
