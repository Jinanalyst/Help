# Community Q&A - Deployment Guide

## 🚀 Quick Deploy to Production

### Prerequisites
- Supabase project created
- Vercel account connected to GitHub
- Repository pushed to GitHub

### Step 1: Database Setup (Supabase)

1. **Go to Supabase SQL Editor**
   - Open your project at https://app.supabase.com
   - Navigate to SQL Editor

2. **Run All SQL Commands**
   - Copy entire SQL from `SUPABASE_COMMUNITY_SETUP.md`
   - Execute in SQL Editor
   - Verify all tables are created in Table Editor

3. **Verify Row Level Security**
   ```sql
   -- Check RLS is enabled
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```
   All should show `rowsecurity = true`

### Step 2: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Community Q&A feature"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   
   Add these in Vercel Project Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   GOOGLE_SEARCH_API_KEY=your_google_api_key (optional)
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id (optional)
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Visit your live site!

### Step 3: Test Production

1. **Visit `/community`**
   - Should load feed (empty initially)
   - Filters and sort should work

2. **Create First Question**
   - Click "질문하기" (Ask Question)
   - Sign in with Google/GitHub/Email
   - Fill form and submit
   - Verify it appears in feed

3. **Test All Actions**
   - Like a question
   - Upvote/downvote
   - Bookmark
   - Add answer
   - Add comment
   - Check all persist after refresh

4. **Mobile Test**
   - Open on phone
   - Check responsive layout
   - Scroll filters horizontally
   - Verify touch interactions

## 📊 Database Checklist

After running setup SQL, verify in Supabase Table Editor:

### Tables Created
- [x] `questions` (with tags, like_count, vote_score, view_count)
- [x] `question_likes`
- [x] `question_votes`
- [x] `question_bookmarks`
- [x] `answers`
- [x] `answer_votes`
- [x] `answer_comments`

### Indexes Created
- [x] `idx_questions_tags` (GIN index)
- [x] `idx_questions_like_count`
- [x] `idx_questions_vote_score`
- [x] `idx_answers_question_id`
- [x] `idx_answers_vote_score`
- [x] `idx_answer_comments_answer_id`

### Functions Created
- [x] `increment_question_likes()`
- [x] `decrement_question_likes()`
- [x] `increment_question_votes()`
- [x] `decrement_question_votes()`
- [x] `increment_question_views()`
- [x] `increment_answer_votes()`
- [x] `decrement_answer_votes()`

### RLS Policies
- [x] All tables have RLS enabled
- [x] SELECT policies allow public read
- [x] INSERT/UPDATE/DELETE restricted to owners
- [x] Vote tables enforce unique user+item

## 🔧 Configuration

### Supabase Auth Settings

1. **OAuth Providers**
   - Enable Google OAuth
   - Enable GitHub OAuth
   - Set redirect URLs:
     - `https://your-domain.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for dev)

2. **Email Settings**
   - Enable Email provider
   - Enable Magic Link
   - Customize email templates (optional)

3. **URL Configuration**
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: Add both localhost and production

### Vercel Settings

1. **Build Settings**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Environment Variables**
   - Production: Set all `NEXT_PUBLIC_*` vars
   - Preview: Same as production
   - Development: Use `.env.local`

3. **Domains**
   - Add custom domain (optional)
   - Configure DNS
   - Enable HTTPS (automatic)

## 📈 Post-Deployment

### Seed Initial Data (Optional)

Create some sample questions to test:

```bash
# Use Supabase SQL Editor
INSERT INTO questions (title, description, category, tags, user_id) VALUES
('How to optimize React performance?', 'My app is slow...', 'Technical', ARRAY['react', 'performance'], 'your-user-id'),
('Best practices for Next.js deployment?', 'What are the recommended...', 'How-To', ARRAY['nextjs', 'deployment'], 'your-user-id');
```

### Monitor Performance

1. **Supabase Dashboard**
   - Check API usage
   - Monitor query performance
   - Review error logs

2. **Vercel Analytics**
   - Enable Web Analytics
   - Track page views
   - Monitor Core Web Vitals

3. **Error Tracking**
   - Set up Sentry (optional)
   - Configure error boundaries
   - Monitor API errors

## 🔒 Security Checklist

- [x] RLS enabled on all tables
- [x] Environment variables not committed
- [x] API keys secured in Vercel
- [x] Auth required for mutations
- [x] Input validation on forms
- [x] HTTPS enforced
- [x] CORS configured properly
- [x] Rate limiting (via Supabase)

## 🐛 Common Issues & Fixes

### Issue: "Failed to fetch questions"
**Fix:**
- Check Supabase URL in env vars
- Verify RLS policies allow SELECT
- Check network tab for 401/403 errors

### Issue: "Unauthorized" on vote/like
**Fix:**
- Ensure user is logged in
- Check session cookie
- Verify RLS policies for INSERT

### Issue: Votes not incrementing
**Fix:**
- Run database functions from setup
- Check function exists: `SELECT * FROM pg_proc WHERE proname LIKE '%vote%'`
- Verify triggers/updates

### Issue: Infinite scroll not working
**Fix:**
- Check console for IntersectionObserver errors
- Verify `hasMore` state logic
- Test with more than 10 questions

### Issue: Mobile layout broken
**Fix:**
- Clear browser cache
- Check CSS media queries
- Verify viewport meta tag

## 📱 Platform-Specific Setup

### iOS/Safari
- Add to Home Screen support
- Configure `apple-touch-icon`
- Test viewport behavior

### Android
- PWA manifest (optional)
- Test Chrome mobile
- Check touch target sizes

## 🎯 Success Metrics

Track these after deployment:

1. **Engagement**
   - Questions posted per day
   - Answers per question
   - Vote/like interactions
   - Comment threads

2. **Performance**
   - Page load time < 2s
   - Time to Interactive < 3s
   - Infinite scroll FPS > 30

3. **Retention**
   - Return visitors
   - Daily active users
   - Question resolution rate

## 🔄 Continuous Deployment

Vercel auto-deploys on:
- Push to `main` branch → Production
- Pull requests → Preview deployments
- Manual deploys → Dashboard

**Best Practices:**
1. Test locally first
2. Use preview deployments for PRs
3. Monitor build logs
4. Run E2E tests before merging
5. Keep dependencies updated

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [COMMUNITY_README.md](./COMMUNITY_README.md) - Feature details
- [SUPABASE_COMMUNITY_SETUP.md](./SUPABASE_COMMUNITY_SETUP.md) - Database setup

---

## ✅ Final Checklist

Before going live:

- [ ] All SQL executed in Supabase
- [ ] RLS policies tested
- [ ] Environment variables set in Vercel
- [ ] OAuth providers configured
- [ ] Build succeeds without errors
- [ ] Test question creation flow
- [ ] Test voting and commenting
- [ ] Mobile responsive verified
- [ ] Accessibility tested
- [ ] Error boundaries in place
- [ ] Analytics configured
- [ ] Custom domain set (optional)

**🎉 You're ready to launch!**

Visit your site at `https://your-domain.vercel.app/community`

