-- ============================================
-- Dinner App Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. 用戶表 (users) - 存储 email/phone 登錄資訊
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 家庭表 (families)
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 家庭成員表 (family_members)
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT DEFAULT '子女',
  is_owner BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- 4. 每日回覆表 (daily_responses)
CREATE TABLE IF NOT EXISTS public.daily_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('yes', 'no', 'unknown')) DEFAULT 'unknown',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id, date)
);

-- 5. 邀請碼表 (invites) - 如果需要更複雜的邀請管理
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  used_by UUID REFERENCES public.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(code)
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Users: 用戶只能讀寫自己的資料
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to manage users (for initial setup)
CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Families: 家庭成員可以讀取家庭資料
CREATE POLICY "Family members can view families" ON public.families
  FOR SELECT USING (
    id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

-- Family members: 成員只能讀取自己家庭的成員
CREATE POLICY "Members can view family members" ON public.family_members
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

-- Daily responses: 成員只能讀寫自己家庭的回覆
CREATE POLICY "Members can view responses" ON public.daily_responses
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can insert responses" ON public.daily_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can update responses" ON public.daily_responses
  FOR UPDATE USING (user_id = auth.uid());

-- Invites: 邀請碼可以公開讀取 (用於加入家庭)
CREATE POLICY "Anyone can view invites" ON public.invites
  FOR SELECT USING (true);

CREATE POLICY "Family members can create invites" ON public.invites
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid() AND is_owner = true)
  );

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_responses_date ON public.daily_responses(date);
CREATE INDEX IF NOT EXISTS idx_daily_responses_family_date ON public.daily_responses(family_id, date);
CREATE INDEX IF NOT EXISTS idx_invites_code ON public.invites(code);

-- ============================================
-- Helper Functions
-- ============================================

-- 自動生成邀請碼的函數
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Auth Hook: 自動創建用戶記錄
-- ============================================

-- 當新用戶註冊時，自動在 users 表創建記錄
-- 注意：這需要 Supabase Auth Hook 或使用 Edge Functions
-- 這裡提供一個簡化的方法：在客戶端登錄後創建
