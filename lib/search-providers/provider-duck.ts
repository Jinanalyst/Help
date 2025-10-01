import { SearchProvider, SearchResult, SearchProviderError } from './types'

/**
 * DuckDuckGo search provider
 * 
 * NOTE: DuckDuckGo does not have an official public API for web search results.
 * This implementation uses a mocked approach for MVP purposes.
 * 
 * Limitations:
 * - Returns predefined results based on query matching
 * - Not suitable for production use without a proper API integration
 * - Consider using an unofficial API wrapper or scraping service (with caution)
 * 
 * For production, consider:
 * - Using DuckDuckGo's Instant Answer API (limited to specific queries)
 * - Using a third-party service like SerpAPI or ScraperAPI
 * - Implementing a custom scraping solution (check terms of service)
 */
export class DuckDuckGoSearchProvider implements SearchProvider {
  name: 'duck' = 'duck'

  // Mock database of search results
  private mockResults: { [key: string]: SearchResult[] } = {
    'default': [
      {
        title: 'DuckDuckGo - Privacy-focused Search Engine',
        url: 'https://duckduckgo.com',
        snippet: 'The Internet privacy company that empowers you to seamlessly take control of your personal information online.'
      },
      {
        title: 'Privacy Policy - DuckDuckGo',
        url: 'https://duckduckgo.com/privacy',
        snippet: 'DuckDuckGo does not collect or share personal information. That is our privacy policy in a nutshell.'
      }
    ],
    'programming': [
      {
        title: 'Stack Overflow - Where Developers Learn & Share',
        url: 'https://stackoverflow.com',
        snippet: 'Stack Overflow is the largest online community for programmers to learn, share their knowledge, and advance their careers.'
      },
      {
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        snippet: 'Resources for developers, by developers. Documenting web technologies, including CSS, HTML, and JavaScript.'
      },
      {
        title: 'GitHub: Where the world builds software',
        url: 'https://github.com',
        snippet: 'GitHub is where over 100 million developers shape the future of software, together.'
      }
    ],
    'javascript': [
      {
        title: 'JavaScript | MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        snippet: 'JavaScript (JS) is a lightweight, interpreted programming language with first-class functions.'
      },
      {
        title: 'The Modern JavaScript Tutorial',
        url: 'https://javascript.info',
        snippet: 'Modern JavaScript Tutorial: simple, but detailed explanations with examples and tasks.'
      },
      {
        title: 'JavaScript - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/JavaScript',
        snippet: 'JavaScript, often abbreviated JS, is a programming language that is one of the core technologies of the World Wide Web.'
      }
    ],
    'react': [
      {
        title: 'React – A JavaScript library for building user interfaces',
        url: 'https://react.dev',
        snippet: 'React is the library for web and native user interfaces. Build user interfaces out of individual pieces called components.'
      },
      {
        title: 'Getting Started – React',
        url: 'https://react.dev/learn',
        snippet: 'Learn React with our comprehensive guide covering components, props, state, and more.'
      },
      {
        title: 'React Tutorial - W3Schools',
        url: 'https://www.w3schools.com/react/',
        snippet: 'React is a JavaScript library for building user interfaces. React is used to build single-page applications.'
      }
    ]
  }

  constructor() {
    console.warn('DuckDuckGo provider is using mocked results for MVP. Not suitable for production.')
  }

  async search(q: string, opts?: { limit?: number }): Promise<SearchResult[]> {
    const limit = opts?.limit || 10

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      // Try to find relevant mock results based on query keywords
      const query = q.toLowerCase()
      let results: SearchResult[] = []

      // Check for keyword matches
      if (query.includes('javascript') || query.includes('js')) {
        results = this.mockResults.javascript
      } else if (query.includes('react') || query.includes('next')) {
        results = this.mockResults.react
      } else if (query.includes('programming') || query.includes('code') || query.includes('developer')) {
        results = this.mockResults.programming
      } else {
        // Default results with query-specific title
        results = [
          {
            title: `Search results for "${q}"`,
            url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
            snippet: `These are mocked results for "${q}". DuckDuckGo provider is using fallback data for MVP.`
          },
          ...this.mockResults.default
        ]
      }

      // Add query-specific result at the beginning
      const queryResult: SearchResult = {
        title: `DuckDuckGo Search: ${q}`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
        snippet: `View actual search results for "${q}" on DuckDuckGo (mocked result for MVP)`,
        source: 'duckduckgo.com'
      }

      return [queryResult, ...results].slice(0, limit).map(r => ({
        ...r,
        source: (() => { try { return new URL(r.url).hostname } catch { return undefined } })()
      }))
    } catch (error) {
      throw new SearchProviderError(
        `DuckDuckGo Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'duck',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Add custom mock results for testing
   */
  addMockResults(keyword: string, results: SearchResult[]) {
    this.mockResults[keyword.toLowerCase()] = results
  }
}
