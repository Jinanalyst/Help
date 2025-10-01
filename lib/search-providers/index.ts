import { SearchProvider } from './types'
import { GoogleSearchProvider } from './provider-google'

export * from './types'
export { GoogleSearchProvider } from './provider-google'

export function getSearchProvider(): SearchProvider {
  if (!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID)) {
    throw new Error('Google CSE not configured. Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID.')
  }
  return new GoogleSearchProvider()
}

export function isProviderAvailable(): boolean {
  return !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID)
}

export function getAvailableProviders(): Array<'google'> {
  return isProviderAvailable() ? ['google'] : []
}
