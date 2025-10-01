import { SearchProvider, SearchResult, SearchProviderError } from './types'

/**
 * Google Programmable Search Engine (CSE) provider
 * Uses the Custom Search JSON API
 * 
 * @see https://developers.google.com/custom-search/v1/overview
 */
export class GoogleSearchProvider implements SearchProvider {
  name: 'google' = 'google'
  private apiKey: string
  private searchEngineId: string

  constructor(apiKey?: string, searchEngineId?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_SEARCH_API_KEY || ''
    this.searchEngineId = searchEngineId || process.env.GOOGLE_SEARCH_ENGINE_ID || ''

    if (!this.apiKey || !this.searchEngineId) {
      console.warn('Google Search API key or Search Engine ID not configured')
    }
  }

  async search(q: string, opts?: { limit?: number }): Promise<SearchResult[]> {
    const limit = opts?.limit || 10

    if (!this.apiKey || !this.searchEngineId) {
      throw new SearchProviderError(
        'Google Search API key or Search Engine ID not configured',
        'google'
      )
    }

    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1')
      url.searchParams.set('key', this.apiKey)
      url.searchParams.set('cx', this.searchEngineId)
      url.searchParams.set('q', q)
      url.searchParams.set('num', Math.min(limit, 10).toString()) // Max 10 per request

      const response = await fetch(url.toString())

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.items || !Array.isArray(data.items)) {
        return []
      }

      return data.items.map((item: any) => ({
        title: item.title || 'No title',
        url: item.link || '',
        snippet: item.snippet || undefined,
        source: (() => { try { return new URL(item.link).hostname } catch { return undefined } })()
      }))
    } catch (error) {
      throw new SearchProviderError(
        `Google Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'google',
        error instanceof Error ? error : undefined
      )
    }
  }
}
