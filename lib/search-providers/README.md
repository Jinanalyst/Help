# Search Providers

This directory contains the search provider adapters for integrating different search engines into the Help Community Project.

## Architecture

The search provider system uses an adapter pattern to allow switching between different search engines without changing application code.

```
SearchProvider Interface
    ↓
┌───────────────┬───────────────┬───────────────┬───────────────┐
│   Google      │     Bing      │  DuckDuckGo   │     Mock      │
│  (CSE API)    │  (Azure API)  │   (Mocked)    │   (Testing)   │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

## Files

- `types.ts` - Common interfaces and types
- `provider-google.ts` - Google Programmable Search Engine implementation
- `provider-bing.ts` - Azure Bing Web Search implementation
- `provider-duck.ts` - DuckDuckGo implementation (mocked for MVP)
- `provider-mock.ts` - Mock provider for testing
- `index.ts` - Provider factory and utilities

## Usage

### Basic Usage

```typescript
import { getSearchProvider } from '@/lib/search-providers'

// Get default provider
const provider = getSearchProvider()
const results = await provider.search('Next.js tutorial')

console.log(results)
// [
//   { title: "...", url: "...", snippet: "..." },
//   ...
// ]
```

### Using a Specific Provider

```typescript
import { getSearchProvider } from '@/lib/search-providers'

// Force use of Google
const googleProvider = getSearchProvider('google')
const results = await googleProvider.search('React hooks', { limit: 5 })

// Force use of Bing
const bingProvider = getSearchProvider('bing')
const results = await bingProvider.search('TypeScript generics')

// Use DuckDuckGo (mocked)
const duckProvider = getSearchProvider('duck')
const results = await duckProvider.search('JavaScript async')

// Use mock provider for testing
const mockProvider = getSearchProvider('mock')
const results = await mockProvider.search('test query')
```

### Checking Provider Availability

```typescript
import { 
  getAvailableProviders, 
  isProviderAvailable 
} from '@/lib/search-providers'

// Get list of configured providers
const available = getAvailableProviders()
console.log(available) // ['bing', 'duck', 'mock']

// Check specific provider
if (isProviderAvailable('google')) {
  console.log('Google search is configured')
}
```

### In API Routes

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSearchProvider } from '@/lib/search-providers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const providerName = searchParams.get('provider')
  
  const provider = getSearchProvider(
    providerName as 'google' | 'bing' | 'duck' | 'mock'
  )
  
  const results = await provider.search(query, { limit: 10 })
  
  return NextResponse.json({ results })
}
```

## Configuration

### Google CSE

1. Get API key: https://developers.google.com/custom-search/v1/overview
2. Create Custom Search Engine: https://programmablesearchengine.google.com/
3. Add to `.env.local`:

```env
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here
```

### Bing Web Search

1. Create Azure account: https://portal.azure.com/
2. Create Bing Search resource
3. Get API key from Azure portal
4. Add to `.env.local`:

```env
BING_SEARCH_API_KEY=your_api_key_here
```

### DuckDuckGo

DuckDuckGo provider currently uses mocked results for MVP. No API key required.

**Note:** This is not suitable for production. For production use, consider:
- DuckDuckGo Instant Answer API (limited functionality)
- Third-party services like SerpAPI or ScraperAPI
- Custom scraping solution (check terms of service)

### Mock Provider

No configuration needed. Always available for testing.

## Provider Selection Priority

The default provider is selected automatically:

1. **Bing** - if `BING_SEARCH_API_KEY` is set
2. **Google** - if both `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set
3. **DuckDuckGo** - mocked fallback (always available)
4. **Mock** - ultimate fallback

## API Rate Limits

### Google CSE
- Free tier: 100 queries/day
- Paid tier: $5 per 1,000 queries (up to 10,000/day)

### Bing Web Search
- Free tier: 1,000 queries/month
- S1: $7 per 1,000 queries

### DuckDuckGo
- N/A (mocked results)

### Mock
- Unlimited (local only)

## Error Handling

```typescript
import { 
  getSearchProvider, 
  SearchProviderError 
} from '@/lib/search-providers'

try {
  const provider = getSearchProvider('google')
  const results = await provider.search('query')
} catch (error) {
  if (error instanceof SearchProviderError) {
    console.error(`Provider ${error.provider} failed:`, error.message)
    // Fallback to another provider
    const fallback = getSearchProvider('mock')
    const results = await fallback.search('query')
  }
}
```

## Testing

```typescript
import { MockSearchProvider } from '@/lib/search-providers'

describe('Search functionality', () => {
  it('should return results', async () => {
    const provider = new MockSearchProvider()
    const results = await provider.search('test query')
    
    expect(results).toHaveLength(10)
    expect(results[0]).toHaveProperty('title')
    expect(results[0]).toHaveProperty('url')
  })
})
```

## Adding a New Provider

To add a new search provider:

1. Create `provider-{name}.ts` file
2. Implement `SearchProvider` interface
3. Export from `index.ts`
4. Update factory function in `index.ts`
5. Update types if needed
6. Add configuration to `.env.local.example`
7. Document in main README.md

Example:

```typescript
// provider-custom.ts
import { SearchProvider, SearchResult } from './types'

export class CustomSearchProvider implements SearchProvider {
  name: 'custom' = 'custom'
  
  async search(q: string, opts?: { limit?: number }): Promise<SearchResult[]> {
    // Implementation
    return []
  }
}
```

## Limitations

### DuckDuckGo Provider
- **Current State**: Uses mocked/predefined results
- **Limitation**: Not real search results
- **Impact**: Not suitable for production
- **Workaround**: Configure Google or Bing for production use
- **Future**: Consider integrating SerpAPI or similar service

### Rate Limits
- Be mindful of API rate limits
- Implement caching for frequently searched queries
- Monitor usage in production

### API Keys
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor API key usage

## Best Practices

1. **Always use environment variables** for API keys
2. **Implement caching** to reduce API calls
3. **Handle errors gracefully** with fallback providers
4. **Monitor usage** to avoid exceeding rate limits
5. **Test with mock provider** before using real APIs
6. **Log search queries** for analytics and improvement

