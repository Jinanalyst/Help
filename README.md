# Help Community Project

A Next.js application for helping people with your knowledge, featuring a Google-style search interface and community-driven assistance.

## Features

- 🔍 **Google-style Search Interface** - Clean, minimal search with autocomplete suggestions
- 📚 **Search History** - Track and revisit previous searches
- 💡 **Smart Suggestions** - AI-powered search suggestions
- 🎨 **Modern UI** - Responsive design with smooth animations
- ⚡ **Fast Performance** - Built with Next.js 14 and TypeScript
- 🔒 **Secure** - Environment-based configuration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules + Global CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd help-community-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.local.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Create the following tables in your Supabase project:

   ```sql
   -- Search history table
   CREATE TABLE search_history (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     query TEXT NOT NULL,
     user_id UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Search suggestions table
   CREATE TABLE search_suggestions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     suggestion TEXT UNIQUE NOT NULL,
     frequency INTEGER DEFAULT 1,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Indexes for better performance
   CREATE INDEX idx_search_history_query ON search_history(query);
   CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);
   CREATE INDEX idx_search_suggestions_suggestion ON search_suggestions(suggestion);
   CREATE INDEX idx_search_suggestions_frequency ON search_suggestions(frequency DESC);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── suggest/       # Search suggestions
│   │   ├── history/       # Search history
│   │   └── log-query/     # Query logging
│   ├── search/            # Search results page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── SearchBox.tsx      # Search input component
├── lib/                   # Utility libraries
│   └── supabase.ts        # Supabase client
├── styles/                # CSS modules
│   └── search.css         # Search-specific styles
├── public/                # Static assets
│   └── assets/            # Images and icons
└── README.md
```

## API Endpoints

### GET /api/suggest?q=query
Returns search suggestions based on the query.

**Response:**
```json
{
  "suggestions": ["suggestion1", "suggestion2", ...]
}
```

### GET /api/history?userId=userId
Returns last 20 assists for a user (or all assists if no userId).

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Assist Title",
    "url": "https://example.com",
    "note": "Helpful note about the assist",
    "userId": "user123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/history
Adds a new assist to history.

**Request:**
```json
{
  "title": "Assist Title",
  "url": "https://example.com",
  "note": "Helpful note about the assist",
  "userId": "user123"
}
```

### POST /api/log-query
Logs a search query for analytics.

**Request:**
```json
{
  "q": "search query"
}
```

## Search Providers

The application supports multiple search providers through an adapter interface:

### Available Providers

