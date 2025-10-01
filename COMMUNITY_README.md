# Community Q&A Feature - Complete Guide

## ✨ Features Implemented

### 1. **Community Feed (`/community`)**
- ✅ Large rounded search bar matching reference screenshot
- ✅ Scrollable filter chips (All, Breaking, Summary, Insight, Analysis, Crypto, Macro, Energy, Important, Earnings)
- ✅ Sort buttons (Latest, Hot, Most Voted) with segment style
- ✅ Total count + last updated timestamp
- ✅ Refresh button with spinning animation
- ✅ Question cards with:
  - Category tag (colored badge)
  - Source + timestamp
  - Title (bold, 18-20px)
  - Excerpt (2-3 lines clamped)
  - Related tickers/tags as chips
  - Action buttons: Like, Comment, Share, Vote (▲/▼), Bookmark, Views
- ✅ Infinite scroll with IntersectionObserver
- ✅ Skeleton loaders for loading states
- ✅ Empty state with "Ask a question" CTA
- ✅ Responsive design (mobile, tablet, desktop)

### 2. **Question Detail (`/question/:id`)**
- ✅ Breadcrumb navigation
- ✅ Question header with category, author, date, views
- ✅ Title + markdown-rendered body
- ✅ Tags as chips
- ✅ Action bar: Like, Share, Bookmark, Vote (with counters)
- ✅ Answers section with sort (Most Voted / Latest)
- ✅ Markdown answer editor with preview tab
- ✅ Answer cards with:
  - Author avatar (gradient circle with initial)
  - Author name + timestamp
  - "Accepted" badge (if applicable)
  - Markdown content
  - Vote buttons (inline)
  - Comment toggle
  - Threaded comments (1 level)
- ✅ Optimistic UI updates for all actions
- ✅ Auth gating for all interactive features

### 3. **Ask Question Page (`/ask`)**
- ✅ Clean centered form
- ✅ Title input (required, 200 char limit)
- ✅ Body textarea (required, 5000 char limit, markdown supported)
- ✅ Tags input (chips, max 5, add/remove)
- ✅ Category dropdown
- ✅ Character counters for all fields
- ✅ Submit disabled until title + body present
- ✅ Redirects to question detail after success
- ✅ Korean UI labels matching screenshot style

### 4. **Auth Gating**
- ✅ All actions (like, vote, comment, answer, bookmark) check auth
- ✅ Redirect to `/login?returnUrl=<current>` if not authenticated
- ✅ Optimistic updates with error rollback
- ✅ Session verification on all POST requests

### 5. **UX Details**
- ✅ Pill-style chips with 12px radius
- ✅ Active chips filled (dark background)
- ✅ Horizontal scroll on mobile for chips
- ✅ Vote buttons with ▲/▼ and counts
- ✅ Double-click vote toggle support
- ✅ Hover shadow on cards
- ✅ Focus rings for accessibility
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Smooth animations and transitions

## 🎨 Design System

### Colors
- **Primary**: `#6366f1` (Indigo-500)
- **Accent**: `#2563eb` (Blue-600)
- **Success**: `#10b981` (Green-500)
- **Danger**: `#ef4444` (Red-500)
- **Text**: `#111827` (Gray-900)
- **Muted**: `#6b7280` (Gray-500)
- **Border**: `#e5e7eb` (Gray-200)
- **Background**: `#f8fafc` (Slate-50)

### Typography
- **Title**: 18-20px, bold
- **Body**: 14-16px, regular
- **Meta**: 12-13px, gray
- **Buttons**: 13-14px, medium

### Spacing
- **Card padding**: 20px
- **Gap between cards**: 16px
- **Input padding**: 12-14px
- **Button padding**: 10-16px horizontal

### Border Radius
- **Cards**: 12px
- **Chips**: 12px
- **Search**: 9999px (full round)
- **Buttons**: 6-8px
- **Inputs**: 8px

## 📁 File Structure

```
app/
├── community/
│   └── page.tsx                    # Feed page
├── question/
│   └── [id]/
│       └── page.tsx                # Detail page
├── ask/
│   └── page.tsx                    # Ask form
└── api/
    └── community/
        ├── questions/
        │   ├── route.ts            # GET list, POST create
        │   └── [id]/
        │       ├── route.ts        # GET single
        │       ├── like/route.ts
        │       ├── vote/route.ts
        │       ├── bookmark/route.ts
        │       ├── view/route.ts
        │       └── answers/
        │           └── route.ts    # GET/POST answers
        └── answers/
            └── [id]/
                ├── vote/route.ts
                └── comments/route.ts

components/
└── community/
    ├── QuestionCard.tsx            # Feed card
    ├── FilterChips.tsx             # Scrollable filters
    ├── SortBar.tsx                 # Sort + meta + refresh
    ├── QuestionSkeleton.tsx        # Loading state
    ├── EmptyState.tsx              # No results
    ├── AnswerEditor.tsx            # Markdown editor
    ├── AnswerCard.tsx              # Answer with comments
    └── QuestionActions.tsx         # Like/share/vote bar

styles/
├── community.css                   # Feed styles
└── question-detail.css             # Detail page styles
```

