/**
 * Search result type returned by all search providers
 */
export type SearchResult = { 
  title: string
  url: string
  snippet?: string
  source?: string // domain
}

/**
 * Search provider interface that all providers must implement
 */
export interface SearchProvider {
  name: 'google' | 'bing' | 'duck' | 'mock'
  search(q: string, opts?: { limit?: number }): Promise<SearchResult[]>
}

/**
 * Options for configuring search providers
 */
export interface SearchProviderOptions {
  apiKey?: string
  searchEngineId?: string
  limit?: number
}

/**
 * Error thrown when a search provider fails
 */
export class SearchProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'SearchProviderError'
  }
}
