-- ============================================
-- Dinner App Database Schema - Updated RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies if any (for fresh start)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Family members can view families" ON public.families;
DROP POLICY IF EXISTS "Members can view family members" ON public.family_members;
DROP POLICY IF EXISTS "Members can view responses" ON public.daily_responses;
DROP POLICY IF EXISTS "Members can insert responses" ON public.daily_responses;
DROP POLICY IF EXISTS "Members can update responses" ON public.daily_responses;
DROP POLICY IF EXISTS "Anyone can view invites" ON public.invites;
DROP POLICY IF EXISTS "Family members can create invites" ON public.invites;

-- ============================================
-- RLS Policies
-- ============================================

-- Users: 所有人可以創建帳戶 (signup)
CREATE POLICY "Allow for users all insert" ON public.users
  FOR INSERT WITH CHECK (true);

-- Users: 用戶只能讀寫自己的資料
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Families: 所有人都可以創建家庭 (需要認證用戶)
CREATE POLICY "Authenticated users can create families" ON public.families
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Families: 家庭成員可以讀取家庭資料
CREATE POLICY "Family members can view families" ON public.families
  FOR SELECT USING (
    id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

-- Family members: 所有人都可以創建成員 (需要認證)
CREATE POLICY "Authenticated users can create members" ON public.family_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Family members: 成員只能讀取自己家庭的成員
CREATE POLICY "Members can view family members" ON public.family_members
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

-- Daily responses: 所有人都可以創建回覆 (需要認證)
CREATE POLICY "Authenticated users can create responses" ON public.daily_responses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Daily responses: 成員只能讀取自己家庭的回覆
CREATE POLICY "Members can view responses" ON public.daily_responses
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

-- Daily responses: 成員可以更新自己既回覆
CREATE POLICY "Members can update own responses" ON public.daily_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Invites: 邀請碼可以公開讀取
CREATE POLICY "Anyone can view invites" ON public.invites
  FOR SELECT USING (true);

-- Invites: 家庭成員可以創建邀請
CREATE POLICY "Family members can create invites" ON public.invites
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid() AND is_owner = true)
  );
