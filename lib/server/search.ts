import { getSearchProvider } from '@/lib/search-providers'

const STOP_WORDS = new Set(['about','after','against','among','because','being','could','first','other','their','there','these','those','where','which','while','whose','would','should','might','using','based','within','between','around'])

function extractTerms(results: any[], query: string, max = 6) {
  const words = new Map<string, number>()

  results.forEach(result => {
    const text = `${result.title ?? ''} ${result.snippet ?? ''}`.toLowerCase()
    text
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .forEach(word => {
        if (word.length < 4) return
        if (STOP_WORDS.has(word)) return
        if (query.toLowerCase().includes(word)) return
        words.set(word, (words.get(word) ?? 0) + 1)
      })
  })

  return Array.from(words.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([word]) => `${query} ${word}`)
}

export async function searchEverything(q: string, limit = 10) {
  if (!q?.trim()) {
    throw new Error('Query parameter "q" is required')
  }

  const provider = getSearchProvider()
  const results = await provider.search(q, { limit })

  const followUps = extractTerms(results, q, 6)
  if (followUps.length < 3) {
    const fallbacks = [
      `How does ${q} work?`,
      `Best resources for ${q}`,
      `${q} vs alternatives`,
      `${q} tips and tricks`
    ]
    followUps.push(...fallbacks.slice(0, 6 - followUps.length))
  }

  return {
    query: q,
    provider: provider.name,
    count: results.length,
    followUps: followUps.slice(0, 6),
    results: results.slice(0, limit)
  }
}
