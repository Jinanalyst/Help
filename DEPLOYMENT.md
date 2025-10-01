# Deployment Guide

## What's Been Added

### New Features ✨
1. **Ask Question Flow**
   - Homepage now has an "Ask a question" button
   - Redirects to `/login` if not authenticated
   - Goes to `/ask` page if authenticated
   - Returns to `/ask` after successful login

2. **Ask Page (`/ask`)**
   - Clean, centered form with:
     - Question title (required, max 200 chars)
     - Description (optional, max 2000 chars)
     - Category dropdown (optional)
   - Validates input and shows errors
   - Posts to `/api/questions`
   - Redirects to search results after success

3. **Questions API (`/api/questions`)**
   - POST: Creates new questions in Supabase
   - GET: Fetches questions (optionally filtered by user)
   - Fully authenticated with RLS (Row Level Security)

4. **Updated Login Flow**
   - Now supports `returnUrl` parameter
   - Google/GitHub OAuth redirects properly
   - Magic Link email redirects properly

5. **Styling**
   - New `ask.css` for the Ask page
   - Responsive design (mobile-friendly)
   - Consistent blue accents matching homepage

## Deploy to GitHub

### Option 1: Using the Script (Easiest)
1. Double-click `deploy.bat` in your project folder
2. It will automatically:
   - Add all files
   - Commit changes
   - Push to GitHub

### Option 2: Manual Commands
Open Git Bash or Command Prompt in your project folder:

```bash
git add .
git commit -m "Add Ask Question flow with Supabase integration"
git push origin main
```

If you get an error about setting up git user:
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Deploy to Vercel

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your "Help" repository

### Step 2: Configure Environment Variables
In Vercel project settings, add these environment variables:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**Optional (for search):**
```
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

### Step 3: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your live site!

## Setup Supabase

See `SUPABASE_SETUP.md` for detailed instructions.

### Quick Checklist:
- [ ] Create `questions` table in Supabase
- [ ] Set up Row Level Security policies
- [ ] Enable Google/GitHub OAuth providers
- [ ] Configure redirect URLs
- [ ] Add environment variables to Vercel
- [ ] Test authentication flow
- [ ] Test asking a question

## File Structure

```
New Community Project - Help/
├── app/
│   ├── api/
│   │   └── questions/
│   │       └── route.ts          # NEW: Questions API endpoint
│   ├── ask/
│   │   └── page.tsx               # NEW: Ask question page
│   ├── login/
│   │   └── page.tsx               # UPDATED: returnUrl support
│   └── page.tsx                   # UPDATED: Ask button + auth check
├── components/
│   └── login/
│       └── AuthButtons.tsx        # UPDATED: returnUrl redirect
├── styles/
│   └── ask.css                    # NEW: Ask page styles
├── deploy.bat                     # NEW: Easy deployment script
├── SUPABASE_SETUP.md              # NEW: Database setup guide
└── DEPLOYMENT.md                  # NEW: This file
```

## Testing Locally

1. Make sure you have `.env.local` with Supabase credentials
2. Run development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000
4. Test the flow:
   - Click "Ask a question" (should redirect to login)
   - Sign in with Google/GitHub/Email
   - You should be redirected to `/ask`
   - Fill out the question form
   - Submit and verify it saves to Supabase

## Troubleshooting

### "Failed to save question"
- Check Supabase table exists (`questions`)
- Verify RLS policies are set
- Check environment variables are correct

### "Unauthorized" error
- Make sure you're logged in
- Check Supabase auth is working
- Verify redirect URLs in Supabase dashboard

### OAuth redirect issues
- Update Supabase Auth > URL Configuration
- Add both localhost and Vercel URLs
- Format: `https://your-domain.vercel.app/auth/callback`

### Build errors on Vercel
- Check all environment variables are set
- Make sure `NEXT_PUBLIC_` prefix is correct
- Verify no syntax errors in code

## Next Steps

After deployment:
1. Test the full Ask flow on production
2. Add more question categories
3. Implement question voting
4. Add answer functionality
5. Build user profiles
6. Add notifications

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check Supabase logs (Dashboard > Logs)
3. Check browser console for errors
4. Review `SUPABASE_SETUP.md` for database setup

---

**Happy deploying! 🚀**

