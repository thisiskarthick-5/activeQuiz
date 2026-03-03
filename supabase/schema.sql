-- ============================================
-- AI Quiz Platform - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  quiz_code TEXT UNIQUE NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  num_questions INTEGER DEFAULT 10,
  randomize BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation TEXT
);

-- 4. Student Quiz Attempts table
CREATE TABLE IF NOT EXISTS public.student_quiz (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}',
  score INTEGER,
  time_taken INTEGER, -- in seconds
  violations INTEGER DEFAULT 0,
  rank INTEGER,
  submitted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, quiz_id)
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quiz ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, insert/update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Quizzes: teachers can CRUD own, students can read
CREATE POLICY "Quizzes viewable by everyone" ON public.quizzes
  FOR SELECT USING (true);

CREATE POLICY "Teachers can create quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own quizzes" ON public.quizzes
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own quizzes" ON public.quizzes
  FOR DELETE USING (auth.uid() = teacher_id);

-- Questions: viewable by everyone, managed by quiz teacher
CREATE POLICY "Questions viewable by everyone" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Teachers can manage questions" ON public.questions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND teacher_id = auth.uid())
  );

-- Student Quiz: students can manage own attempts, teachers can view
CREATE POLICY "Student quiz viewable by participant and teacher" ON public.student_quiz
  FOR SELECT USING (
    auth.uid() = student_id OR
    EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND teacher_id = auth.uid())
  );

CREATE POLICY "Students can create attempts" ON public.student_quiz
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own attempts" ON public.student_quiz
  FOR UPDATE USING (auth.uid() = student_id);
