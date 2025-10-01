# Supabase Setup Guide

## 1. Create Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policies for questions
CREATE POLICY "Questions are viewable by everyone" 
  ON questions FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own questions" 
  ON questions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" 
  ON questions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" 
  ON questions FOR DELETE 
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_category ON questions(category);

-- Search history table (optional - if using)
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search history" 
  ON search_history FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own search history" 
  ON search_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Search suggestions table (optional)
CREATE TABLE IF NOT EXISTS search_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion TEXT UNIQUE NOT NULL,
  frequency INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suggestions are viewable by everyone" 
  ON search_suggestions FOR SELECT 
  USING (true);

-- Index for faster searches
CREATE INDEX idx_search_suggestions_suggestion ON search_suggestions(suggestion);
CREATE INDEX idx_search_suggestions_frequency ON search_suggestions(frequency DESC);
```

## 2. Configure Authentication

### In Supabase Dashboard > Authentication > Providers:

1. **Email (Magic Link)**
   - Enable Email provider
   - Enable "Confirm email" (optional)
   - Set email templates as needed

2. **Google OAuth**
   - Enable Google provider
   - Add your Google OAuth Client ID and Secret
   - Authorized redirect URIs:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://your-domain.vercel.app/auth/callback`

3. **GitHub OAuth**
   - Enable GitHub provider
   - Add your GitHub OAuth Client ID and Secret
   - Same callback URLs as above

### In Supabase Dashboard > Authentication > URL Configuration:

- **Site URL**: `https://your-domain.vercel.app` (production) or `http://localhost:3000` (dev)
- **Redirect URLs**: Add both your localhost and production URLs

## 3. Environment Variables

### For Vercel (Production):

Go to your Vercel project settings > Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

### For Local Development:

Create `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

## 4. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" (gear icon) > "API"
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Google Custom Search Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Custom Search API"
4. Create credentials (API Key)
5. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
6. Create a new search engine
7. Copy the Search Engine ID

## 6. Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 7. Test the Integration

1. Visit your deployed site
2. Try signing up with email/Google/GitHub
3. Ask a question (should save to Supabase)
4. Check your Supabase dashboard > Table Editor > questions to verify

## Troubleshooting

- **Auth not working**: Check redirect URLs in Supabase match your domain
- **Questions not saving**: Verify RLS policies are set correctly
- **CORS errors**: Ensure Site URL is set in Supabase Auth settings
- **Environment variables**: Restart your dev server after adding `.env.local`

