import { SearchProvider, SearchResult, SearchProviderError } from './types'

/**
 * Azure Bing Web Search provider
 * Uses the Bing Web Search API v7
 * 
 * @see https://docs.microsoft.com/en-us/bing/search-apis/bing-web-search/overview
 */
export class BingSearchProvider implements SearchProvider {
  name: 'bing' = 'bing'
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BING_SEARCH_API_KEY || ''

    if (!this.apiKey) {
      console.warn('Bing Search API key not configured')
    }
  }

  async search(q: string, opts?: { limit?: number }): Promise<SearchResult[]> {
    const limit = opts?.limit || 10

    if (!this.apiKey) {
      throw new SearchProviderError(
        'Bing Search API key not configured',
        'bing'
      )
    }

    try {
      const url = new URL('https://api.bing.microsoft.com/v7.0/search')
      url.searchParams.set('q', q)
      url.searchParams.set('count', Math.min(limit, 50).toString()) // Max 50 per request
      url.searchParams.set('textDecorations', 'false')
      url.searchParams.set('textFormat', 'Raw')

      const response = await fetch(url.toString(), {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey
        }
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.webPages || !data.webPages.value || !Array.isArray(data.webPages.value)) {
        return []
      }

      return data.webPages.value.map((item: any) => ({
        title: item.name || 'No title',
        url: item.url || '',
        snippet: item.snippet || undefined,
        source: (() => { try { return new URL(item.url).hostname } catch { return undefined } })()
      }))
    } catch (error) {
      throw new SearchProviderError(
        `Bing Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'bing',
        error instanceof Error ? error : undefined
      )
    }
  }
}