1. **Google Programmable Search Engine (CSE)**
   - Most accurate and comprehensive results
   - Requires API key and Custom Search Engine ID
   - Free tier: 100 queries/day
   - [Get API Key](https://developers.google.com/custom-search/v1/overview)

2. **Bing Web Search API**
   - High-quality results from Microsoft Bing
   - Requires Azure API key
   - Free tier: 1,000 queries/month
   - [Get API Key](https://portal.azure.com/)

3. **DuckDuckGo** (Mocked for MVP)
   - Privacy-focused search
   - Currently uses mocked results (no API key required)
   - Not suitable for production without proper API integration
   - For production, consider third-party services like SerpAPI

4. **Mock Provider**
   - For testing and development
   - Returns static results
   - No API key required

### Using Search Providers

```typescript
import { getSearchProvider } from '@/lib/search-providers'

// Get default provider (based on available API keys)
const provider = getSearchProvider()
const results = await provider.search('your query', { limit: 10 })

// Use a specific provider
const bingProvider = getSearchProvider('bing')
const results = await bingProvider.search('your query')

// Check which providers are available
import { getAvailableProviders, isProviderAvailable } from '@/lib/search-providers'

const available = getAvailableProviders() // ['bing', 'duck', 'mock']
const hasBing = isProviderAvailable('bing') // true/false
```

### Provider Selection Logic

The default provider is selected in this order:
1. Bing (if `BING_SEARCH_API_KEY` is set)
2. Google (if both `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set)
3. DuckDuckGo (mocked, always available)
4. Mock (fallback)

You can override this by passing a provider name: `?provider=google|bing|duck|mock`

### Limitations

- **DuckDuckGo**: Currently uses mocked results for MVP. Does not make real API calls.
- **Rate Limits**: Be aware of rate limits for Google (100/day free) and Bing (1000/month free)
- **API Keys**: Store API keys in `.env.local` file (never commit to git)

## Helper Functions

### recordAssist Utility

Use this utility function to record assists when users provide answers:

```typescript
import { recordAssist } from '@/lib/recordAssist'

// Record an assist (logged in user)
await recordAssist({
  title: "How to center a div in CSS",
  url: "https://example.com/css-center-div",
  note: "Explained three different methods: flexbox, grid, and absolute positioning"
}, "user123")

// Record an assist (anonymous user - saves to localStorage)
await recordAssist({
  title: "JavaScript async/await best practices",
  url: "https://example.com/js-async-await",
  note: "Covered error handling and Promise.all patterns"
})

// Get local assists (for anonymous users)
import { getLocalAssists } from '@/lib/recordAssist'
const assists = getLocalAssists()

// Clear local assists
import { clearLocalAssists } from '@/lib/recordAssist'
clearLocalAssists()
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting (recommended)
- Semantic HTML and ARIA attributes for accessibility

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Authentication Setup

### Supabase Auth Configuration

The application uses Supabase Auth with the following providers:

1. **Google OAuth** - Fast sign-in with Google account
2. **GitHub OAuth** - Sign in with GitHub account
3. **Email Magic Link** - Passwordless email authentication

### Setting Up Auth Providers

#### 1. Configure Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**

#### 2. Enable Google OAuth

1. In Supabase Dashboard, go to **Authentication** → **Providers** → **Google**
2. Enable the Google provider
3. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/):
   - Create a new project or select existing
   - Go to **APIs & Services** → **Credentials**
   - Create **OAuth 2.0 Client ID**
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase
5. Set authorized domains in Supabase

#### 3. Enable GitHub OAuth

1. In Supabase Dashboard, go to **Authentication** → **Providers** → **GitHub**
2. Enable the GitHub provider
3. Get OAuth credentials from [GitHub Developer Settings](https://github.com/settings/developers):
   - Create a new OAuth App
   - Set Homepage URL: `http://localhost:3000` (dev) or your domain (prod)
   - Set Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

#### 4. Enable Email Magic Link

1. In Supabase Dashboard, go to **Authentication** → **Providers** → **Email**
2. Enable Email provider
3. Enable **"Confirm email"** (recommended)
4. Configure email templates:
   - Go to **Authentication** → **Email Templates**
   - Customize **Magic Link** template
5. Set up SMTP (optional):
   - Go to **Project Settings** → **Auth**
   - Configure custom SMTP settings (or use Supabase defaults)

#### 5. Configure Site URL

1. Go to **Project Settings** → **Auth**
2. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

### Environment Variables

Create a `.env.local` file (copy from `env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Security Features

- **Rate Limiting** - Auth actions are rate-limited (5 attempts per minute)
- **Secure Cookies** - HTTPOnly, Secure, SameSite cookies
- **PKCE Flow** - Proof Key for Code Exchange for OAuth
- **Email Verification** - Optional email confirmation
- **Session Management** - Automatic token refresh
- **CSRF Protection** - Built into Supabase Auth

### Authentication Flow

1. **User clicks "Sign in"** → Auth modal opens
2. **User selects provider**:
   - **OAuth (Google/GitHub)**: Redirects to provider → Returns to `/auth/callback` → Redirects to home
   - **Magic Link**: Email sent → User clicks link → Redirects to `/auth/callback` → Redirects to home
3. **Session created** → User state updates globally
4. **Protected routes** → Check session on server/client

### Using Auth in Your Code

```typescript
// Get current user (client-side)
import { getCurrentUser } from '@/lib/auth'

const user = await getCurrentUser()
if (user) {
  console.log(user.email, user.name)
}

// Sign out
import { signOut } from '@/lib/auth'

await signOut()

// Check if user is authenticated (server-side)
import { createServerSupabaseClient } from '@/lib/supabase'

const supabase = createServerSupabaseClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Customization

#### Update Apps Grid

Edit `components/AppsGrid.tsx` to add/remove quick links:

```typescript
const apps: AppLink[] = [
  {
    name: 'Your App',
    url: '/your-app',
    icon: '🚀',
    description: 'Description'
  },
  // ... more apps
]
```

#### Customize Auth Modal

Edit `components/AuthModal.tsx` to modify:
- Sign-in methods
- UI/styling
- Error messages
- Success states

#### Rate Limiting

Adjust rate limits in `lib/auth.ts`:

```typescript
checkAuthRateLimit(identifier, maxAttempts, windowMs)
// Default: 5 attempts per 60 seconds
```

## Support

For questions and support, please open an issue on GitHub.
