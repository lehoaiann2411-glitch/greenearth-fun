
-- =============================================
-- PHASE 1: Educational Content & AI Features Schema
-- =============================================

-- 1. Bảng quizzes (bài quiz)
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_vi TEXT,
  description TEXT,
  description_vi TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT DEFAULT 'medium',
  points_reward INTEGER DEFAULT 10,
  image_url TEXT,
  duration_minutes INTEGER DEFAULT 5,
  questions_count INTEGER DEFAULT 0,
  attempts_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bảng quiz_questions (câu hỏi)
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_vi TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  explanation TEXT,
  explanation_vi TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bảng user_quiz_attempts (lịch sử làm quiz)
CREATE TABLE public.user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER GENERATED ALWAYS AS (CASE WHEN total_questions > 0 THEN (score * 100 / total_questions) ELSE 0 END) STORED,
  time_taken_seconds INTEGER,
  answers JSONB DEFAULT '[]',
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Bảng educational_content (video, infographics, articles)
CREATE TABLE public.educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_vi TEXT,
  description TEXT,
  description_vi TEXT,
  content_type TEXT NOT NULL DEFAULT 'video',
  category TEXT NOT NULL DEFAULT 'general',
  media_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  points_reward INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Bảng content_views (theo dõi xem content)
CREATE TABLE public.content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.educational_content(id) ON DELETE CASCADE,
  points_earned INTEGER DEFAULT 0,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- 6. Bảng influencers
CREATE TABLE public.influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  bio_vi TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  platform TEXT NOT NULL DEFAULT 'youtube',
  profile_url TEXT,
  follower_count TEXT,
  specialty TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Bảng waste_scans (lịch sử scan rác)
CREATE TABLE public.waste_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  waste_type TEXT,
  waste_type_vi TEXT,
  material TEXT,
  recyclable BOOLEAN,
  bin_color TEXT,
  disposal_instructions TEXT,
  disposal_instructions_vi TEXT,
  reuse_suggestions JSONB DEFAULT '[]',
  environmental_note TEXT,
  environmental_note_vi TEXT,
  points_earned INTEGER DEFAULT 2,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Bảng chatbot_conversations (lịch sử chat với Green Buddy)
CREATE TABLE public.chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  messages JSONB DEFAULT '[]',
  messages_count INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX idx_quizzes_category ON public.quizzes(category);
CREATE INDEX idx_quizzes_published ON public.quizzes(is_published);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_user_quiz_attempts_user_id ON public.user_quiz_attempts(user_id);
CREATE INDEX idx_user_quiz_attempts_quiz_id ON public.user_quiz_attempts(quiz_id);
CREATE INDEX idx_educational_content_type ON public.educational_content(content_type);
CREATE INDEX idx_educational_content_category ON public.educational_content(category);
CREATE INDEX idx_educational_content_published ON public.educational_content(is_published);
CREATE INDEX idx_content_views_user_id ON public.content_views(user_id);
CREATE INDEX idx_waste_scans_user_id ON public.waste_scans(user_id);
CREATE INDEX idx_chatbot_conversations_user_id ON public.chatbot_conversations(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Quizzes policies
CREATE POLICY "Published quizzes are viewable by everyone" ON public.quizzes
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage quizzes" ON public.quizzes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Quiz questions policies
CREATE POLICY "Questions of published quizzes are viewable" ON public.quiz_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND is_published = true)
  );

CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User quiz attempts policies
CREATE POLICY "Users can view their own attempts" ON public.user_quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts" ON public.user_quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON public.user_quiz_attempts
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Educational content policies
CREATE POLICY "Published content is viewable by everyone" ON public.educational_content
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage content" ON public.educational_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Content views policies
CREATE POLICY "Users can view their own content views" ON public.content_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content views" ON public.content_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Influencers policies
CREATE POLICY "Influencers are viewable by everyone" ON public.influencers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage influencers" ON public.influencers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Waste scans policies
CREATE POLICY "Users can view their own scans" ON public.waste_scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans" ON public.waste_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans" ON public.waste_scans
  FOR DELETE USING (auth.uid() = user_id);

-- Chatbot conversations policies
CREATE POLICY "Users can view their own conversations" ON public.chatbot_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON public.chatbot_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.chatbot_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON public.chatbot_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS for auto-updating counts
-- =============================================

-- Update quiz questions count
CREATE OR REPLACE FUNCTION public.update_quiz_questions_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE quizzes SET questions_count = questions_count + 1 WHERE id = NEW.quiz_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE quizzes SET questions_count = GREATEST(questions_count - 1, 0) WHERE id = OLD.quiz_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_quiz_questions_count
AFTER INSERT OR DELETE ON public.quiz_questions
FOR EACH ROW EXECUTE FUNCTION public.update_quiz_questions_count();

-- Update quiz attempts count
CREATE OR REPLACE FUNCTION public.update_quiz_attempts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE quizzes SET attempts_count = attempts_count + 1 WHERE id = NEW.quiz_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_quiz_attempts_count
AFTER INSERT ON public.user_quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_quiz_attempts_count();

-- Update content view count
CREATE OR REPLACE FUNCTION public.update_content_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE educational_content SET view_count = view_count + 1 WHERE id = NEW.content_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_content_view_count
AFTER INSERT ON public.content_views
FOR EACH ROW EXECUTE FUNCTION public.update_content_view_count();

-- Update chatbot messages count
CREATE OR REPLACE FUNCTION public.update_chatbot_messages_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.messages_count := jsonb_array_length(COALESCE(NEW.messages, '[]'::jsonb));
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_chatbot_messages_count
BEFORE UPDATE ON public.chatbot_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_chatbot_messages_count();
