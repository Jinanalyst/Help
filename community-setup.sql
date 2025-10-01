-- ================================================
-- COMMUNITY Q&A DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ================================================

-- Step 1: Extend questions table with community features
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

-- Step 2: Question likes table
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

-- Step 3: Question votes table (upvote/downvote)
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

-- Step 4: Question bookmarks table
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

-- Step 5: Answers table
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

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_vote_score ON answers(vote_score DESC);

-- Step 6: Answer votes table
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

-- Step 7: Answer comments table
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

CREATE INDEX IF NOT EXISTS idx_answer_comments_answer_id ON answer_comments(answer_id);

-- ================================================
-- DATABASE FUNCTIONS
-- ================================================

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

-- ================================================
-- SETUP COMPLETE!
-- ================================================
-- Verify setup:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT proname FROM pg_proc WHERE proname LIKE '%question%' OR proname LIKE '%answer%';

