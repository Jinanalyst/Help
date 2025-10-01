import { SearchProvider, SearchResult } from './types'

/**
 * Mock search provider for testing and development
 * Returns predefined results without making any API calls
 */
export class MockSearchProvider implements SearchProvider {
  name: 'mock' = 'mock'

  async search(q: string, opts?: { limit?: number }): Promise<SearchResult[]> {
    const limit = opts?.limit || 10

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))

    const mockResults: SearchResult[] = [
      {
        title: `Mock Result 1 for "${q}"`,
        url: `https://example.com/result1?q=${encodeURIComponent(q)}`,
        snippet: `This is a mock search result for testing purposes. Query: ${q}`
      },
      {
        title: `Mock Result 2 for "${q}"`,
        url: `https://example.com/result2?q=${encodeURIComponent(q)}`,
        snippet: `Another mock result to help with development and testing.`
      },
      {
        title: `Mock Result 3 for "${q}"`,
        url: `https://example.com/result3?q=${encodeURIComponent(q)}`,
        snippet: `Mock providers are useful for development without API keys.`
      },
      {
        title: 'How to use the Mock Search Provider',
        url: 'https://example.com/docs/mock-provider',
        snippet: 'The mock provider returns static results for testing without requiring API credentials.'
      },
      {
        title: 'Testing Search Functionality',
        url: 'https://example.com/docs/testing',
        snippet: 'Use the mock provider to test your search UI without making real API calls.'
      },
      {
        title: 'Search Provider Documentation',
        url: 'https://example.com/docs/providers',
        snippet: 'Learn about different search providers: Google, Bing, DuckDuckGo, and Mock.'
      },
      {
        title: 'API Integration Guide',
        url: 'https://example.com/docs/api',
        snippet: 'Step-by-step guide to integrate real search providers into your application.'
      },
      {
        title: 'Best Practices for Search',
        url: 'https://example.com/docs/best-practices',
        snippet: 'Improve search relevance and user experience with these best practices.'
      },
      {
        title: 'Search Analytics and Metrics',
        url: 'https://example.com/docs/analytics',
        snippet: 'Track and analyze search performance to improve your application.'
      },
      {
        title: 'Advanced Search Features',
        url: 'https://example.com/docs/advanced',
        snippet: 'Implement advanced search features like filters, facets, and autocomplete.'
      }
    ]

    return mockResults.slice(0, limit)
  }
}

