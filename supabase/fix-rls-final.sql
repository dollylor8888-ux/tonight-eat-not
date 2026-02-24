-- ============================================
-- COMPLETE RLS FIX - Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Disable RLS on all tables
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites DISABLE ROW LEVEL SECURITY;

-- Step 2: Clear all existing policies
DROP POLICY IF EXISTS "allow_authenticated_members" ON public.family_members;
DROP POLICY IF EXISTS "allow_authenticated_families" ON public.families;
DROP POLICY IF EXISTS "allow_authenticated_responses" ON public.daily_responses;
DROP POLICY IF EXISTS "auth_all_families" ON public.families;
DROP POLICY IF EXISTS "auth_all_members" ON public.family_members;
DROP POLICY IF EXISTS "auth_all_responses" ON public.daily_responses;
DROP POLICY IF EXISTS "auth_all_users" ON public.users;
DROP POLICY IF EXISTS "public_families" ON public.families;
DROP POLICY IF EXISTS "public_members" ON public.family_members;
DROP POLICY IF EXISTS "public_responses" ON public.daily_responses;
DROP POLICY IF EXISTS "public_users" ON public.users;
DROP POLICY IF EXISTS "anyone_read_invites" ON public.invites;
DROP POLICY IF EXISTS "public_read_invites" ON public.invites;

-- Step 3: Enable RLS fresh
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Step 4: Create SIMPLE permissive policies (no subqueries to avoid recursion)
-- Users: Allow all authenticated operations
CREATE POLICY "users_all" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT TO authenticated WITH CHECK (true);

-- Families: Allow all authenticated operations
CREATE POLICY "families_all" ON public.families FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "families_insert" ON public.families FOR INSERT TO authenticated WITH CHECK (true);

-- Family Members: Allow all authenticated operations
CREATE POLICY "members_all" ON public.family_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "members_insert" ON public.family_members FOR INSERT TO authenticated WITH CHECK (true);

-- Daily Responses: Allow all authenticated operations
CREATE POLICY "responses_all" ON public.daily_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "responses_insert" ON public.daily_responses FOR INSERT TO authenticated WITH CHECK (true);

-- Invites: Public can read, authenticated can insert
CREATE POLICY "invites_select" ON public.invites FOR SELECT TO public USING (true);
CREATE POLICY "invites_insert" ON public.invites FOR INSERT TO authenticated WITH CHECK (true);

-- Done!
SELECT 'RLS policies reset successfully!' as result;
