-- ============================================
-- Dinner App - Fix RLS Policies for Authenticated Users
-- Run in Supabase SQL Editor
-- ============================================

-- Step 1: Disable RLS temporarily for families and members tables (for testing)
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses DISABLE ROW LEVEL SECURITY;

-- Step 2: Or use more permissive policies

-- Re-enable with better policies:
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to do anything with families (for now)
CREATE POLICY "allow_authenticated_families" ON public.families
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to do anything with members
CREATE POLICY "allow_authenticated_members" ON public.family_members
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to do anything with responses
CREATE POLICY "allow_authenticated_responses" ON public.daily_responses
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Users table - allow auth
CREATE POLICY "allow_authenticated_users" ON public.users
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Invites - allow public read
DROP POLICY IF EXISTS "Anyone can view invites" ON public.invites;
CREATE POLICY "anyone_read_invites" ON public.invites FOR SELECT USING (true);
