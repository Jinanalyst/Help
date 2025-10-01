/**
 * Utility function to record an assist (to be called when the user posts an answer)
 * 
 * @param assist - The assist data to record
 * @param userId - Optional user ID if logged in
 * @returns Promise<boolean> - Success status
 */
export async function recordAssist(
  assist: {
    title: string
    url: string
    note: string
  },
  userId?: string
): Promise<boolean> {
  try {
    if (userId) {
      // If logged in, POST to API
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: assist.title,
          url: assist.url,
          note: assist.note,
          userId: userId
        }),
      })

      return response.ok
    } else {
      // If not logged in, save to localStorage
      const localAssists = JSON.parse(localStorage.getItem('local_assists') || '[]')
      const newAssist = {
        id: Date.now().toString(),
        ...assist,
        timestamp: new Date().toISOString()
      }
      
      // Add to beginning of array and keep max 50
      const updatedAssists = [newAssist, ...localAssists].slice(0, 50)
      localStorage.setItem('local_assists', JSON.stringify(updatedAssists))
      
      return true
    }
  } catch (error) {
    console.error('Error recording assist:', error)
    return false
  }
}

/**
 * Helper function to get assists from localStorage
 * Useful for displaying assists when not logged in
 */
export function getLocalAssists() {
  try {
    return JSON.parse(localStorage.getItem('local_assists') || '[]')
  } catch (error) {
    console.error('Error getting local assists:', error)
    return []
  }
}

/**
 * Helper function to clear all local assists
 */
export function clearLocalAssists() {
  try {
    localStorage.removeItem('local_assists')
    return true
  } catch (error) {
    console.error('Error clearing local assists:', error)
    return false
  }
}