## 🗄️ Database Schema

See `SUPABASE_COMMUNITY_SETUP.md` for complete schema and setup instructions.

**Key Tables:**
- `questions` - Main Q&A posts
- `question_likes` - Like tracking
- `question_votes` - Upvote/downvote
- `question_bookmarks` - Saved questions
- `answers` - Answers to questions
- `answer_votes` - Answer voting
- `answer_comments` - Threaded comments

## 🚀 Getting Started

### 1. Database Setup
```bash
# Run SQL from SUPABASE_COMMUNITY_SETUP.md in Supabase SQL Editor
# This creates all tables, policies, and functions
```

### 2. Environment Variables
Already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Test the Flow
1. Visit http://localhost:3000/community
2. Click "질문하기" (Ask Question)
3. Sign in if not authenticated
4. Fill out the form and submit
5. View your question in the feed
6. Click to see details
7. Add an answer
8. Vote, like, bookmark, comment

## 🎯 API Endpoints

### Questions
- `GET /api/community/questions` - List questions (with filters, sort, pagination)
- `POST /api/questions` - Create new question
- `GET /api/community/questions/:id` - Get single question
- `POST /api/community/questions/:id/like` - Like/unlike
- `POST /api/community/questions/:id/vote` - Upvote/downvote
- `POST /api/community/questions/:id/bookmark` - Bookmark/unbookmark
- `POST /api/community/questions/:id/view` - Increment view count

### Answers
- `GET /api/community/questions/:id/answers` - List answers (sorted)
- `POST /api/community/questions/:id/answers` - Create answer
- `POST /api/community/answers/:id/vote` - Vote on answer
- `POST /api/community/answers/:id/comments` - Add comment

## 🔒 Security

- ✅ All mutations require authentication
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only edit/delete their own content
- ✅ Session verification on server-side
- ✅ Input validation and sanitization
- ✅ CSRF protection via Supabase

## ♿ Accessibility

- ✅ Semantic HTML (`<button>`, `<form>`, `<article>`)
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus visible rings
- ✅ Screen reader announcements for actions
- ✅ Color contrast meeting WCAG AA

## 📱 Responsive Design

### Desktop (> 768px)
- 6-column filter chips
- Side-by-side vote + views
- Full action bar

### Tablet (481-768px)
- 4-column chips
- Wrapped actions

### Mobile (≤ 480px)
- 3-column chips with horizontal scroll
- Stacked actions
- Full-width buttons
- Smaller fonts

## 🧪 Testing Checklist

- [ ] Feed loads with questions
- [ ] Filters work (category, search)
- [ ] Sort changes order (Latest, Hot, Most Voted)
- [ ] Infinite scroll loads more
- [ ] Clicking card navigates to detail
- [ ] Like/vote/bookmark work (optimistic + persisted)
- [ ] Auth gating redirects to login
- [ ] Ask form validates and creates question
- [ ] Answer editor posts successfully
- [ ] Comments thread properly
- [ ] Mobile responsive layout works
- [ ] Keyboard navigation functional
- [ ] Loading skeletons show
- [ ] Empty state displays

## 🎨 Screenshot Reference Match

The implementation matches the reference screenshot with:
- ✅ Top rounded search bar
- ✅ Filter chips row (scrollable)
- ✅ Sort segment buttons + meta info
- ✅ Cards with tags, title, excerpt, tickers
- ✅ Action buttons (like, comment, share, vote, bookmark, views)
- ✅ Right-aligned metadata
- ✅ Soft shadows on hover
- ✅ Clean, minimal aesthetic

## 📝 Next Steps (Optional Enhancements)

1. **Rich text editor** - Replace textarea with WYSIWYG
2. **Image uploads** - Allow images in questions/answers
3. **Notifications** - Alert users of new answers/comments
4. **Reputation system** - Award points for helpful answers
5. **Search improvements** - Full-text search with ranking
6. **Moderation tools** - Flag, report, admin panel
7. **Analytics** - Track views, engagement, popular topics
8. **Email digest** - Weekly summary of top questions

## 🐛 Troubleshooting

**Feed not loading:**
- Check Supabase connection
- Verify RLS policies allow SELECT
- Check browser console for errors

**Actions not working:**
- Ensure user is logged in
- Check RLS policies for INSERT/UPDATE
- Verify database functions exist

**Votes not persisting:**
- Run database functions from setup guide
- Check for unique constraint violations

**Slow performance:**
- Add indexes (see setup guide)
- Limit query results
- Enable Supabase caching

---

**Built with:**
- Next.js 14 App Router
- TypeScript
- Supabase (Auth + Database)
- Tailwind CSS (via custom CSS)
- React Hooks

**Deployed:**
- Frontend: Vercel
- Backend: Supabase

**Designed by:** Reference screenshot style  
**Developed by:** AI Assistant  
**License:** MIT

