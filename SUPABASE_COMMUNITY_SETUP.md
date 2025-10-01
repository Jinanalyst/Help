# Supabase Community Setup Guide

This guide extends the main `SUPABASE_SETUP.md` with additional tables and functions for the community Q&A feature.

## Additional Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Extend questions table with community features
ALTER TABLE questions ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE questions ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS vote_score INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS source TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_questions_like_count ON questions(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_questions_vote_score ON questions(vote_score DESC);

-- Question likes table
CREATE TABLE IF NOT EXISTS question_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

ALTER TABLE question_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can like questions" 
  ON question_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike questions" 
  ON question_likes FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Likes are viewable by everyone" 
  ON question_likes FOR SELECT 
  USING (true);

-- Question votes table (upvote/downvote)
CREATE TABLE IF NOT EXISTS question_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote on questions" 
  ON question_votes FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Votes are viewable by everyone" 
  ON question_votes FOR SELECT 
  USING (true);

-- Question bookmarks table
CREATE TABLE IF NOT EXISTS question_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

ALTER TABLE question_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can bookmark questions" 
  ON question_bookmarks FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  vote_score INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Answers are viewable by everyone" 
  ON answers FOR SELECT 
  USING (true);

CREATE POLICY "Users can create answers" 
  ON answers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers" 
  ON answers FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answers" 
  ON answers FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_vote_score ON answers(vote_score DESC);

-- Answer votes table
CREATE TABLE IF NOT EXISTS answer_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(answer_id, user_id)
);

ALTER TABLE answer_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote on answers" 
  ON answer_votes FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Answer votes are viewable by everyone" 
  ON answer_votes FOR SELECT 
  USING (true);

-- Answer comments table
CREATE TABLE IF NOT EXISTS answer_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE answer_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" 
  ON answer_comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can create comments" 
  ON answer_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON answer_comments FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX idx_answer_comments_answer_id ON answer_comments(answer_id);
```

## Database Functions

Create these PostgreSQL functions for counter increments/decrements:

```sql
-- Increment question likes
CREATE OR REPLACE FUNCTION increment_question_likes(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE questions SET like_count = like_count + 1 WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement question likes
CREATE OR REPLACE FUNCTION decrement_question_likes(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE questions SET like_count = GREATEST(like_count - 1, 0) WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- Increment question votes
CREATE OR REPLACE FUNCTION increment_question_votes(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE questions SET vote_score = vote_score + 1 WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement question votes
CREATE OR REPLACE FUNCTION decrement_question_votes(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE questions SET vote_score = vote_score - 1 WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- Increment question views
CREATE OR REPLACE FUNCTION increment_question_views(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE questions SET view_count = view_count + 1 WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- Increment answer votes
CREATE OR REPLACE FUNCTION increment_answer_votes(answer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE answers SET vote_score = vote_score + 1 WHERE id = answer_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement answer votes
CREATE OR REPLACE FUNCTION decrement_answer_votes(answer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE answers SET vote_score = vote_score - 1 WHERE id = answer_id;
END;
$$ LANGUAGE plpgsql;
```

## Add Author Name to Queries

To include author names in responses, modify your queries to join with the `auth.users` table:

```sql
-- Example query to get questions with author info
SELECT 
  q.*,
  u.email as author_email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as author_name
FROM questions q
LEFT JOIN auth.users u ON q.user_id = u.id
ORDER BY q.created_at DESC;
```

## Testing the Setup

1. **Create a test question:**
   ```bash
   curl -X POST http://localhost:3000/api/questions \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test question",
       "description": "This is a test",
       "category": "General",
       "tags": ["test"],
       "userId": "your-user-id"
     }'
   ```

2. **Verify in Supabase:**
   - Go to Supabase Dashboard → Table Editor
   - Check `questions` table for the new entry
   - Verify RLS policies are working

3. **Test voting:**
   - Like/unlike questions
   - Upvote/downvote questions
   - Check counter increments in database

## Permissions Checklist

- [ ] All tables have Row Level Security enabled
- [ ] Users can read all questions/answers/comments
- [ ] Users can only create/edit/delete their own content
- [ ] Vote and bookmark tables restrict modifications to the authenticated user
- [ ] Functions for incrementing counters are created
- [ ] Indexes are created for performance

## Migration to Production

When deploying to production:

1. Run all SQL commands in production Supabase project
2. Test all endpoints with production credentials
3. Verify RLS policies are working correctly
4. Monitor query performance with Supabase logs
5. Set up database backups

## Troubleshooting

- **"permission denied" errors**: Check RLS policies
- **Votes not updating**: Verify functions are created
- **Slow queries**: Check indexes are created
- **Author names not showing**: Ensure proper JOIN with auth.users

---

For the base setup (auth, initial tables), see `SUPABASE_SETUP.md`.

